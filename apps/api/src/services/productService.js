import { Op } from 'sequelize';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { calculateDiff } from '../util/diff.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';

const VALID_CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];
const PRODUCT_DIFF_FIELDS = ['name', 'price', 'category', 'available', 'description'];

export async function findAll(category, onlyDeleted = false, page, limit, search) {
  const where = {}; 

  if (category) {
    if (!VALID_CATEGORIES.includes(category))
      throw new AppError(`categoria inválida. Use: ${VALID_CATEGORIES.join(', ')}`);
    where.category = category;
  }

  if (search) {
    const { Op } = await import('sequelize');
    where.name = { [Op.like]: `%${search}%` };
  }

  const queryOptions = { 
    where,
    order: [['name', 'ASC']]
  };
  if (onlyDeleted) {
    const { Op } = await import('sequelize');
    queryOptions.paranoid = false;
    where.deletedAt = { [Op.ne]: null };
  }

  if (page && limit) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    queryOptions.limit = parsedLimit;
    queryOptions.offset = offset;

    const { count, rows } = await Product.findAndCountAll(queryOptions);
    return {
      products: rows,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalProducts: count,
    };
  }

  return Product.findAll(queryOptions);
}

export async function findById(id) {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError('product not found', 404);
  return product;
}

export async function createProduct(data, user = null) {
  const { name } = data;
  if (!name) throw new AppError('no data provided');

  const exists = await Product.findOne({ where: { name } });
  if (exists) throw new AppError('product already exists');

  const product = await Product.create(data);

  await log({
    user,
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    details: {
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
    },
  });

  logger.info('Novo produto cadastrado', { context: 'product_service', productId: product.id, name: product.name });
  emitEvent('product:created', product);

  return product;
}

export async function updateProduct(id, data, user = null) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const product = await findById(id);
  const oldValues = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };

  await product.update(data);

  const newValues = typeof product.toJSON === 'function' ? product.toJSON() : { ...product, ...data };
  const diff = calculateDiff(oldValues, newValues, PRODUCT_DIFF_FIELDS);

  await log({
    user,
    action: 'UPDATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    details: { name: newValues.name, diff },
  });

  logger.info('Produto atualizado', { context: 'product_service', productId: product.id, updatedBy: user?.userId || user?.id });
  emitEvent('product:updated', product);

  return product;
}

export async function deleteProduct(id, user = null) {
  const product = await findById(id);
  await product.destroy();

  await log({
    user,
    action: 'DELETE_PRODUCT',
    entity: 'Product',
    entityId: Number(id),
    details: { name: product.name },
  });

  logger.warn('Produto removido (Soft Delete)', { context: 'product_service', productId: id });
  emitEvent('product:deleted', { id: Number(id) });

  return product;
}

export async function restoreProduct(id, user = null) {
  const product = await Product.findOne({ where: { id }, paranoid: false });
  if (!product) throw new AppError('product not found or not deleted', 404);
  await product.restore();

  await log({
    user,
    action: 'RESTORE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    details: { name: product.name },
  });

  logger.info('Produto restaurado', { context: 'product_service', productId: product.id });
  emitEvent('product:restored', product);

  return product;
}

export async function permanentDeleteProduct(id, user = null) {
  const product = await Product.findOne({ where: { id }, paranoid: false });
  if (!product) throw new AppError('product not found', 404);
  await product.destroy({ force: true });

  await log({
    user,
    action: 'PERMANENT_DELETE_PRODUCT',
    entity: 'Product',
    entityId: Number(id),
    details: { name: product.name },
  });

  logger.warn('Produto excluído permanentemente', { context: 'product_service', productId: id });
  emitEvent('product:deleted', { id: Number(id) });

  return product;
}