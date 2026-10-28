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
    stationCounts,
    isLoading,
    selectedStation,
    setSelectedStation,
    audioEnabled,
    toggleAudio,
    activeItems,
    filteredItems,
    updateItemStatus,
    claimItemDelivery,
  } = useKDS();

  const handleBack = () => {
    if (user?.role === 'WAITER') {
      navigate('/waiter');
    } else if (user?.isSuperAdmin && !user?.companyId) {
      navigate('/superadmin');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-[#121215] text-[#1c1917] dark:text-[#ececf0] p-4 sm:p-6 flex flex-col font-sans select-none transition-colors">
      
      {/* Top Bar e Filtros com Botão Voltar */}
      <KDSHeader
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        stations={stations}
        stationCounts={stationCounts}
        totalItemsCount={activeItems.length}
        onBack={handleBack}
      />

      {/* Grid de Cards de Produção */}
      <div className="flex-1 pt-6 overflow-y-auto">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-stone-500 text-sm">
            Carregando pedidos de produção...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 gap-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/60" />
            <p className="text-base font-semibold text-stone-800 dark:text-stone-200">
              Nenhum item pendente nesta estação!
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
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
                onClaimDelivery={claimItemDelivery}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
