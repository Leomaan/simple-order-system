import { useState, useEffect } from 'react';
import { useLogs } from '../../hooks/useLog';

const actionLabel = {
  LOGIN: 'Entrou no sistema',
  LOGOUT: 'Saiu do sistema',
  CREATE_PRODUCT: 'Criou produto',
  UPDATE_PRODUCT: 'Editou produto',
  DELETE_PRODUCT: 'Removeu produto',
  RESTORE_PRODUCT: 'Restaurou produto',
  PERMANENT_DELETE_PRODUCT: 'Deletou produto permanentemente',
  CREATE_ORDER: 'Abriu pedido',
  CLOSE_ORDER: 'Fechou pedido',
  DELETE_ORDER: 'Removeu pedido',
  UPDATE_ORDER: 'Editou pedido',
  RESTORE_ORDER: 'Restaurou pedido',
  PERMANENT_DELETE_ORDER: 'Deletou pedido permanentemente',
  CREATE_USER: 'Criou usuário',
  UPDATE_USER: 'Editou usuário',
  DELETE_USER: 'Removeu usuário',
  RESTORE_USER: 'Restaurou usuário',
  PERMANENT_DELETE_USER: 'Deletou usuário permanentemente',
  ADD_ORDER_ITEM: 'Adicionou item ao pedido',
  UPDATE_ORDER_ITEM: 'Alterou item do pedido',
  REMOVE_ORDER_ITEM: 'Removeu item do pedido',
};

const entityLabel = {
  Product: 'Produto',
  Order: 'Pedido',
  User: 'Usuário',
  OrderItem: 'Item',
};

function getActionStyle(action) {
  if (action.startsWith('CREATE') || action.startsWith('ADD') || action.startsWith('RESTORE')) {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    };
  }
  if (action.startsWith('DELETE') || action.startsWith('REMOVE') || action.startsWith('PERMANENT')) {
    return {
      dot: 'bg-red-500',
      badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
  }
  if (action.startsWith('UPDATE') || action === 'CLOSE_ORDER') {
    return {
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
        </svg>
      ),
    };
  }
  return {
    dot: 'bg-neutral-500',
    badge: 'bg-neutral-700/60 text-neutral-400 ring-1 ring-neutral-600/30',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
}

function getRoleStyle(role) {
  if (role === 'ADMIN') {
    return { cls: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20', label: 'Admin' };
  }
  return { cls: 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20', label: 'Garçom' };
}

const ICONS = {
  table: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
    </svg>
  ),
  tag: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  product: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8" />
    </svg>
  ),
  money: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  person: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  info: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function get(d, ...keys) {
  for (const k of keys) if (d[k] != null) return d[k];
  return null;
}

function renderDetails(action, details, entityId) {
  const rows = [];
  const d = details || {};

  // campos exatos retornados pelo backend
  const mesa    = d.table    != null ? d.table    : null;
  const pedido  = d.order    != null ? d.order    : (entityId ?? null);
  const produto = d.product  != null ? d.product  : null;
  const qty     = d.quantity != null ? d.quantity : null;
  const change  = d.change   != null ? d.change   : null;
  const total   = d.total    != null ? d.total    : null;
  const nome    = d.name     != null ? d.name     : null;
  const role    = d.role     != null ? d.role     : null;

  switch (action) {
    case 'CREATE_ORDER':
      if (mesa   != null) rows.push({ icon: ICONS.table, label: 'Mesa',   value: `Mesa ${mesa}`, highlight: true });
      if (pedido != null) rows.push({ icon: ICONS.tag,   label: 'Pedido', value: `#${pedido}` });
      break;

    case 'ADD_ORDER_ITEM':
      if (mesa    != null) rows.push({ icon: ICONS.table,   label: 'Mesa',       value: `Mesa ${mesa}`, highlight: true });
      if (pedido  != null) rows.push({ icon: ICONS.tag,     label: 'Pedido',     value: `#${pedido}` });
      if (produto != null) rows.push({ icon: ICONS.product, label: 'Item',       value: String(produto) });
      if (qty     != null) rows.push({ icon: ICONS.info,    label: 'Quantidade', value: `${qty}x` });
      break;

    case 'UPDATE_ORDER_ITEM':
      if (mesa    != null) rows.push({ icon: ICONS.table,   label: 'Mesa',      value: `Mesa ${mesa}`, highlight: true });
      if (pedido  != null) rows.push({ icon: ICONS.tag,     label: 'Pedido',    value: `#${pedido}` });
      if (produto != null) rows.push({ icon: ICONS.product, label: 'Item',      value: String(produto) });
      if (change  != null) rows.push({ icon: ICONS.info,    label: 'Alteração', value: String(change), highlight: String(change).startsWith('Adicionou') });
      break;

    case 'REMOVE_ORDER_ITEM':
      if (mesa    != null) rows.push({ icon: ICONS.table,   label: 'Mesa',   value: `Mesa ${mesa}`, highlight: true });
      if (pedido  != null) rows.push({ icon: ICONS.tag,     label: 'Pedido', value: `#${pedido}` });
      if (produto != null) rows.push({ icon: ICONS.product, label: 'Item',   value: String(produto) });
      break;

    case 'CLOSE_ORDER':
      if (mesa   != null) rows.push({ icon: ICONS.table, label: 'Mesa',   value: `Mesa ${mesa}`, highlight: true });
      if (pedido != null) rows.push({ icon: ICONS.tag,   label: 'Pedido', value: `#${pedido}` });
      if (total  != null) rows.push({ icon: ICONS.money, label: 'Total',  value: `R$ ${Number(total).toFixed(2)}`, highlight: true });
      break;

    case 'CREATE_USER':
    case 'UPDATE_USER':
    case 'DELETE_USER':
    case 'RESTORE_USER':
    case 'PERMANENT_DELETE_USER':
      if (nome != null) rows.push({ icon: ICONS.person, label: 'Nome',  value: String(nome) });
      if (role != null) rows.push({ icon: ICONS.person, label: 'Cargo', value: role === 'WAITER' ? 'Garçom' : role === 'ADMIN' ? 'Admin' : String(role) });
      break;

    case 'CREATE_PRODUCT':
    case 'UPDATE_PRODUCT':
    case 'DELETE_PRODUCT':
    case 'RESTORE_PRODUCT':
    case 'PERMANENT_DELETE_PRODUCT':
      if (nome != null) rows.push({ icon: ICONS.product, label: 'Produto', value: String(nome) });
      break;

    default:
      Object.entries(d).forEach(([k, v]) => {
        if (v != null) rows.push({ icon: ICONS.info, label: k, value: String(v) });
      });
  }

  return rows;
}

function formatRelativeTime(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  let relative = '';
  if (mins < 1)        relative = 'agora';
  else if (mins < 60)  relative = `${mins}m atrás`;
  else if (hours < 24) relative = `${hours}h atrás`;
  else                 relative = `${days}d atrás`;

  return { relative, full: new Date(dateStr).toLocaleString('pt-BR') };
}

export default function LogsSection() {
  const { logs, loading, error, fetchLogs, ACTIONS, ENTITIES } = useLogs();
  const [filters, setFilters] = useState({ action: '', entity: '', from: '', to: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchLogs({
      action: filters.action || undefined,
      entity: filters.entity || undefined,
      from:   filters.from   || undefined,
      to:     filters.to     || undefined,
    });
  }

  function handleClear() {
    setFilters({ action: '', entity: '', from: '', to: '' });
    fetchLogs();
  }

  const hasFilters = filters.action || filters.entity || filters.from || filters.to;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Logs de Auditoria</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Histórico de ações do sistema</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {logs.length} registros
          </div>
        )}
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-6 backdrop-blur-sm"
      >
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Ação</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Todas as ações</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{actionLabel[a] || a}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Entidade</label>
            <select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              {ENTITIES.map((ent) => (
                <option key={ent} value={ent}>{entityLabel[ent] || ent}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">De</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 transition-all [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Até</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 transition-all [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-2 ml-auto">
            {hasFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h18M6 8h12M9 12h6" />
              </svg>
              Filtrar
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm">Nenhum log encontrado.</p>
        </div>
      )}

      {/* Logs list */}
      {!loading && logs.length > 0 && (
        <div className="space-y-2">
          {logs.map((log) => {
            const style = getActionStyle(log.action);
            const time = formatRelativeTime(log.createdAt);
            const isExpanded = expanded === log.id;
            const role = getRoleStyle(log.userRole);
            const detailRows = renderDetails(log.action, log.details ?? {}, log.entityId);

            return (
              <div
                key={log.id}
                className={`group relative border rounded-2xl transition-all duration-200 overflow-hidden
                  ${isExpanded
                    ? 'border-neutral-700 bg-neutral-900/90'
                    : 'border-neutral-800/70 bg-neutral-900/30 hover:border-neutral-700/50 hover:bg-neutral-900/60'
                  } ${detailRows.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => detailRows.length > 0 && setExpanded(isExpanded ? null : log.id)}
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  {/* Color dot */}
                  <div className="flex-none pt-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Row 1: who + role + action */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-semibold">{log.userName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${role.cls}`}>
                        {role.label}
                      </span>
                      <span className="text-neutral-600 text-xs">·</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${style.badge}`}>
                        {style.icon}
                        {actionLabel[log.action] || log.action}
                      </span>
                      {log.entity && (
                        <span className="text-neutral-600 text-xs flex items-center gap-1">
                          <span className="text-neutral-700">·</span>
                          <span className="text-neutral-500">{entityLabel[log.entity] || log.entity}</span>
                          {log.entityId && (
                            <span className="text-neutral-600 font-mono">#{log.entityId}</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Row 2: detail pills */}
                    {detailRows.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {detailRows.slice(0, isExpanded ? detailRows.length : 3).map((row, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs bg-neutral-800/80 border border-neutral-700/40 rounded-lg px-2.5 py-1"
                          >
                            <span className="text-neutral-500">{row.icon}</span>
                            <span className="text-neutral-500">{row.label}:</span>
                            <span className={row.highlight ? 'text-orange-400 font-semibold' : 'text-neutral-300 font-medium'}>
                              {String(row.value)}
                            </span>
                          </span>
                        ))}
                        {!isExpanded && detailRows.length > 3 && (
                          <span className="inline-flex items-center text-xs text-neutral-600 px-1">
                            +{detailRows.length - 3} mais
                          </span>
                        )}
                      </div>
                    )}

                    {/* IP — only when expanded */}
                    {isExpanded && log.ip && (
                      <p className="text-neutral-700 text-xs font-mono flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                        {log.ip}
                      </p>
                    )}
                  </div>

                  {/* Right: timestamp + chevron */}
                  <div className="flex-none flex items-center gap-2.5 pt-0.5">
                    <div className="text-right">
                      <p className="text-neutral-400 text-xs font-medium" title={time.full}>{time.relative}</p>
                      <p className="text-neutral-700 text-xs mt-0.5 tabular-nums">
                        {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {detailRows.length > 0 && (
                      <svg
                        className={`w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-500 transition-all duration-200 ${isExpanded ? 'rotate-180 text-neutral-400' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
