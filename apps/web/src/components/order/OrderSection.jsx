import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import OrderCard from './OrderCard';
import { STATUS_MAP } from '../constants/orderConstants';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function OrderSection() {
  const { orders, loading, fetchOrders, createOrder, deleteOrder, updateOrder, totalPages, currentPage, setPage } = useOrders('OPEN');
  const { products } = useProducts();
  
  const [filter, setFilter] = useState('OPEN');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tableValue, setTableValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenForm = (order = null) => {
    if (order) {
      setEditing(order);
      setTableValue(order.table);
    } else {
      setTableValue('');
      setShowForm(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateOrder(editing.id, { table: Number(tableValue) });
        setEditing(null);
      } else {
        await createOrder({ table: Number(tableValue) });
        setShowForm(false);
      }
      setTableValue('');
    } catch (err) {
      alert(err.response?.data?.message || "Erro na operação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Modais de Controle */}
      {deleting && (
        <ConfirmModal
          title="Excluir pedido?"
          message="Tem certeza de que deseja excluir este pedido? Esta ação não pode ser desfeita."
          onConfirm={async () => { await deleteOrder(deleting); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
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
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Painel de Pedidos</h2>
          <p className="text-neutral-500 text-sm">Gerencie o fluxo de mesas e consumo em tempo real</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          variant="primary"
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Pedido
        </Button>
      </header>

      {/* Form Unificado */}
      {(showForm || editing) && (
        <form 
          onSubmit={handleSubmit} 
          className="glass-panel border border-orange-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-end gap-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex-1 w-full">
            <Input
              autoFocus
              type="number"
              label={editing ? `Editando Mesa ${editing.table}` : 'Número da Mesa'}
              value={tableValue}
              onChange={(e) => setTableValue(e.target.value)}
              placeholder="Ex: 12"
              required
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end mt-2 md:mt-0">
            <Button 
              variant="ghost" 
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={saving}
            >
              {editing ? 'Atualizar' : 'Abrir Pedido'}
            </Button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 select-none">
        {['', 'OPEN', 'PAID', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); fetchOrders(s || undefined); }}
            className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === s 
                ? 'bg-white border-white text-black shadow-lg shadow-white/5' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {s === '' ? 'Todos' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-550 font-medium">Nenhum pedido encontrado nesta categoria.</p>
          </div>
        ) : (
          orders.map(o => (
            <OrderCard 
              key={o.id} 
              order={o} 
              onClick={setSelectedOrder} 
              onEdit={handleOpenForm}
              onDelete={setDeleting}
            />
          ))
        )}
      </div>

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