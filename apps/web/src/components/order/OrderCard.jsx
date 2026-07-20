import React from 'react';
import { STATUS_MAP } from '../constants/orderConstants';

export default function OrderCard({ order, onClick, onEdit, onDelete }) {
  const status = STATUS_MAP[order.status];
  const orderTotal = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  
  return (
    <div
      onClick={() => onClick(order)}
      className="group glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col gap-3 cursor-pointer transition-all"
    >
      {/* Top Row: Table badge + Status */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-extrabold text-sm select-none shrink-0">
            {order.table}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-base leading-tight whitespace-nowrap">Mesa {order.table}</span>
            <span className="text-neutral-550 text-[10px] uppercase tracking-wider font-semibold">
              #{order.id} · {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border whitespace-nowrap ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Bottom Row: Total & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-850/60 mt-1">
        <div>
          {orderTotal > 0 ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-neutral-550 text-[10px] font-bold uppercase">Total:</span>
              <span className="text-emerald-400 font-black text-base sm:text-lg">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)}
              </span>
            </div>
          ) : (
            <span className="text-neutral-550 text-xs italic">Sem consumo</span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          {order.status === 'OPEN' && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(order); }}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer active:scale-95"
              title="Editar Mesa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
              </svg>
            </button>
          )}
          {order.status !== 'CLOSED' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
              className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer active:scale-95"
              title="Excluir Pedido"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}