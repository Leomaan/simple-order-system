import { ACTION_LABEL, ENTITY_LABEL } from '../constants/logConstants';

export default function LogFilters({ filters, setFilters, onFilter, onClear, loading, ACTIONS, ENTITIES }) {
  const hasFilters = filters.action || filters.entity || filters.from || filters.to;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onFilter(); }} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 mb-6 backdrop-blur-sm">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Select Ação */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Ação</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas as ações</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a] || a}</option>
            ))}
          </select>
        </div>

        {/* Select Entidade */}
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Entidade</label>
          <select
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/60 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            {ENTITIES.map((ent) => (
              <option key={ent} value={ent}>{ENTITY_LABEL[ent] || ent}</option>
            ))}
          </select>
        </div>

        {/* Datas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">De</label>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm [color-scheme:dark]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-neutral-500 text-xs font-medium tracking-wide uppercase">Até</label>
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="bg-neutral-800 border border-neutral-700/60 text-white rounded-xl px-3 py-2 text-sm [color-scheme:dark]" />
        </div>

        {/* Botões */}
        <div className="flex gap-2 ml-auto">
          {hasFilters && (
            <button type="button" onClick={onClear} className="text-neutral-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-neutral-800 transition-all">
              Limpar
            </button>
          )}
          <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-orange-500/10">
            Filtrar
          </button>
        </div>
      </div>
    </form>
  );
}