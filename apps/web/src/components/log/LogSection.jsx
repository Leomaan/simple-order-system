import React, { useState, useEffect } from "react";
import { useLogs } from "../../hooks/useLog";
import LogFilters from "./LogFilters";
import LogItem from "./LogItem";

export default function LogSection() {
  const { logs, loading, error, fetchLogs, ACTIONS, ENTITIES } = useLogs();
  const [filters, setFilters] = useState({ action: "", entity: "", from: "", to: "" });

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    fetchLogs({
      action: filters.action || undefined,
      entity: filters.entity || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    });
  };

  const handleClear = () => {
    setFilters({ action: "", entity: "", from: "", to: "" });
    fetchLogs();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Logs de Auditoria</h2>
          <p className="text-neutral-500 text-sm">Histórico completo de operações e ações realizadas</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-full px-4.5 py-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {logs.length} registros
          </div>
        )}
      </header>

      <LogFilters 
        filters={filters} 
        setFilters={setFilters} 
        onFilter={handleFilter} 
        onClear={handleClear} 
        loading={loading} 
        ACTIONS={ACTIONS} 
        ENTITIES={ENTITIES} 
      />

      <main className="space-y-3">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-550 font-medium">Nenhum log de auditoria encontrado.</p>
          </div>
        ) : (
          logs.map((log) => <LogItem key={log.id} log={log} />)
        )}
      </main>
    </div>
  );
}