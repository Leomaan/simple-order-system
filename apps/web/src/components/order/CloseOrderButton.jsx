import React, { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';
import Button from '../ui/Button';

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
          title="Fechar mesa?"
          message="Esta mesa será marcada como Fechada. Esta operação é irreversível. Deseja fechar a mesa agora?"
          confirmLabel="Sim, fechar mesa"
          confirmVariant="primary"
          onConfirm={handleClose}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
      <Button
        onClick={() => setShowConfirm(true)}
        variant="primary"
        className="w-full mt-2.5 shadow-md shadow-orange-500/10"
      >
        Fechar mesa / Encerrar conta
      </Button>
    </>
  );
}