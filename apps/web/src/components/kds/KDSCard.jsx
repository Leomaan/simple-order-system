import React from 'react';
import { Clock } from 'lucide-react';

export default function KDSCard({ item, onUpdateStatus }) {
  const minutesWaiting = Math.floor(
    (Date.now() - new Date(item.createdAt || item.orderCreatedAt).getTime()) / 60000
  );
  const isDelayed = minutesWaiting >= 15;

  return (
    <div
      className={`border rounded-2xl p-4 flex flex-col justify-between transition shadow-sm ${
        item.status === 'READY'
          ? 'border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-500/40'
          : isDelayed
          ? 'border-red-500/50 bg-red-50/40 dark:bg-red-950/20 dark:border-red-500/40'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <div className="space-y-3">
        {/* Header do Card: Mesa e Tempo */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            Mesa {String(item.orderTable).padStart(2, '0')}
          </span>
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${
              isDelayed
                ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{minutesWaiting}m</span>
          </div>
        </div>

        {/* Produto e Quantidade */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {item.quantity}x
            </span>
            <span className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
              {item.Product?.name || 'Item do Cardápio'}
            </span>
          </div>

          {/* Observações / Personalização do Cliente */}
          {item.notes && (
            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-medium">
              Obs: {item.notes}
            </div>
          )}
        </div>
      </div>

      {/* Ações de Status */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 mt-4 flex gap-2">
        {item.status === 'QUEUED' || item.status === 'PENDING' ? (
          <button
            onClick={() => onUpdateStatus(item.OrderId, item.id, 'PREPARING')}
            className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
          >
            Iniciar Preparo
          </button>
        ) : item.status === 'PREPARING' ? (
          <button
            onClick={() => onUpdateStatus(item.OrderId, item.id, 'READY')}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
          >
            Pronto p/ Entrega ✓
          </button>
        ) : (
          <div className="w-full text-center py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
            Aguardando Entrega
          </div>
        )}
      </div>
    </div>
  );
}
