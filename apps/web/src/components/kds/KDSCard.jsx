import React from 'react';
import { Clock, Flame, Check, Zap, Truck } from 'lucide-react';

const STATUS_BADGE = {
  PENDING: {
    label: 'Na Fila',
    classes: 'bg-stone-200/80 text-stone-700 border-stone-300 dark:bg-neutral-800 dark:text-stone-300 dark:border-neutral-700',
  },
  QUEUED: {
    label: 'Na Fila',
    classes: 'bg-stone-200/80 text-stone-700 border-stone-300 dark:bg-neutral-800 dark:text-stone-300 dark:border-neutral-700',
  },
  PREPARING: {
    label: 'Em Preparo',
    classes: 'bg-amber-500/15 text-amber-800 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  READY: {
    label: 'Pronto p/ Entrega',
    classes: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  DELIVERING: {
    label: 'Em Transporte',
    classes: 'bg-sky-500/15 text-sky-800 border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  },
};

export default function KDSCard({ item, onUpdateStatus, onClaimDelivery }) {
  const status = item.status || 'QUEUED';
  const orderId = item.OrderId || item.orderId;
  const minutesWaiting = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(item.createdAt || item.orderCreatedAt || Date.now()).getTime()) / 60000
    )
  );
  const isDelayed = minutesWaiting >= 15 && status !== 'READY' && status !== 'DELIVERING';
  const badge = STATUS_BADGE[status] || STATUS_BADGE.QUEUED;

  return (
    <div
      className={`border rounded-2xl p-4 flex flex-col justify-between transition shadow-xs ${
        status === 'READY'
          ? 'border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/25 dark:border-emerald-500/40'
          : status === 'DELIVERING'
          ? 'border-sky-500/50 bg-sky-50/70 dark:bg-sky-950/25 dark:border-sky-500/40'
          : status === 'PREPARING'
          ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/15 dark:border-amber-500/40'
          : isDelayed
          ? 'border-red-500/50 bg-red-50/60 dark:bg-red-950/20 dark:border-red-500/40'
          : 'bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800'
      }`}
    >
      <div className="space-y-3">
        {/* Header do Card: Mesa, Estação e Tempo */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
              Mesa {String(item.orderTable).padStart(2, '0')}
            </span>
            {item.stationName && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  item.isReadyDelivery
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300'
                    : item.stationSlug === 'bar'
                    ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25 dark:text-cyan-300'
                    : 'bg-orange-500/10 text-orange-700 border-orange-500/25 dark:text-orange-300'
                }`}
              >
                {item.isReadyDelivery ? '⚡ Pronta Entrega' : item.stationName}
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${
              isDelayed
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                : 'bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-neutral-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{minutesWaiting}m</span>
          </div>
        </div>

        {/* Produto, Quantidade e Badge de Status */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {item.quantity}x
              </span>
              <span className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-100 leading-snug">
                {item.Product?.name || item.product?.name || 'Item do Cardápio'}
              </span>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badge.classes}`}>
              {badge.label}
            </span>
          </div>

          {/* Observações / Personalização do Cliente */}
          {item.notes && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-medium">
              Obs: {item.notes}
            </div>
          )}
        </div>
      </div>

      {/* Ações Completas do Ciclo KDS (Cozinha & Expedição/Garçom) */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-neutral-800 mt-4 flex flex-col gap-2">
        {(status === 'QUEUED' || status === 'PENDING') && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus(orderId, item.id, 'PREPARING')}
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 dark:text-orange-600" />
              <span>Iniciar Preparo</span>
            </button>

            {item.isReadyDelivery && (
              <button
                type="button"
                onClick={() => onUpdateStatus(orderId, item.id, 'DELIVERED')}
                title="Despachar item de pronta entrega direto para a mesa"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-stone-50 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Entregar Já ✓</span>
              </button>
            )}
          </div>
        )}

        {status === 'PREPARING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(orderId, item.id, 'READY')}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Pronto p/ Entrega ✓</span>
          </button>
        )}

        {status === 'READY' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onClaimDelivery
                  ? onClaimDelivery(item.id)
                  : onUpdateStatus(orderId, item.id, 'DELIVERING')
              }
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Assumir Entrega 🚀</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(orderId, item.id, 'DELIVERED')}
              title="Confirmar entrega imediata na mesa"
              className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            >
              ✓
            </button>
          </div>
        )}

        {status === 'DELIVERING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(orderId, item.id, 'DELIVERED')}
            className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Entregue na Mesa ✓</span>
          </button>
        )}
      </div>
    </div>
  );
}
