import React from 'react';
import { STATUS_MAP } from '../constants/orderConstants';
import Button from '../ui/Button';

export default function OrderCard({ order, onClick, onEdit, onDelete }) {
  const status = STATUS_MAP[order.status] || { label: order.status, color: 'text-neutral-400 border-neutral-800' };
  const orderTotal = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  const itemCount = order.OrderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const itemNames = order.OrderItems?.map((i) => i.Product?.name || i.productName || 'Item').slice(0, 2).join(', ');

  const isOpen = order.status === 'OPEN';
  const isClosed = order.status === 'CLOSED';
  const isPaid = order.status === 'PAID';

  return (
    <div
      onClick={() => onClick(order)}
      className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 shadow-xl cursor-pointer ${
        isOpen
          ? 'border-neutral-800 hover:border-orange-500/50 hover:shadow-orange-500/5'
          : isClosed
          ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 hover:shadow-amber-500/5'
          : 'border-neutral-900/80 bg-neutral-950/60 hover:border-neutral-700'
      }`}
    >
      {/* Top Banner de Destaque da Mesa */}
      <div className={`h-28 w-full relative flex items-center justify-center overflow-hidden border-b ${
        isOpen 
          ? 'bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-neutral-900 border-neutral-850/50'
          : isClosed
          ? 'bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-neutral-900 border-amber-500/20'
          : 'bg-gradient-to-b from-blue-500/10 via-neutral-900/60 to-neutral-900 border-neutral-850/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-neutral-900/80 border flex items-center justify-center shadow-lg backdrop-blur-md font-black text-xl ${
            isOpen
              ? 'border-neutral-750 text-orange-400'
              : isClosed
              ? 'border-amber-500/40 text-amber-400'
              : 'border-neutral-800 text-neutral-400'
          }`}>
            {order.table}
          </div>
        </div>

        {/* Badge de Status (Top Left) */}
        <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-md ${status.color}`}>
          {status.label}
        </span>

        {/* Preço em Destaque no Header (Bottom Right) */}
        <span className={`absolute bottom-3 right-3 text-sm font-extrabold px-3 py-1 rounded-xl shadow-lg backdrop-blur-md ${
          isOpen
            ? 'bg-orange-500/90 text-white'
            : isClosed
            ? 'bg-amber-500 text-black font-black'
            : 'bg-neutral-800 text-neutral-300'
        }`}>
          {orderTotal > 0
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)
            : 'R$ 0,00'}
        </span>
      </div>

      {/* Corpo do Card: Nome e Descrição */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-base leading-tight mb-1.5 group-hover:text-orange-400 transition-colors flex items-center justify-between">
            <span>Mesa {order.table}</span>
            {isClosed && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                Aguardando PIX / Pagamento
              </span>
            )}
            {isPaid && (
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-md">
                {order.paymentMethod || 'PAGO'}
              </span>
            )}
          </h3>
          <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}${itemNames ? `: ${itemNames}${order.OrderItems.length > 2 ? '...' : ''}` : ''}`
              : 'Nenhum consumo lançado nesta mesa.'}
          </p>
        </div>

        {/* Painel Inferior de Controle Admin */}
        <div className="flex flex-col gap-2 pt-3 border-t border-neutral-850">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={isClosed ? 'secondary' : 'primary'}
              onClick={(e) => {
                e.stopPropagation();
                onClick(order);
              }}
              className={`flex-1 text-xs py-1.5 px-2 font-bold uppercase tracking-wider ${
                isClosed ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' : ''
              }`}
            >
              {isOpen ? 'Ver Consumo' : isClosed ? 'Cobrar / Detalhes' : 'Ver Recibo'}
            </Button>

            {isOpen && onEdit && (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(order);
                }}
                className="text-xs py-1.5 px-2 border border-neutral-800 hover:border-neutral-700 font-semibold"
              >
                Editar
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(order.id);
                }}
                className="text-xs py-1.5 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 font-semibold"
              >
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}