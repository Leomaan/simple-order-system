export function formatPaymentDto(payment) {
  if (!payment) return null;

  return {
    orderId: payment.orderId !== undefined ? Number(payment.orderId) : undefined,
    paymentId: payment.paymentId ? String(payment.paymentId) : undefined,
    status: payment.status || undefined,
    qrCode: payment.qrCode || undefined,
    qrCodeBase64: payment.qrCodeBase64 || undefined,
    qrCodeCopy: payment.qrCodeCopy || undefined,
    expiresAt: payment.expiresAt ? new Date(payment.expiresAt).toISOString() : undefined,
    amount: payment.amount !== undefined ? Number(payment.amount) : undefined,
  };
}
