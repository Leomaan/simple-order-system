import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import OrderCard from './OrderCard';
import { STATUS_MAP } from '../constants/orderConstants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import { formatErrorMessage } from '../util/errorUtil';
import { Plus, X } from 'lucide-react';

export default function OrderSection() {
  const {
    orders,
    loading,
    fetchOrders,
    createOrder,
    deleteOrder,
    updateOrder,
    totalPages,
    currentPage,
    setPage,
    statusFilter,
    isSaving,
    isDeleting,
  } = useOrders('OPEN');
  const { products } = useProducts('', { paginate: false });
  
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tableValue, setTableValue] = useState('');
  const [error, setError] = useState('');

  const handleOpenForm = (order = null) => {
    setError('');
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
    setError('');
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
      setError(formatErrorMessage(err));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Modais de Controle */}
      {deleting && (
        <ConfirmModal
          title="Excluir pedido?"
          message="Tem certeza de que deseja excluir este pedido? Esta ação não pode ser desfeita."
          onConfirm={async () => { 
            try {
              await deleteOrder(deleting); 
              setDeleting(null); 
            } catch (err) {
              setError(formatErrorMessage(err));
            }
          }}
          onCancel={() => setDeleting(null)}
          loading={isDeleting}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          products={products}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => fetchOrders(statusFilter || undefined)}
        />
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Painel de Pedidos</h2>
          <p className="text-neutral-500 text-sm">Gerencie o fluxo de mesas e consumo em tempo real</p>
        </div>
        <Button
          onClick={() => (showForm || editing ? (setShowForm(false), setEditing(null)) : handleOpenForm())}
          variant={showForm || editing ? 'secondary' : 'primary'}
          className="w-full sm:w-auto py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
        >
          {showForm || editing ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm || editing ? 'Cancelar' : 'Novo pedido'}</span>
        </Button>
      </header>

      {/* Form Unificado */}
      {(showForm || editing) && (
        <form 
          onSubmit={handleSubmit} 
          className="glass-panel border border-orange-500/20 rounded-2xl p-5 mb-8 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 w-full">
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
            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => { setShowForm(false); setEditing(null); setError(''); }}
                className="h-[44px] px-4 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                loading={isSaving}
                className="h-[44px] px-6 text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>{editing ? 'Atualizar' : 'Abrir Pedido'}</span>
              </Button>
            </div>
          </div>

          <ErrorMessage message={error} />
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 select-none">
        {['', 'OPEN', 'PAID', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => fetchOrders(s || undefined)}
            className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
              statusFilter === s 
                ? 'bg-white border-white text-black shadow-lg shadow-white/5' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {s === '' ? 'Todos' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {/* Lista de Mesas / Pedidos w-100 */}
      {loading ? (
        <div className="flex flex-col gap-2 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-neutral-900/40 border border-neutral-800 rounded-xl animate-pulse w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800 w-full">
          <p className="text-neutral-550 font-medium">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {orders.map((o) => (
            <OrderCard 
              key={o.id} 
              order={o} 
              onClick={setSelectedOrder} 
              onEdit={handleOpenForm}
              onDelete={setDeleting}
            />
          ))}
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