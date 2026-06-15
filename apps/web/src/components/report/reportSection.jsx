import { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReport';

const statusLabel = {
  OPEN: 'Aberto',
  PAID: 'Pago',
  CLOSED: 'Fechado',
};

export default function ReportsSection() {
  const { loading, error, getSalesToday, getRevenueByPeriod, getOrdersByPeriod } = useReports();
  const [today, setToday] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [orderReport, setOrderReport] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getSalesToday().then(setToday);
  }, []);

  async function handleRevenue(e) {
    e.preventDefault();
    const data = await getRevenueByPeriod(from, to);
    if (data) setRevenue(data);
  }

  async function handleOrders(e) {
    e.preventDefault();
    const data = await getOrdersByPeriod(from, to, statusFilter || undefined);
    if (data) setOrderReport(data);
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <h2 className="text-white text-xl font-bold">Relatórios</h2>

      {/* Vendas do dia */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">Vendas do dia</h3>
        {today ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Data</p>
              <p className="text-white font-semibold">{today.date}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Pedidos fechados</p>
              <p className="text-white font-semibold text-2xl">{today.totalOrders}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Faturamento</p>
              <p className="text-orange-400 font-bold text-2xl">R$ {Number(today.totalRevenue).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">{loading ? 'Carregando...' : 'Sem dados'}</p>
        )}
      </div>

      {/* Filtro de período */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4">Filtrar por período</h3>
        <form className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-neutral-400 text-xs">De</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
              className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-neutral-400 text-xs">Até</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            onClick={handleRevenue}
            disabled={loading || !from || !to}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ver faturamento
          </button>
          <div className="flex gap-1 items-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Todos os status</option>
              <option value="OPEN">Aberto</option>
              <option value="PAID">Pago</option>
              <option value="CLOSED">Fechado</option>
            </select>
            <button
              type="submit"
              onClick={handleOrders}
              disabled={loading || !from || !to}
              className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Ver pedidos
            </button>
          </div>
        </form>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mt-4">{error}</p>
        )}

        {/* Resultado faturamento */}
        {revenue && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Período</p>
              <p className="text-white text-sm">{revenue.from} → {revenue.to}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Pedidos fechados</p>
              <p className="text-white font-semibold text-2xl">{revenue.totalOrders}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-500 text-xs mb-1">Faturamento</p>
              <p className="text-orange-400 font-bold text-2xl">R$ {Number(revenue.totalRevenue).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Resultado pedidos */}
        {orderReport && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-neutral-400 text-sm">
                {orderReport.totalOrders} pedido(s) · {orderReport.status === 'ALL' ? 'Todos' : statusLabel[orderReport.status]}
              </p>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {orderReport.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">Mesa {o.table}</p>
                    <p className="text-neutral-500 text-xs">{new Date(o.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className="text-xs text-neutral-400">{statusLabel[o.status]}</span>
                </div>
              ))}
              {orderReport.orders.length === 0 && (
                <p className="text-neutral-500 text-sm">Nenhum pedido no período.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}