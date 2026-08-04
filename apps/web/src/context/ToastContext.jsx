import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { getErrorMessage } from '../util/error.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type, title, message = '', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((title, message = '') => {
    addToast('success', title, message);
  }, [addToast]);

  const showError = useCallback((errorOrTitle, defaultMessage = '') => {
    if (typeof errorOrTitle === 'string') {
      addToast('error', errorOrTitle, defaultMessage);
    } else {
      const parsedMessage = getErrorMessage(errorOrTitle, defaultMessage || 'Erro ao realizar operação');
      addToast('error', 'Ops! Algo deu errado', parsedMessage);
    }
  }, [addToast]);

  const showWarning = useCallback((title, message = '') => {
    addToast('warning', title, message);
  }, [addToast]);

  const showInfo = useCallback((title, message = '') => {
    addToast('info', title, message);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, addToast, removeToast }}>
      {children}
      {/* Toast Container Render */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bgColor = isSuccess
            ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100'
            : isError
            ? 'bg-rose-900/90 border-rose-500 text-rose-100'
            : isWarning
            ? 'bg-amber-900/90 border-amber-500 text-amber-100'
            : 'bg-slate-900/90 border-blue-500 text-blue-100';

          const Icon = isSuccess
            ? CheckCircle2
            : isError
            ? XCircle
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${bgColor}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold leading-snug">{toast.title}</p>
                {toast.message && <p className="mt-1 opacity-90 leading-relaxed text-xs">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}
