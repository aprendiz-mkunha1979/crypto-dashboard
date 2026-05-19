// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { DashboardGrid } from '@/components/DashboardGrid';

const PINNED_COINS = ['BTC', 'ETH', 'BNB', 'SOL'];

export default function Home() {
  const { data, isConnected, addCoin, removeCoin } = useCryptoWebSocket();
  const [newSymbol, setNewSymbol] = useState('');
  const [order, setOrder] = useState<string[]>([]);

  const allCryptos = Object.values(data);
  const upCount = allCryptos.filter((c) => parseFloat(c.changePercent) > 0).length;
  const downCount = allCryptos.length - upCount;
  const sentimentPercent = allCryptos.length > 0 ? Math.round((upCount / allCryptos.length) * 100) : 50;

  // Sincronizador de ordem
  useEffect(() => {
    const currentSymbols = Object.keys(data);
    setOrder((prevOrder) => {
      const dynamicSymbols = currentSymbols.filter(sym => !PINNED_COINS.includes(sym));
      if (prevOrder.length === dynamicSymbols.length && prevOrder.every(sym => dynamicSymbols.includes(sym))) {
        return prevOrder; 
      }
      const filtered = prevOrder.filter((sym) => dynamicSymbols.includes(sym));
      const novas = dynamicSymbols.filter((sym) => !filtered.includes(sym));
      return [...filtered, ...novas];
    });
  }, [data]);

  const handleAddCoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      addCoin(newSymbol.toUpperCase());
      setNewSymbol('');
    }
  };

  const btcData = data['BTC'];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <header className="max-w-[1600px] mx-auto border-b border-slate-800 pb-6 mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto<span className="text-blue-500">Dash</span></h1>
          <p className="text-slate-400 mt-2">Terminal de Operações em Tempo Real</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-slate-400">{isConnected ? 'Conectado à Binance' : 'Reconectando...'}</span>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* ◀ SIDEBAR ESQUERDA */}
        <aside className="w-full xl:w-72 flex-shrink-0 space-y-6">
          <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">Sentimento (24h)</h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-slate-100">{sentimentPercent}%</span>
              <span className="text-sm text-slate-400">em alta</span>
            </div>
            <div className="w-full h-2 bg-red-500/80 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500/80 transition-all duration-500" style={{ width: `${sentimentPercent}%` }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs font-medium">
              <span className="text-green-400">{upCount} Subindo</span>
              <span className="text-red-400">{downCount} Caindo</span>
            </div>
          </div>
          
          <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-6">
             <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">Insights</h3>
             {allCryptos.length > 0 ? (
               <div className="space-y-4">
                 <div>
                   <p className="text-xs text-slate-400 mb-1">Maior Alta (24h)</p>
                   <div className="flex items-center space-x-2">
                     <span className="font-bold text-slate-100">
                       {allCryptos.reduce((prev, curr) => parseFloat(prev.changePercent) > parseFloat(curr.changePercent) ? prev : curr).symbol}
                     </span>
                     <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">
                       +{allCryptos.reduce((prev, curr) => parseFloat(prev.changePercent) > parseFloat(curr.changePercent) ? prev : curr).changePercent}%
                     </span>
                   </div>
                 </div>
                 <div className="pt-3 border-t border-slate-800">
                   <p className="text-xs text-slate-400 mb-1">Maior Queda (24h)</p>
                   <div className="flex items-center space-x-2">
                     <span className="font-bold text-slate-100">
                       {allCryptos.reduce((prev, curr) => parseFloat(prev.changePercent) < parseFloat(curr.changePercent) ? prev : curr).symbol}
                     </span>
                     <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded">
                       {allCryptos.reduce((prev, curr) => parseFloat(prev.changePercent) < parseFloat(curr.changePercent) ? prev : curr).changePercent}%
                     </span>
                   </div>
                 </div>
               </div>
             ) : (
               <p className="text-sm text-slate-500">Aguardando dados...</p>
             )}
          </div>
        </aside>

        {/* ▶ CENTRO */}
        <main className="flex-grow space-y-6">
          <form onSubmit={handleAddCoin} className="flex space-x-3 mb-6">
            <input 
              type="text" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Adicionar ticker (ex: DOGE)"
              className="flex-grow max-w-sm px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Adicionar</button>
          </form>

          {/* O GRID MAGNIFICAMENTE ABSTRAÍDO */}
          <DashboardGrid 
            data={data}
            order={order}
            setOrder={setOrder}
            removeCoin={removeCoin}
            pinnedCoins={PINNED_COINS}
          />
        </main>

        {/* ▶ SIDEBAR DIREITA */}
        <aside className="w-full xl:w-80 flex-shrink-0 space-y-6">
          <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-6 sticky top-8">
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">Ação do Preço (BTC)</h3>
            {btcData ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Preço Atual</p>
                  <p className="text-2xl font-bold">{btcData.price}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Máxima 24h</p>
                    <p className="text-sm font-medium text-green-400">{btcData.high24h}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Mínima 24h</p>
                    <p className="text-sm font-medium text-red-400">{btcData.low24h}</p>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-4">
                  <p className="text-xs text-slate-400 mb-1">Volume 24h (BTC)</p>
                  <p className="text-sm font-medium">{btcData.volume}</p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-slate-500">
                Aguardando dados...
              </div>
            )}
          </div>
        </aside>

      </div>
    </main>
  );
}