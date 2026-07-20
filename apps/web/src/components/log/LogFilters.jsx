import React from 'react';
import { ACTION_LABEL, ENTITY_LABEL } from '../constants/logConstants';
import Button from '../ui/Button';

export default function LogFilters({ filters, setFilters, onFilter, onClear, loading, ACTIONS, ENTITIES }) {
  const hasFilters = filters.action || filters.entity || filters.from || filters.to;

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onFilter(); }} 
      className="glass-panel border border-neutral-800 rounded-2xl p-5 mb-6 animate-in fade-in duration-300"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        {/* Select Ação */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">Ação</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors cursor-pointer"
          >
            <option value="">Todas as ações</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a] || a}</option>
            ))}
          </select>
        </div>

        {/* Select Entidade */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">Entidade</label>
          <select
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors cursor-pointer"
          >
            <option value="">Todas</option>
            {ENTITIES.map((ent) => (
              <option key={ent} value={ent}>{ENTITY_LABEL[ent] || ent}</option>
            ))}
          </select>
        </div>

        {/* Data De */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">De</label>
          <input 
            type="date" 
            value={filters.from} 
            onChange={(e) => setFilters({ ...filters, from: e.target.value })} 
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Data Até */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">Até</label>
          <input 
            type="date" 
            value={filters.to} 
            onChange={(e) => setFilters({ ...filters, to: e.target.value })} 
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 justify-end mt-5">
        {hasFilters && (
          <Button 
            variant="ghost" 
            onClick={onClear} 
            className="w-full sm:w-auto text-xs py-2.5"
          >
            Limpar Filtros
          </Button>
        )}
        <Button 
          type="submit" 
          loading={loading}
          variant="primary"
          className="w-full sm:w-auto text-xs py-2.5 px-6 font-bold uppercase tracking-wider shadow-md shadow-orange-500/10"
        >
          Filtrar Auditoria
        </Button>
      </div>
    </form>
  );
}