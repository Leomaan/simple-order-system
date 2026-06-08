import { useState } from 'react';
import ConfirmModal from '../ui/confirmModal';

export default function CloseOrderButton({ orderId, onSuccess, onError }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClose() {
    setLoading(true);
    try {
      const { default: api } = await import('../../config/api');
      await api.patch(`/order/${orderId}/close`);
      setShowConfirm(false);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      onError?.(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao fechar pedido');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          title="Fechar pedido?"
          message="Ao fechar o pedido ele não poderá ser reaberto. Confirma?"
          confirmLabel="Fechar pedido"
          confirmClass="bg-orange-500 hover:bg-orange-400"
          onConfirm={handleClose}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-2"
      >
        Fechar pedido
      </button>
    </>
  );
}