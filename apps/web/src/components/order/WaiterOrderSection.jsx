import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatErrorMessage } from '../util/errorUtil';

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

      {/* Lista de Pedidos / Mesas (Cards Grandes & Impactantes Estilo POS/PDV) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-neutral-900/50 border border-neutral-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => {
            const orderTotal = o.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
            const itemCount = o.OrderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
            const itemNames = o.OrderItems?.map((i) => i.Product?.name || i.productName || 'Item').slice(0, 3).join(', ');

            const isOpen = o.status === 'OPEN';

            return (
              <div
                key={o.id}
                onClick={() => (isOpen ? setSelectedOrder(o) : null)}
                className={`group relative glass-card rounded-3xl overflow-hidden flex flex-col justify-between border transition-all duration-300 shadow-2xl ${
                  isOpen
                    ? 'border-neutral-800 hover:border-orange-500/60 hover:shadow-orange-500/10 cursor-pointer'
                    : 'border-neutral-900 opacity-60 bg-neutral-950/40 select-none'
                }`}
              >
                {/* Top Banner de Destaque da Mesa */}
                <div className="h-28 w-full relative bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-neutral-900 p-5 flex items-center justify-between border-b border-neutral-850/60">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-2xl shadow-xl backdrop-blur-md">
                      {o.table}
                    </div>
                    <div>
                      <h3 className="text-white font-extrabold text-xl leading-tight">Mesa {o.table}</h3>
                      <p className="text-neutral-400 text-xs font-medium mt-0.5">
                        Pedido #{o.id} · {new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Badge de Status */}
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider py-1.5 px-3.5 rounded-xl border backdrop-blur-md shadow-md ${statusLabel[o.status].color}`}>
                    {statusLabel[o.status].label}
                  </span>
                </div>

                {/* Corpo do Card: Resumo de Consumo */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-850 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">Consumo Atual</span>
                      <p className="text-neutral-300 text-xs truncate mt-1">
                        {itemCount > 0
                          ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}${itemNames ? ` (${itemNames}${o.OrderItems.length > 3 ? '...' : ''})` : ''}`
                          : 'Nenhum consumo lançado'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {orderTotal > 0 ? (
                        <span className="text-emerald-400 font-black text-xl block leading-tight">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-xs italic font-medium block">R$ 0,00</span>
                      )}
                    </div>
                  </div>

                  {/* Botões Grandes de Ação (Touch-Friendly) */}
                  <div className="flex items-center gap-2 pt-1">
                    {isOpen ? (
                      <>
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="flex-1 h-12 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-orange-500/15"
                        >
                          Ver Consumo / Adicionar
                        </Button>
                        {itemCount === 0 && (
                          <Button
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleting(o.id);
                            }}
                            className="h-12 px-4 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl"
                            title="Excluir mesa vazia"
                          >
                            Excluir
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="w-full text-center text-xs font-semibold text-neutral-500 py-3 bg-neutral-950/30 rounded-xl border border-neutral-850">
                        Mesa Encerrada
                      </span>
                    )}
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