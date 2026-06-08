export default function ConfirmModal({ title, message, confirmLabel = 'Confirmar', confirmClass = 'bg-red-500 hover:bg-red-400', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold mb-2">{title || 'Confirmar'}</h3>
        <p className="text-neutral-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="text-neutral-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmClass} disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors`}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}