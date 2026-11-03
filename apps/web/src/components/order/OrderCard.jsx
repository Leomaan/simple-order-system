import React, { useState, useEffect } from 'react';
import { STATUS_MAP } from '../constants/orderConstants';
import { isReadyDeliveryItem } from '../../hooks/useKDS';
import { Edit2, Trash2, Clock } from 'lucide-react';

export default function OrderCard({ order, stations = [], categories = [], onClick, onEdit, onDelete }) {
  const [now, setNow] = useState(() => Date.now());

  const isOpen = order.status === 'OPEN';
  const isClosed = order.status === 'CLOSED';
  const orderItems = order.OrderItems || order.items || [];

  const activeItems = orderItems.filter(
    (i) => i.status !== 'DELIVERED' && i.status !== 'CANCELLED'
  );

  useEffect(() => {
    if (!isOpen || activeItems.length === 0) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeItems.length]);

  const status = STATUS_MAP[order.status] || {
    label: order.status,
    color: 'text-stone-600 dark:text-neutral-400 bg-stone-100 dark:bg-neutral-900 border-stone-300 dark:border-neutral-800',
  };
  const orderTotal =
    order.total !== undefined
      ? Number(order.total)
      : orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  const itemCount = orderItems.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const itemNames = orderItems
    .map((i) => i.Product?.name || i.product?.name || i.productName || 'Item')
    .slice(0, 3)
    .join(', ');

  const readyToServeCount = orderItems
    .filter(
      (i) =>
        i.status === 'READY' ||
        ((i.status === 'QUEUED' || i.status === 'PENDING' || !i.status) &&
          isReadyDeliveryItem(i, stations, categories))
    )
    .reduce((sum, i) => sum + Number(i.quantity || 1), 0);

  // Calcula o maior tempo de espera entre os itens ativos da mesa
  const oldestPendingMs =
    activeItems.length > 0
      ? Math.min(
          ...activeItems.map((i) =>
            new Date(i.createdAt || order.createdAt || now).getTime()
          )
        )
      : null;

  const elapsedSeconds =
    oldestPendingMs !== null ? Math.max(0, Math.floor((now - oldestPendingMs) / 1000)) : 0;
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedWaitTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const formatPrice = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div
      onClick={() => onClick(order)}
      className={`w-full group rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer select-none shadow-2xs ${
        isOpen
          ? 'border-[#e4ded4] bg-white hover:border-orange-500/40 hover:bg-[#faf8f4] dark:border-neutral-850 dark:bg-neutral-950/70 dark:hover:border-orange-500/40 dark:hover:bg-neutral-900/40'
          : isClosed
          ? 'border-amber-500/30 bg-amber-50/60 hover:border-amber-500/50 hover:bg-amber-50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10'
          : 'border-[#e4ded4] bg-white/70 opacity-75 hover:border-[#cfc7b8] dark:border-neutral-900 dark:bg-neutral-950/40 dark:hover:border-neutral-750'
      }`}
    >
      {/* Lado Esquerdo: Badge Mesa + Info (Mesa X, Pedido #, Resumo de Itens) */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-xl border font-black text-sm flex items-center justify-center shrink-0 ${
            isOpen
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400'
              : isClosed
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
          }`}
        >
          {order.table}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[#1c1917] dark:text-white font-bold text-sm leading-tight truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Mesa {order.table}
            </h3>
            <span className="text-stone-500 dark:text-neutral-500 text-[10px] font-semibold">
              #{order.id}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${status.color}`}
            >
              {status.label}
            </span>
            {isOpen && readyToServeCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shrink-0">
                {readyToServeCount} p/ servir
              </span>
            )}
            {isOpen && activeItems.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-md border bg-stone-100 dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-800 shrink-0">
                <Clock size={11} />
                <span>{formattedWaitTime}</span>
              </span>
            )}
          </div>
          <p className="text-stone-500 dark:text-neutral-500 text-xs truncate mt-0.5 max-w-md hidden sm:block">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}${
                  itemNames ? `: ${itemNames}${orderItems.length > 3 ? '...' : ''}` : ''
                }`
              : 'Mesa vazia'}
          </p>
        </div>
      </div>

      {/* Lado Direito: Preço Total + Ações */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <span className="text-sm sm:text-base font-extrabold text-[#1c1917] dark:text-white text-right sm:min-w-[85px]">
          {formatPrice(orderTotal)}
        </span>

        <div className="flex items-center gap-1">
          {isOpen && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(order);
              }}
              className="p-1.5 rounded-lg border border-[#e4ded4] dark:border-neutral-800 text-stone-500 dark:text-neutral-400 hover:text-[#1c1917] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
              title="Editar mesa"
            >
              <Edit2 size={13} />
            </button>
          )}

          {onDelete && (!isOpen || itemCount === 0) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
              className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Excluir mesa vazia"
            >
              <Trash2 size={13} />
            </button>
          )}

          <span className="text-xs font-bold text-orange-500 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform ml-1">
            &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
