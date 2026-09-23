export function formatPublicProductDto(product) {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    category: product.category,
    available: Boolean(product.available),
  };
}
