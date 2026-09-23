import Product from '../models/product.js';
import { formatPublicProductDto } from '../dto/publicProductDto.js';

const PUBLIC_PRODUCT_ATTRIBUTES = ['id', 'name', 'price', 'description', 'category', 'available'];

export async function getPublicMenuProducts() {
  const where = {
    available: true,
  };

  const products = await Product.findAll({
    attributes: PUBLIC_PRODUCT_ATTRIBUTES,
    where,
    order: [
      ['name', 'ASC'],
    ],
    raw: true,
  });

  return products.map(formatPublicProductDto);
}
