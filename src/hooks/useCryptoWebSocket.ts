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
  const historyLoaded = useRef<Set<string>>(new Set());

  const addCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    if (!trackedCoins.includes(formattedSymbol)) setTrackedCoins(prev => [...prev, formattedSymbol]);
  };

  const removeCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    setTrackedCoins(prev => prev.filter(coin => coin !== formattedSymbol));
    const cleanSymbol = symbol.toUpperCase();
    historyLoaded.current.delete(cleanSymbol);
    setData(prev => {
      const newData = { ...prev };
      delete newData[cleanSymbol];
      return newData;
    });
  };

  useEffect(() => {
    // 1. O PASSADO (REST API): Mapeando o OHLC da Binance
    trackedCoins.forEach(async (coin) => {
      const symbol = coin.replace('usdt', '').toUpperCase();
      if (!historyLoaded.current.has(symbol)) {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=20`);
          const klines = await res.json();
          
          const history = klines.map((k: any) => ({
            time: Math.floor(k[0] / 1000), // TradingView usa segundos, não milissegundos
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4])
          }));

          setData(prev => ({
            ...prev,
            [symbol]: {...prev[symbol],
              symbol, price: '...', changePercent: '0', high24h: '...', low24h: '...', volume: '...', history
            }
          }));
          historyLoaded.current.add(symbol);
        } catch (err) {
          console.error(`Erro ao buscar histórico REST para ${symbol}`, err);
        }
      }
    });

    // 2. O PRESENTE (WebSocket): Atualizando o Candlestick
    const streams = trackedCoins.map(coin => `${coin}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      const parsedData: BinanceTickerStream = JSON.parse(event.data);
      const cleanSymbol = parsedData.s.replace('USDT', '');
      const currentPriceNum = parseFloat(parsedData.c);
      const nowMs = Date.now();

      setData(prevData => {
        const prevCoin = prevData[cleanSymbol];
        const currentHistory = prevCoin?.history || [];
        let newHistory = [...currentHistory];

        if (newHistory.length > 0) {
          const lastCandle = { ...newHistory[newHistory.length - 1] };
          
          // Se passou de 15 minutos (900.000 ms) do tempo de abertura da última vela, cria uma nova
          if (nowMs >= (lastCandle.time * 1000) + 900000) {
            newHistory.push({ 
              time: Math.floor(nowMs / 1000), 
              open: currentPriceNum, high: currentPriceNum, low: currentPriceNum, close: currentPriceNum 
            });
            if (newHistory.length > 20) newHistory.shift(); 
          } else {
            // Senão, estamos na mesma vela: atualizamos o fechamento e as extremidades (High/Low)
            lastCandle.close = currentPriceNum;
            lastCandle.high = Math.max(lastCandle.high, currentPriceNum);
            lastCandle.low = Math.min(lastCandle.low, currentPriceNum);
            newHistory[newHistory.length - 1] = lastCandle;
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

    ws.onerror = () => console.log('Aviso: Conexão WS caiu.');
    ws.onclose = () => setIsConnected(false);
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [trackedCoins]);

  return { data, isConnected, addCoin, removeCoin };
}