// src/types/crypto.ts

export interface CryptoData {
  symbol: string;
  price: string;
  changePercent: string;
  // Nova propriedade: um array de objetos com o tempo e o preço numérico
  history: { time: number; price: number }[]; 
}

export interface BinanceTickerStream {
  s: string;
  c: string;
  P: string;
}

// src/types/crypto.ts
export interface CryptoData {
  symbol: string;
  price: string;
  changePercent: string;
  // --- NOVOS CAMPOS ---
  high24h: string; 
  low24h: string;  
  volume: string;  
  // --------------------
  history: { time: number; price: number }[]; 
}

export interface BinanceTickerStream {
  s: string; // Symbol
  c: string; // Current price
  P: string; // Price change percentage
  // --- NOVOS CAMPOS QUE A BINANCE ENVIA ---
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
}