import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useKDS } from '../hooks/useKDS';
import KDSHeader from '../components/kds/KDSHeader';
import KDSCard from '../components/kds/KDSCard';
import { CheckCircle2 } from 'lucide-react';

export default function KDS() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    stations,
    isLoading,
    selectedStation,
    setSelectedStation,
    audioEnabled,
    setAudioEnabled,
    activeItems,
    filteredItems,
    updateItemStatus,
  } = useKDS();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (user?.isSuperAdmin && !user?.companyId) {
      navigate('/superadmin');
    } else if (user?.role === 'WAITER') {
      navigate('/waiter');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 flex flex-col font-sans select-none transition-colors">
      
      {/* Top Bar e Filtros com Botão Voltar */}
      <KDSHeader
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        stations={stations}
        totalItemsCount={activeItems.length}
        onBack={handleBack}
      />

      {/* Grid de Cards de Produção */}
      <div className="flex-1 pt-6 overflow-y-auto">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
            Carregando pedidos de produção...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 gap-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              Nenhum item pendente de preparo!
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Aguardando novos pedidos das mesas e garçons.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <KDSCard
                key={item.id}
                item={item}
                onUpdateStatus={updateItemStatus}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
