import { formatOrderItemDto } from './orderItemDto.js';

export function formatOrderDto(order) {
  if (!order) return null;

  const raw = typeof order.toJSON === 'function' ? order.toJSON() : order;
  const items = Array.isArray(raw.OrderItems) ? raw.OrderItems.map(formatOrderItemDto) : [];

  const totalCalculated = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return {
    id: raw.id,
    table: Number(raw.table),
    status: raw.status,
    paymentMethod: raw.paymentMethod || null,
    paymentId: raw.paymentId || null,
    paymentQrCode: raw.paymentQrCode || null,
    paymentQrCodeCopy: raw.paymentQrCodeCopy || null,
    paymentExpiresAt: raw.paymentExpiresAt ? new Date(raw.paymentExpiresAt).toISOString() : null,
    total: raw.total !== undefined ? Number(raw.total) : totalCalculated,
    items,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
    deletedAt: raw.deletedAt ? new Date(raw.deletedAt).toISOString() : null,
  };
}
