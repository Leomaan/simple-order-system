import { formatProductDto } from './productDto.js';

export function formatOrderItemDto(orderItem) {
  if (!orderItem) return null;

  const raw = typeof orderItem.toJSON === 'function' ? orderItem.toJSON() : orderItem;
  const formattedProduct = raw.Product 
    ? formatProductDto(raw.Product) 
    : (raw.product ? formatProductDto(raw.product) : null);

  return {
    id: raw.id,
    orderId: raw.OrderId || raw.orderId,
    productId: raw.ProductId || raw.productId,
    quantity: Number(raw.quantity),
    unitPrice: Number(raw.unitPrice),
    totalPrice: Number(raw.totalPrice),
    product: formattedProduct,
    Product: formattedProduct,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
}
