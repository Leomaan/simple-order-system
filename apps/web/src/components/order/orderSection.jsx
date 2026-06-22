import { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/confirmModal';
import OrderDetailsModal from './orderDetailModal';
import OrderCard from './orderCard';
import { STATUS_MAP } from '../constants/orderConstants';

export default function OrdersSection() {
  const { orders, loading, fetchOrders, createOrder, deleteOrder, updateOrder } = useOrders();
  const { products } = useProducts();
  
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tableValue, setTableValue] = useState('');

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
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Modais de Controle */}
      {deleting && (
        <ConfirmModal
          title="Excluir pedido?"
          onConfirm={async () => { await deleteOrder(deleting); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          products={products}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => fetchOrders(filter || undefined)}
        />
      )}

      {/* Header Profissional */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pedidos</h2>
          <p className="text-neutral-500 text-sm">Gerencie as mesas e consumos em tempo real</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Pedido
        </button>
      </header>

      {/* Form Unificado (Criar/Editar) */}
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 mb-8 flex items-end gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex-1">
            <label className="text-orange-500/70 text-xs font-bold uppercase tracking-widest mb-2 block">
              {editing ? `Editando Mesa ${editing.table}` : 'Número da Mesa'}
            </label>
            <input
              autoFocus
              type="number"
              value={tableValue}
              onChange={(e) => setTableValue(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all"
              placeholder="Ex: 12"
            />
          </div>
          <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-3 text-neutral-400 hover:text-white font-medium">Cancelar</button>
          <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-400 transition-all">
            {editing ? 'Atualizar' : 'Abrir Pedido'}
          </button>
        </form>
      )}

      {/* Filtros Estilizados */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'OPEN', 'PAID', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); fetchOrders(s || undefined); }}
            className={`text-[11px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
              filter === s ? 'bg-white border-white text-black' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
            }`}
          >
            {s === '' ? 'Todos' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {/* Lista com Estados */}
      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />)
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-600 font-medium">Nenhum pedido encontrado nesta categoria.</p>
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
    </div>
  );
}