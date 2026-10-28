import React from 'react';
import { ChefHat, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function KDSHeader({
  audioEnabled,
  onToggleAudio,
  selectedStation,
  onSelectStation,
  stations,
  stationCounts = {},
  totalItemsCount,
  onBack,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-300/80 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-stone-100 text-stone-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-stone-200 border border-stone-300 dark:border-neutral-750 transition active:scale-95 cursor-pointer shadow-xs mr-1"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        )}

        <div className="w-10 h-10 rounded-xl bg-stone-200/80 dark:bg-neutral-800 border border-stone-300 dark:border-neutral-750 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold shrink-0">
          <ChefHat className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Cozinha & Despacho (KDS)
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Acompanhamento e controle de produção e expedição em tempo real
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Alternador de Tema */}
        <ThemeToggle />

        {/* Alternador de Som */}
        <button
          onClick={onToggleAudio}
          title={
            audioEnabled
              ? 'Alerta sonoro ativo para novos pedidos'
              : 'Clique para ativar o alerta sonoro de novos pedidos'
          }
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            audioEnabled
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'bg-white dark:bg-neutral-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-800'
          }`}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          )}
          <span className="hidden sm:inline">
            {audioEnabled ? 'Alerta Ativo' : 'Ativar Alerta'}
          </span>
        </button>

        {/* Filtro de Estações com Contraste Garantido no Modo Claro e Escuro */}
        <div className="flex flex-wrap items-center bg-stone-200/70 dark:bg-neutral-900 border border-stone-300/90 dark:border-neutral-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => onSelectStation('ALL')}
            className={`px-3 py-1.5 text-xs rounded-lg transition cursor-pointer ${
              selectedStation === 'ALL'
                ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 bg-stone-200/60 hover:bg-stone-300/60 dark:bg-neutral-800 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-neutral-700 font-medium'
            }`}
          >
            Todos ({totalItemsCount})
          </button>
          {stations.map((st) => {
            const isSelected = String(selectedStation) === String(st.id);
            const count = stationCounts[String(st.id)] ?? 0;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(String(st.id))}
                className={`px-3 py-1.5 text-xs rounded-lg transition cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 bg-stone-200/60 hover:bg-stone-300/60 dark:bg-neutral-800 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-neutral-700 font-medium'
                }`}
              >
                {st.name} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
