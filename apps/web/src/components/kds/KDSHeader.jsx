import React from 'react';
import { ChefHat, Volume2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function KDSHeader({
  audioEnabled,
  onToggleAudio,
  selectedStation,
  onSelectStation,
  stations,
  totalItemsCount,
  onBack,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-750 transition active:scale-95 cursor-pointer shadow-sm mr-1"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        )}

        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold shrink-0">
          <ChefHat className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Cozinha & Despacho (KDS)
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Acompanhamento e controle de produção em tempo real
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Alternador de Tema */}
        <ThemeToggle />

        {/* Alternador de Som */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            audioEnabled
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">{audioEnabled ? 'Alerta Ativo' : 'Ativar Alerta'}</span>
        </button>

        {/* Filtro de Estações */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => onSelectStation('ALL')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              selectedStation === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Todos ({totalItemsCount})
          </button>
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStation(String(st.id))}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                selectedStation === String(st.id)
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
