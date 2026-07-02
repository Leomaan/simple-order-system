import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowRestored(true);
      
      // Esconde o aviso de conexão restaurada após 4 segundos
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);

      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowRestored(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 text-amber-400 text-xs font-medium flex items-center justify-center gap-2 select-none animate-in slide-in-from-top duration-300">
        <WifiOff size={14} className="animate-pulse" />
        <span>Você está operando offline. O sistema enfileirará suas ações e sincronizará quando a internet retornar.</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="bg-green-500/15 border-b border-green-500/20 px-4 py-2.5 text-green-400 text-xs font-semibold flex items-center justify-center gap-2 select-none animate-in slide-in-from-top duration-300">
        <Wifi size={14} />
        <span>Conexão restabelecida! Sincronizando dados com o servidor...</span>
      </div>
    );
  }

  return null;
}
