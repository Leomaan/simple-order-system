import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatErrorMessage } from '../util/errorUtil';
import { Plus, X } from 'lucide-react';

const statusLabel = {
  OPEN:   { label: 'Aberto',  color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  PAID:   { label: 'Pago',    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  CLOSED: { label: 'Fechado', color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20' },
};

const STATUSES = ['', 'OPEN', 'PAID', 'CLOSED'];

export default function WaiterOrderSection() {
  const { orders, loading, fetchOrders, createOrder, deleteOrder, totalPages, currentPage, setPage } = useOrders('OPEN');
  const { products } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [table, setTable] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('OPEN');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createOrder({ table: Number(table) });
      setTable('');
      setShowForm(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteOrder(deleting);
      setDeleting(null);
    } catch (err) {
      setError(formatErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleFilter(status) {
    setFilter(status);
    fetchOrders(status || undefined);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {deleting && (
        <ConfirmModal
          title="Excluir pedido vazio?"
          message="Esta mesa não possui nenhum consumo adicionado. Deseja realmente excluí-la?"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          products={products}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => fetchOrders(filter || undefined)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mesas & Pedidos</h2>
          <p className="text-neutral-500 text-sm">Abra novas mesas e gerencie consumos em tempo real</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          className="w-full sm:w-auto py-3 px-5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'Cancelar' : 'Abrir mesa'}</span>
        </Button>
      </div>

      {/* Criar pedido */}
      {showForm && (
        <form 
          onSubmit={handleCreate} 
          className="glass-panel border border-neutral-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-end gap-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex-1 w-full">
            <Input
              type="number"
              label="Número da mesa"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              required
              placeholder="Ex: 5"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 shrink-0">{error}</p>
          )}
          <Button 
            type="submit" 
            loading={saving}
            className="w-full sm:w-auto h-[44px] px-6 text-xs font-bold uppercase tracking-wider shrink-0 shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Abrir mesa</span>
          </Button>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 select-none">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === s 
                ? 'bg-white border-white text-black shadow-lg shadow-white/5' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {s === '' ? 'Todos' : statusLabel[s].label}
          </button>
        ))}
      </div>

      {/* Lista de Pedidos / Mesas (Mesma estrutura, tamanho e organização do Cardápio) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((o) => {
            const orderTotal = o.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
            const itemCount = o.OrderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
            const itemNames = o.OrderItems?.map((i) => i.Product?.name || i.productName || 'Item').slice(0, 2).join(', ');

            const isOpen = o.status === 'OPEN';

            return (
              <div
                key={o.id}
                onClick={() => (isOpen ? setSelectedOrder(o) : null)}
                className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 shadow-xl ${
                  isOpen
                    ? 'border-neutral-800 hover:border-orange-500/50 hover:shadow-orange-500/5 cursor-pointer'
                    : 'border-neutral-900 opacity-60 bg-neutral-950/40 select-none'
                }`}
              >
                {/* Top Banner de Destaque da Mesa (Identico ao produto: h-28) */}
                <div className="h-28 w-full relative bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-neutral-900 flex items-center justify-center overflow-hidden border-b border-neutral-850/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900/80 border border-neutral-750 flex items-center justify-center shadow-lg backdrop-blur-md text-orange-400 font-black text-xl">
                      {o.table}
                    </div>
                  </div>

                  {/* Badge de Status (Top Left) */}
                  <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-md ${statusLabel[o.status].color}`}>
                    {statusLabel[o.status].label}
                  </span>

                  {/* Preço em Destaque no Header (Bottom Right) */}
                  <span className="absolute bottom-3 right-3 text-sm font-extrabold px-3 py-1 rounded-xl bg-orange-500/90 text-white shadow-lg backdrop-blur-md">
                    {orderTotal > 0
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)
                      : 'R$ 0,00'}
                  </span>
                </div>

                {/* Corpo do Card: Nome e Descrição (Identico ao produto) */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight mb-1.5 group-hover:text-orange-400 transition-colors">
                      Mesa {o.table}
                    </h3>
                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                      {itemCount > 0
                        ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}${itemNames ? `: ${itemNames}${o.OrderItems.length > 2 ? '...' : ''}` : ''}`
                        : 'Nenhum consumo lançado nesta mesa.'}
                    </p>
                  </div>

                  {/* Painel Inferior de Controle */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-neutral-850">
                    <div className="flex items-center justify-between gap-2">
                      {isOpen ? (
                        <>
                          <Button
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                            }}
                            className="flex-1 text-xs py-1.5 px-3 font-bold uppercase tracking-wider"
                          >
                            Ver Consumo
                          </Button>
                          {itemCount === 0 && (
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleting(o.id);
                              }}
                              className="text-xs py-1.5 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 font-semibold"
                              title="Excluir mesa vazia"
                            >
                              Excluir
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="w-full text-center text-xs text-neutral-500 py-1 italic">
                          Mesa Encerrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-neutral-850 bg-neutral-900/10 rounded-2xl px-5 py-4 mt-6">
          <p className="text-xs text-neutral-500 font-semibold select-none">
            Mostrando página <span className="text-neutral-350">{currentPage}</span> de <span className="text-neutral-350">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="text-xs py-1.5 px-4"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="text-xs py-1.5 px-4"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}