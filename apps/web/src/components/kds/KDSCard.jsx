import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const status = item.status || 'QUEUED';
  const orderId = item.OrderId || item.orderId;
  const isNonKitchen = Boolean(
    item.isReadyDelivery || (item.stationSlug && item.stationSlug !== 'cozinha')
  );

  const createdAtMs = new Date(item.createdAt || item.orderCreatedAt || now).getTime();
  const elapsedSeconds = Math.max(0, Math.floor((now - createdAtMs) / 1000));
  const minutesWaiting = Math.floor(elapsedSeconds / 60);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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
                  item.stationSlug === 'pronta-entrega'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300'
                    : item.stationSlug === 'bar'
                    ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25 dark:text-cyan-300'
                    : 'bg-orange-500/10 text-orange-700 border-orange-500/25 dark:text-orange-300'
                }`}
              >
                {item.stationName}
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-semibold tabular-nums px-2 py-0.5 rounded-lg border ${
              isDelayed
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                : 'bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-neutral-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
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
          isNonKitchen ? (
            <button
              type="button"
              onClick={() =>
                onClaimDelivery
                  ? onClaimDelivery(item.id)
                  : onUpdateStatus(orderId, item.id, 'DELIVERING')
              }
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-stone-50 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
            >
              Assumir Entrega
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpdateStatus(orderId, item.id, 'PREPARING')}
              className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
            >
              Iniciar Preparo
            </button>
          )
        )}

        {status === 'PREPARING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(orderId, item.id, 'READY')}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Pronto p/ Entrega
          </button>
        )}

        {status === 'READY' && (
          <button
            type="button"
            onClick={() =>
              onClaimDelivery
                ? onClaimDelivery(item.id)
                : onUpdateStatus(orderId, item.id, 'DELIVERING')
            }
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Assumir Entrega
          </button>
        )}

        {status === 'DELIVERING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(orderId, item.id, 'DELIVERED')}
            className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-stone-50 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Entregue na Mesa
          </button>
        )}
      </div>
    </div>
  );
}
