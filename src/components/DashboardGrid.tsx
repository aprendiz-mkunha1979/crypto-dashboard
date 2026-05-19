// src/components/DashboardGrid.tsx
import { CryptoData } from '@/types/crypto';
import { CryptoCard } from './CryptoCard';

interface DashboardGridProps {
  data: Record<string, CryptoData>;
  order: string[];
  setOrder: React.Dispatch<React.SetStateAction<string[]>>;
  removeCoin: (symbol: string) => void;
  pinnedCoins: string[];
}

export function DashboardGrid({ data, order, setOrder, removeCoin, pinnedCoins }: DashboardGridProps) {
  
  // --- LÓGICA DE DRAG AND DROP ENCAPSULADA ---
  const handleDragStart = (e: React.DragEvent, symbol: string) => {
    e.dataTransfer.setData('cryptoSymbol', symbol);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSymbol: string) => {
    e.preventDefault();
    const draggedSymbol = e.dataTransfer.getData('cryptoSymbol');

    if (draggedSymbol === targetSymbol || !draggedSymbol) return;

    setOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const draggedIndex = newOrder.indexOf(draggedSymbol);
      const targetIndex = newOrder.indexOf(targetSymbol);

      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedSymbol);

      return newOrder;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const dynamicCryptoList = order.map((symbol) => data[symbol]).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: CRIPTOMOEDAS PRINCIPAIS (FIXAS) */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Principais Ativos</h2>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pinnedCoins.map((symbol) => {
            const crypto = data[symbol];
            if (!crypto) return <div key={symbol} className="h-32 border border-slate-800 rounded-lg bg-slate-800/10 animate-pulse" />;
            return <CryptoCard key={crypto.symbol} crypto={crypto} onRemove={removeCoin} />;
          })}
        </section>
      </div>

      {/* SEÇÃO 2: MERCADO GERAL (ARRASTÁVEIS) */}
      <div className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Outros Ativos do Mercado</h2>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dynamicCryptoList.length === 0 ? (
            <div className="col-span-full h-24 border border-slate-800 border-dashed rounded-lg flex items-center justify-center text-slate-600">
              Nenhum ativo adicional sendo monitorado.
            </div>
          ) : (
            dynamicCryptoList.map((crypto) => (
              <div 
                key={crypto.symbol}
                draggable
                onDragStart={(e) => handleDragStart(e, crypto.symbol)}
                onDrop={(e) => handleDrop(e, crypto.symbol)}
                onDragOver={handleDragOver}
                className="cursor-grab active:cursor-grabbing transform transition-transform duration-150 hover:scale-[1.02]"
              >
                <CryptoCard crypto={crypto} onRemove={removeCoin} />
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}