// src/hooks/useCryptoWebSocket.ts
import { useState, useEffect } from 'react';
import { CryptoData, BinanceTickerStream } from '../types/crypto';

// Top 20 criptomoedas pareadas com USDT
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

  const addCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    if (!trackedCoins.includes(formattedSymbol)) {
      setTrackedCoins((prev) => [...prev, formattedSymbol]);
    }
  };

  const removeCoin = (symbol: string) => {
    const formattedSymbol = `${symbol.toLowerCase()}usdt`;
    setTrackedCoins((prev) => prev.filter((coin) => coin !== formattedSymbol));
    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[symbol];
      return newData;
    });
  };

  useEffect(() => {
    const streams = trackedCoins.map(coin => `${coin}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      const parsedData: BinanceTickerStream = JSON.parse(event.data);
      const cleanSymbol = parsedData.s.replace('USDT', '');
      const currentPriceNum = parseFloat(parsedData.c);

      setData((prevData) => {
        const prevHistory = prevData[cleanSymbol]?.history || [];
        const newHistory = [...prevHistory, { time: Date.now(), price: currentPriceNum }].slice(-20);

        return {
          ...prevData,
          [cleanSymbol]: {
            symbol: cleanSymbol,
            price: currentPriceNum.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            changePercent: parseFloat(parsedData.P).toFixed(2),
            // --- CAPTURANDO OS NOVOS DADOS DA BINANCE AQUI ---
            high24h: parseFloat(parsedData.h || "0").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            low24h: parseFloat(parsedData.l || "0").toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            volume: parseFloat(parsedData.v || "0").toLocaleString('en-US', { maximumFractionDigits: 0 }),
            // -------------------------------------------------
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