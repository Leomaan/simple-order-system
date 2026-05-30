import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';

const VALID_CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

export async function findAll(category) {
  if (category) {
    if (!VALID_CATEGORIES.includes(category))
      throw new AppError(`categoria inválida. Use: ${VALID_CATEGORIES.join(', ')}`);

    return Product.findAll({ where: { category } });
  }

  return Product.findAll();
}

export async function findById(id) {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('product not found', 404);
  return product;
}

export async function createProduct(data) {
  const { name } = data;
  if (!name) throw new AppError('no data provided');

  const exists = await Product.findOne({ where: { name } });
  if (exists) throw new AppError('product already exists');

  return Product.create(data);
}

export async function updateProduct(id, data) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const product = await findById(id);
  await product.update(data);
  return product;
}

export async function deleteProduct(id) {
  const product = await findById(id);
  await product.destroy();
}