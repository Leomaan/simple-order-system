import { useState } from 'react';
import { useOrders } from '../../hooks/useOrder';

const statusLabel = {
  OPEN:   { label: 'Aberto',   color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  PAID:   { label: 'Pago',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  CLOSED: { label: 'Fechado',  color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20' },
};

const STATUSES = ['', 'OPEN', 'PAID', 'CLOSED'];

export default function ordersSection() {
  const { orders, loading, fetchOrders, createOrder } = useOrders();
  const [showForm, setShowForm] = useState(false);
  const [table, setTable] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

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

  function handleFilter(status) {
    setFilter(status);
    fetchOrders(status || undefined);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Pedidos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo pedido'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 flex flex-col gap-4">
          <h3 className="text-white font-medium">Novo pedido</h3>
          <div className="flex flex-col gap-1">
            <label className="text-neutral-400 text-sm">Número da mesa</label>
            <input
              type="number"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              required
              placeholder="Ex: 5"
              className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600 w-40"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-end"
          >
            {saving ? 'Abrindo...' : 'Abrir pedido'}
          </button>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === s
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
            }`}
          >
            {s === '' ? 'Todos' : statusLabel[s].label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nenhum pedido encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Mesa {o.table}</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  {new Date(o.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-md border ${statusLabel[o.status].color}`}>
                {statusLabel[o.status].label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}