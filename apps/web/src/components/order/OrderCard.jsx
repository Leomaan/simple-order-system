import React from 'react';
import { STATUS_MAP } from '../constants/orderConstants';

export default function OrderCard({ order, onClick, onEdit, onDelete }) {
  const status = STATUS_MAP[order.status];
  const orderTotal = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  
  return (
    <div
      onClick={() => onClick(order)}
      className="group glass-card glass-card-hover rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 cursor-pointer transition-all min-h-[135px]"
    >
      {/* Linha Superior: Mesa + Valor do Pedido */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-extrabold text-xs select-none shrink-0">
            {order.table}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-extrabold text-xs sm:text-sm leading-tight whitespace-nowrap">Mesa {order.table}</span>
            <span className="text-neutral-550 text-[9px] uppercase tracking-wider font-semibold truncate">
              #{order.id} · {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {orderTotal > 0 ? (
            <span className="text-emerald-400 font-bold text-xs sm:text-sm whitespace-nowrap block">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)}
            </span>
          ) : (
            <span className="text-neutral-550 text-[10px] italic block">Sem consumo</span>
          )}
        </div>
      </div>

      {/* Área Inferior: Status em Largura Total + Ações Centralizadas */}
      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-850/60 mt-0.5">
        <span className={`w-full text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-lg border text-center block ${status.color}`}>
          {status.label}
        </span>

        <div className="flex items-center justify-center gap-1.5 w-full sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          {order.status === 'OPEN' && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(order); }}
              className="flex-1 py-1 px-2 text-[10px] font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all cursor-pointer active:scale-95 text-center"
              title="Editar Mesa"
            >
              Editar
            </button>
          )}
          {order.status !== 'CLOSED' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
              className="flex-1 py-1 px-2 text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer active:scale-95 text-center"
              title="Excluir Pedido"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}