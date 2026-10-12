import React from 'react';
import { Clock } from 'lucide-react';

export default function KDSCard({ item, onUpdateStatus }) {
  const minutesWaiting = Math.floor(
    (Date.now() - new Date(item.createdAt || item.orderCreatedAt).getTime()) / 60000
  );
  const isDelayed = minutesWaiting >= 15;

  return (
    <div
      className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between transition shadow-lg ${
        item.status === 'READY'
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : isDelayed
          ? 'border-red-500/40'
          : 'border-neutral-800'
      }`}
    >
      <div className="space-y-3">
        {/* Header do Card: Mesa e Tempo */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <span className="text-lg font-extrabold text-white">
            Mesa {String(item.orderTable).padStart(2, '0')}
          </span>
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
              isDelayed ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {minutesWaiting}m
          </div>
        </div>

        {/* Produto e Quantidade */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-orange-400">{item.quantity}x</span>
            <span className="text-base font-semibold text-white leading-tight">
              {item.Product?.name || 'Item do Cardápio'}
            </span>
          </div>

          {/* Observações / Personalização do Cliente */}
          {item.notes && (
            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-medium">
              ⚠️ Obs: {item.notes}
            </div>
          )}
        </div>
      </div>

      {/* Ações de Status */}
      <div className="pt-4 border-t border-neutral-800 mt-4 flex gap-2">
        {item.status === 'QUEUED' || item.status === 'PENDING' ? (
          <button
            onClick={() => onUpdateStatus(item.OrderId, item.id, 'PREPARING')}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition active:scale-95"
          >
            Iniciar Preparo
          </button>
        ) : item.status === 'PREPARING' ? (
          <button
            onClick={() => onUpdateStatus(item.OrderId, item.id, 'READY')}
            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-600/20 active:scale-95"
          >
            Pronto p/ Entrega ✓
          </button>
        ) : (
          <div className="w-full text-center py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
            Aguardando Garçom Levar
          </div>
        )}
      </div>
    </div>
  );
}
