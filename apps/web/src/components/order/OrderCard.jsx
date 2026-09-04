import React from 'react';
import { STATUS_MAP } from '../constants/orderConstants';
import { Edit2, Trash2 } from 'lucide-react';

export default function OrderCard({ order, onClick, onEdit, onDelete }) {
  const status = STATUS_MAP[order.status] || { label: order.status, color: 'text-neutral-400 bg-neutral-900 border-neutral-800' };
  const orderTotal = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  const itemCount = order.OrderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const itemNames = order.OrderItems?.map((i) => i.Product?.name || i.productName || 'Item').slice(0, 3).join(', ');

  const isOpen = order.status === 'OPEN';
  const isClosed = order.status === 'CLOSED';

  const formatPrice = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div
      onClick={() => onClick(order)}
      className={`w-full group rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer select-none ${
        isOpen
          ? 'border-neutral-850 bg-neutral-950/70 hover:border-orange-500/40 hover:bg-neutral-900/40'
          : isClosed
          ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10'
          : 'border-neutral-900 bg-neutral-950/40 opacity-75 hover:border-neutral-750'
      }`}
    >
      {/* Lado Esquerdo: Badge Mesa + Info (Mesa X, Pedido #, Resumo de Itens) */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-xl border font-black text-sm flex items-center justify-center shrink-0 ${
          isOpen
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            : isClosed
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {order.table}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-orange-400 transition-colors">
              Mesa {order.table}
            </h3>
            <span className="text-neutral-500 text-[10px] font-semibold">
              #{order.id}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-neutral-500 text-xs truncate mt-0.5 max-w-md hidden sm:block">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}${itemNames ? `: ${itemNames}${order.OrderItems?.length > 3 ? '...' : ''}` : ''}`
              : 'Mesa vazia'}
          </p>
        </div>
      </div>

      {/* Lado Direito: Preço Total + Ações */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <span className="text-sm sm:text-base font-extrabold text-white text-right sm:min-w-[85px]">
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
              className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Excluir mesa vazia"
            >
              <Trash2 size={13} />
            </button>
          )}

          <span className="text-xs font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform ml-1">
            &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}