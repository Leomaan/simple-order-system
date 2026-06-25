import React, { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReport';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';

const statusLabel = {
  OPEN: 'Aberto',
  PAID: 'Pago',
  CLOSED: 'Fechado',
};

export default function ReportSection() {
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

  const formatPrice = (val) => `R$ ${Number(val || 0).toFixed(2)}`;

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Relatórios & Faturamento</h2>
        <p className="text-neutral-550 text-sm">Monitore o faturamento e vendas do restaurante</p>
      </div>

      {/* Vendas do dia */}
      <section className="glass-panel border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Faturamento de Hoje
        </h3>
        {today ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Data</p>
              <p className="text-white font-bold text-lg">{today.date}</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Pedidos Fechados</p>
              <p className="text-white font-extrabold text-3xl">{today.totalOrders}</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5 bg-gradient-to-br from-orange-500/5 to-transparent">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Faturamento Bruto</p>
              <p className="text-orange-400 font-black text-3xl">{formatPrice(today.totalRevenue)}</p>
            </div>
          </div>
        ) : (
          <p className="text-neutral-500 text-sm italic">{loading ? 'Carregando vendas...' : 'Nenhuma venda registrada hoje.'}</p>
        )}
      </section>

      {/* Filtro de período */}
      <section className="glass-panel border border-neutral-800 rounded-2xl p-6 flex flex-col gap-6">
        <h3 className="text-white font-bold text-lg">Busca por Período</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Input
            type="date"
            label="Data Inicial (De)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          />
          <Input
            type="date"
            label="Data Final (Até)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Todos</option>
              <option value="OPEN">Aberto</option>
              <option value="PAID">Pago</option>
              <option value="CLOSED">Fechado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={handleRevenue}
              disabled={loading || !from || !to}
              variant="primary"
              className="flex-1 text-xs"
            >
              Ver Faturamento
            </Button>
            <Button
              type="submit"
              onClick={handleOrders}
              disabled={loading || !from || !to}
              variant="secondary"
              className="flex-1 text-xs"
            >
              Ver Pedidos
            </Button>
          </div>
        </form>

        <ErrorMessage message={error} />

        {/* Resultado faturamento */}
        {revenue && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Período de Busca</p>
              <p className="text-white text-sm font-semibold">{revenue.from} → {revenue.to}</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Pedidos Fechados</p>
              <p className="text-white font-extrabold text-2xl">{revenue.totalOrders}</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4.5 bg-gradient-to-br from-orange-500/5 to-transparent">
              <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Faturamento Total</p>
              <p className="text-orange-400 font-black text-2xl">{formatPrice(revenue.totalRevenue)}</p>
            </div>
          </div>
        )}

        {/* Resultado pedidos */}
        {orderReport && (
          <div className="mt-2 animate-in fade-in duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-neutral-450 text-sm font-semibold">
                {orderReport.totalOrders} pedido(s) encontrado(s) · <span className="text-white">{orderReport.status === 'ALL' ? 'Todos os status' : statusLabel[orderReport.status]}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {orderReport.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-semibold">Mesa {o.table}</p>
                    <p className="text-neutral-500 text-[10px] uppercase tracking-wider mt-1">
                      {new Date(o.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                      {new Date(o.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 font-semibold bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg">
                    {statusLabel[o.status]}
                  </span>
                </div>
              ))}
              {orderReport.orders.length === 0 && (
                <p className="text-neutral-500 text-sm italic py-4 text-center">Nenhum pedido registrado no período selecionado.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}