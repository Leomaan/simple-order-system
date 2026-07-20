import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao criar pedido');
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
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao excluir pedido');
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
          <p className="text-neutral-500 text-sm">Abra novas mesas e adicione consumos</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          className="w-full sm:w-auto py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10"
        >
          {showForm ? 'Cancelar' : '+ Abrir mesa'}
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
            className="w-full sm:w-auto h-[44px] px-6 text-xs font-bold uppercase tracking-wider shrink-0 shadow-md shadow-orange-500/10"
          >
            Abrir mesa
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

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
          {orders.map((o) => {
            const orderTotal = o.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
            return (
              <div
                key={o.id}
                onClick={() => o.status === 'OPEN' ? setSelectedOrder(o) : null}
                className={`glass-card glass-card-hover rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all min-h-[135px] ${
                  o.status === 'OPEN' ? 'cursor-pointer hover:border-neutral-600' : 'opacity-70'
                }`}
              >
                {/* Linha Superior: Mesa + Valor do Pedido */}
                <div className="flex items-start justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-xs shrink-0">
                      {o.table}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-extrabold text-xs sm:text-sm leading-tight whitespace-nowrap">Mesa {o.table}</span>
                      <span className="text-neutral-550 text-[9px] uppercase tracking-wider font-semibold truncate">
                        #{o.id} · {new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

                {/* Área Inferior: Status em Largura Total + Ações */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-850/60 mt-0.5">
                  <span className={`w-full text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-lg border text-center block ${statusLabel[o.status].color}`}>
                    {statusLabel[o.status].label}
                  </span>

                  {o.status === 'OPEN' && (
                    <div className="flex items-center justify-center gap-1.5 w-full">
                      <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setDeleting(o.id); }}
                        className="w-full text-[10px] py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-center"
                        title="Excluir mesa vazia"
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
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