// src/components/CryptoCard.tsx
import { useEffect, useRef } from 'react';
import { CryptoData } from '@/types/crypto';
import { createChart, CandlestickSeries, ColorType, CandlestickData } from 'lightweight-charts';

const COIN_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'BNB', 'SOL': 'Solana', 'XRP': 'XRP',
  'DOGE': 'Dogecoin', 'ADA': 'Cardano', 'SHIB': 'Shiba Inu', 'AVAX': 'Avalanche',
  'DOT': 'Polkadot', 'LINK': 'Chainlink', 'TRX': 'TRON', 'MATIC': 'Polygon',
  'NEAR': 'NEAR Protocol', 'LTC': 'Litecoin', 'BCH': 'Bitcoin Cash', 'UNI': 'Uniswap',
  'ICP': 'Internet Computer', 'APT': 'Aptos', 'PEPE': 'Pepe',
};

interface CryptoCardProps {
  crypto: CryptoData;
  onRemove: (symbol: string) => void;
}

export function CryptoCard({ crypto, onRemove }: CryptoCardProps) {
  const isPositive = parseFloat(crypto.changePercent) >= 0;
  const coinFullName = COIN_NAMES[crypto.symbol] || 'Token';
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { 
        background: { type: ColorType.Solid, color: 'transparent' }, 
        textColor: '#94a3b8' 
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4ade80',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#4ade80',
      wickDownColor: '#f87171'
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && crypto.history && crypto.history.length > 0) {
      const uniqueData = Array.from(new Map(crypto.history.map(item => [item.time, item])).values());
      seriesRef.current.setData(uniqueData as CandlestickData[]);
      chartRef.current?.timeScale().fitContent(); 
    }
  }, [crypto.history]);

  return (
    <div className="relative group border border-slate-800 rounded-lg p-6 bg-slate-800/20 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/40 flex flex-col h-full">
      
      <button onClick={() => onRemove(crypto.symbol)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Remover moeda">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex justify-between items-start mb-4 pr-6">
        <div>
          <h2 className="text-xl font-bold leading-none">{crypto.symbol}</h2>
          <span className="text-xs font-medium text-slate-400 mt-1 block">{coinFullName}</span>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded mt-[-4px] ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? '+' : ''}{crypto.changePercent}%
        </span>
      </div>
      
      <div className="text-2xl font-semibold tracking-tight">{crypto.price}</div>

      <div className="h-20 w-full mt-4 flex-grow relative">
        {(!crypto.history || crypto.history.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
            Coletando Klines...
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}