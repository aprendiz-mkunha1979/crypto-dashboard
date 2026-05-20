// src/hooks/useCryptoWebSocket.ts
import { useState, useEffect, useRef } from 'react';
import { CryptoData, BinanceTickerStream } from '../types/crypto';

const INITIAL_COINS = [
  'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt', 'dogeusdt',
  'adausdt', 'shibusdt', 'avaxusdt', 'dotusdt', 'linkusdt', 'trxusdt',
  'maticusdt', 'nearusdt', 'ltcusdt', 'bchusdt', 'uniusdt', 'icpusdt',
  'aptusdt', 'pepeusdt'
];

export function useCryptoWebSocket() {
  const [data, setData] = useState<Record<string, CryptoData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [trackedCoins, setTrackedCoins] = useState<string[]>(INITIAL_COINS);
  
  // Usamos um Ref para controlar quais moedas já tiveram o histórico baixado via REST,
  // evitando que a aplicação baixe as mesmas coisas várias vezes e seja bloqueada.
  const historyLoaded = useRef<Set<string>>(new Set());

  const addCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    if (!trackedCoins.includes(formattedSymbol)) {
      setTrackedCoins((prev) => [...prev, formattedSymbol]);
    }
  };

  const removeCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    setTrackedCoins((prev) => prev.filter((coin) => coin !== formattedSymbol));
    
    // Remove do cache de histórico também
    const cleanSymbol = symbol.toUpperCase();
    historyLoaded.current.delete(cleanSymbol);

    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[cleanSymbol];
      return newData;
    });
  };

  useEffect(() => {
    // 1. O PASSADO: Busca o histórico de 15 minutos (Klines) via REST API
    trackedCoins.forEach(async (coin) => {
      const symbol = coin.replace('usdt', '').toUpperCase();
      
      if (!historyLoaded.current.has(symbol)) {
        try {
          // Busca os últimos 20 candles de 15 minutos
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=20`);
          const klines = await res.json();
          
          // A Binance retorna um array gigante. O índice 6 é o tempo de fechamento, e o 4 é o preço de fechamento.
          const history = klines.map((k: any) => ({
            time: k[6], 
            price: parseFloat(k[4])
          }));

          setData(prev => {
            const existingData = prev[symbol];
            return {
              ...prev,
              [symbol]: {
                symbol,
                price: '...',
                changePercent: '0',
                high24h: '...',
                low24h: '...',
                volume: '...',
                ...existingData, // Se o WebSocket já tiver mandado preço atual, preservamos
                history
              }
            };
          });
          
          historyLoaded.current.add(symbol);
        } catch (err) {
          console.error(`Erro ao buscar histórico REST para ${symbol}`, err);
        }
      }
    });

    // 2. O PRESENTE: Conecta o WebSocket para os preços ao vivo
    const streams = trackedCoins.map(coin => `${coin}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      const parsedData: BinanceTickerStream = JSON.parse(event.data);
      const cleanSymbol = parsedData.s.replace('USDT', '');
      const currentPriceNum = parseFloat(parsedData.c);
      const now = Date.now();

      setData((prevData) => {
        const prevCoin = prevData[cleanSymbol];
        const currentHistory = prevCoin?.history || [];
        let newHistory = [...currentHistory];

        if (newHistory.length > 0) {
          const lastPoint = newHistory[newHistory.length - 1];
          
          // Se o momento atual ultrapassou o tempo final do último candle de 15m...
          if (now > lastPoint.time) {
            // ...criamos um NOVO ponto no gráfico (empurrando-o para a frente)
            newHistory.push({ 
              time: now + (15 * 60 * 1000), // Define o alvo para daqui a 15 mins
              price: currentPriceNum 
            });
            // Mantemos sempre no máximo 20 pontos visíveis
            if (newHistory.length > 20) newHistory.shift(); 
          } else {
            // ...senão, estamos dentro dos mesmos 15 minutos, então só atualizamos a altura da ponta da linha
            newHistory[newHistory.length - 1].price = currentPriceNum;
          }
        }

        return {
          ...prevData,
          [cleanSymbol]: {
            ...prevCoin,
            symbol: cleanSymbol,
            price: currentPriceNum.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            changePercent: parseFloat(parsedData.P).toFixed(2),
            high24h: parseFloat(parsedData.h || "0").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            low24h: parseFloat(parsedData.l || "0").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            volume: parseFloat(parsedData.v || "0").toLocaleString('en-US', { maximumFractionDigits: 0 }),
            history: newHistory,
          }
        };
      });
    };

    ws.onerror = () => console.log('Aviso: Conexão do WebSocket caiu.');
    ws.onclose = () => setIsConnected(false);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [trackedCoins]);

  return { data, isConnected, addCoin, removeCoin };
}