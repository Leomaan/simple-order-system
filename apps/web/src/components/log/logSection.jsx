import { useState, useEffect } from "react";
import { useLogs } from "../../hooks/useLog";
import LogFilters from "./logFilters";
import LogItem from "./logItem";

export default function LogsSection() {
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
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Logs de Auditoria</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Histórico completo de operações</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {logs.length} registros
          </div>
        )}
      </header>

      <LogFilters 
        filters={filters} setFilters={setFilters} 
        onFilter={handleFilter} onClear={handleClear} 
        loading={loading} ACTIONS={ACTIONS} ENTITIES={ENTITIES} 
      />

      <main className="space-y-3">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">{error}</div>}

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))
        ) : (
          logs.map((log) => <LogItem key={log.id} log={log} />)
        )}
      </main>
    </div>
  );
}