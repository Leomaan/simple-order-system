import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProduct';
import ConfirmModal from '../ui/ConfirmModal';
import OrderDetailModal from './OrderDetailModal';
import OrderCard from './OrderCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatErrorMessage } from '../util/errorUtil';
import { Plus, X } from 'lucide-react';

const statusLabel = {
  OPEN:   { label: 'Aberto',   color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  CLOSED: { label: 'Pendente', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  PAID:   { label: 'Pago',     color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
};

const STATUSES = ['', 'OPEN', 'CLOSED', 'PAID'];

export default function WaiterOrderSection() {
  const { user } = useAuth();
  const effectiveCompanyId =
    user?.companyId ||
    (localStorage.getItem('companyId') ? Number(localStorage.getItem('companyId')) : null);

  const {
    orders,
    loading,
    fetchOrders,
    createOrder,
    deleteOrder,
    totalPages,
    currentPage,
    setPage,
    statusFilter,
    isCreating,
    isDeleting,
  } = useOrders('OPEN');
  const { products } = useProducts('', { paginate: false });
  const [showForm, setShowForm] = useState(false);
  const [table, setTable] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: stations = [] } = useQuery({
    queryKey: ['kds-stations', { companyId: effectiveCompanyId }],
    queryFn: async () => {
      const res = await api.get('/company/current/stations').catch(() => ({ data: { data: [] } }));
      return res.data.data || [];
    },
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories', { companyId: effectiveCompanyId }],
    queryFn: async () => {
      const res = await api.get('/category').catch(() => ({ data: { data: [] } }));
      return res.data.data || [];
    },
  });

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await createOrder({ table: Number(table) });
      setTable('');
      setShowForm(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await deleteOrder(deleting);
      setDeleting(null);
    } catch (err) {
      setError(formatErrorMessage(err));
      setDeleting(null);
    }
  }

  function handleFilter(status) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1917] dark:text-white tracking-tight">Pedidos</h2>
          <p className="text-stone-500 dark:text-neutral-500 text-sm">Abra novos pedidos por mesa e gerencie consumos em tempo real</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          className="w-full sm:w-auto py-3 px-5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'Cancelar' : 'Novo pedido'}</span>
        </Button>
      </div>

      {/* Criar pedido */}
      {showForm && (
        <form 
          onSubmit={handleCreate} 
          className="bg-white dark:bg-neutral-900 border border-[#e4ded4] dark:border-neutral-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-end gap-4 animate-in slide-in-from-top-4 duration-300 shadow-xs"
        >
          <div className="flex-1 w-full">
            <Input
              type="text"
              name="table"
              filter="number"
              label="Número da mesa"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              required
              placeholder="Ex: 5"
            />
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 shrink-0">{error}</p>
          )}
          <Button 
            type="submit" 
            loading={isCreating}
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
              statusFilter === s 
                ? 'bg-[#1c1917] border-[#1c1917] text-white dark:bg-white dark:border-white dark:text-black shadow-sm' 
                : 'bg-white border-[#e4ded4] text-stone-600 hover:border-[#cfc7b8] hover:text-[#1c1917] dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            {s === '' ? 'Todos' : statusLabel[s].label}
          </button>
        ))}
      </div>

      {/* Lista de Mesas / Pedidos w-100 */}
      {loading ? (
        <div className="flex flex-col gap-2 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-white dark:bg-neutral-900/40 border border-[#e4ded4] dark:border-neutral-800 rounded-xl animate-pulse w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-neutral-900/10 rounded-2xl border border-dashed border-[#d8d2c4] dark:border-neutral-800 w-full">
          <p className="text-stone-500 dark:text-neutral-550 font-medium">Nenhum pedido encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              stations={stations}
              categories={dbCategories}
              onClick={setSelectedOrder}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-[#e4ded4] dark:border-neutral-850 bg-white dark:bg-neutral-900/10 rounded-2xl px-5 py-4 mt-6">
          <p className="text-xs text-stone-500 dark:text-neutral-500 font-semibold select-none">
            Mostrando página <span className="text-[#1c1917] dark:text-neutral-350">{currentPage}</span> de <span className="text-[#1c1917] dark:text-neutral-350">{totalPages}</span>
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
