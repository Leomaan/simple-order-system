import React from 'react';
import { ChefHat, Volume2 } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function KDSHeader({
  audioEnabled,
  onToggleAudio,
  selectedStation,
  onSelectStation,
  stations,
  totalItemsCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">KDS - Tela de Produção</h1>
          <p className="text-xs text-neutral-400">Acompanhamento e despacho em tempo real</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Alternador de Tema */}
        <ThemeToggle />

        {/* Alternador de Som */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            audioEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          {audioEnabled ? 'Som Ativo' : 'Ativar Alerta Sonoro'}
        </button>

        {/* Filtro de Estações */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => onSelectStation('ALL')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              selectedStation === 'ALL'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos ({totalItemsCount})
          </button>
          {stations.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStation(String(st.id))}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                selectedStation === String(st.id)
                  ? 'bg-neutral-800 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
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
