export function formatProductDto(product) {
  if (!product) return null;

  const raw = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const resolvedStationId = raw.stationId ?? raw.Category?.stationId ?? null;

  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price),
    category: raw.Category?.name || raw.category,
    categoryId: raw.categoryId || null,
    companyId: raw.companyId || null,
    stationId: resolvedStationId,
    Category: raw.Category ? {
      id: raw.Category.id,
      name: raw.Category.name,
      slug: raw.Category.slug,
      stationId: raw.Category.stationId || null,
    } : null,
    description: raw.description || '',
    imageUrl: raw.imageUrl || null,
    available: Boolean(raw.available),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
    deletedAt: raw.deletedAt ? new Date(raw.deletedAt).toISOString() : null,
  };
}
