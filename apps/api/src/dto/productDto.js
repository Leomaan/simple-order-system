export function formatProductDto(product) {
  if (!product) return null;

  const raw = typeof product.toJSON === 'function' ? product.toJSON() : product;

  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price),
    category: raw.category,
    description: raw.description || '',
    available: Boolean(raw.available),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
    deletedAt: raw.deletedAt ? new Date(raw.deletedAt).toISOString() : null,
  };
}
