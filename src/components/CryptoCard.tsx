// src/components/CryptoCard.tsx
import { CryptoData } from '@/types/crypto';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// 1. Dicionário local para mapear as siglas para os nomes completos
const COIN_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'BNB': 'BNB',
  'SOL': 'Solana',
  'XRP': 'XRP',
  'DOGE': 'Dogecoin',
  'ADA': 'Cardano',
  'SHIB': 'Shiba Inu',
  'AVAX': 'Avalanche',
  'DOT': 'Polkadot',
  'LINK': 'Chainlink',
  'TRX': 'TRON',
  'MATIC': 'Polygon',
  'NEAR': 'NEAR Protocol',
  'LTC': 'Litecoin',
  'BCH': 'Bitcoin Cash',
  'UNI': 'Uniswap',
  'ICP': 'Internet Computer',
  'APT': 'Aptos',
  'PEPE': 'Pepe',
  // Caso o usuário adicione uma moeda que não está na lista, o fallback abaixo será usado.
};

interface CryptoCardProps {
  crypto: CryptoData;
  onRemove: (symbol: string) => void;
}

export function CryptoCard({ crypto, onRemove }: CryptoCardProps) {
  const isPositive = parseFloat(crypto.changePercent) >= 0;
  const chartColor = isPositive ? '#4ade80' : '#f87171';
  
  // 2. Busca o nome da moeda no dicionário. Se não achar, usa 'Token' como padrão.
  const coinFullName = COIN_NAMES[crypto.symbol] || 'Token';

  return (
    <div className="relative group border border-slate-800 rounded-lg p-6 bg-slate-800/20 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/40 flex flex-col h-full">
      
      <button 
        onClick={() => onRemove(crypto.symbol)}
        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remover moeda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 3. Ajuste do cabeçalho para acomodar Sigla + Nome Completo */}
      <div className="flex justify-between items-start mb-4 pr-6">
        <div>
          <h2 className="text-xl font-bold leading-none">{crypto.symbol}</h2>
          <span className="text-xs font-medium text-slate-400 mt-1 block">
            {coinFullName}
          </span>
        </div>
        
        <span 
          className={`text-sm font-medium px-2 py-1 rounded mt-[-4px] ${
            isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}{crypto.changePercent}%
        </span>
      </div>
      
      <div className="text-2xl font-semibold tracking-tight">
        {crypto.price}
      </div>

      <div className="h-16 w-full mt-4 flex-grow">
        {(crypto.history?.length || 0) > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crypto.history || []}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} dot={false} isAnimationActive={false}/>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-600">
            Coletando histórico...
          </div>
        )}
      </div>
    </div>
  );
}