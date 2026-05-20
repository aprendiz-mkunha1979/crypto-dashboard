// src/types/crypto.ts

// src/types/crypto.ts
export interface CryptoData {
  symbol: string;
  price: string;
  changePercent: string;
  high24h: string; 
  low24h: string;  
  volume: string;  
  
  history: { 
    time: number; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
  }[]; 
}

export interface BinanceTickerStream {
  s: string;
  c: string;
  P: string;
  h: string;
  l: string;
  v: string;
}