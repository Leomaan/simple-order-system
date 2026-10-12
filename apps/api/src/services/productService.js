import { Op } from 'sequelize';
import Product from '../models/product.js';
import Category from '../models/category.js';
import { AppError } from '../middleware/appError.js';
import { calculateDiff } from '../util/diff.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';
import { notifyMenuUpdate } from '../util/notifyMenuUpdate.js';
import { formatProductDto } from '../dto/productDto.js';

const PRODUCT_DIFF_FIELDS = ['name', 'price', 'category', 'categoryId', 'stationId', 'available', 'description'];

export async function findAll(category, onlyDeleted = false, page, limit, search, companyId = null, categoryId = null) {
  const where = {}; 

  if (companyId) {
    where.companyId = companyId;
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  } else if (category) {
    if (!isNaN(category)) {
      where.categoryId = Number(category);
    } else {
      where[Op.or] = [
        { category: { [Op.like]: `%${category}%` } },
        { '$Category.slug$': category },
        { '$Category.name$': category },
      ];
    }
  }

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }

  const queryOptions = { 
    where,
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'stationId'],
        required: false,
      },
    ],
    order: [['name', 'ASC']]
  };

  if (onlyDeleted) {
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
      products: rows.map(formatProductDto),
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalProducts: count,
    };
  }

  const products = await Product.findAll(queryOptions);
  return products.map(formatProductDto);
}

export async function findById(id, companyId = null) {
  const where = { id };
  if (companyId) where.companyId = companyId;

  const product = await Product.findOne({
    where,
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'stationId'],
        required: false,
      },
    ],
  });

  if (!product) throw new AppError('product not found', 404);
  return formatProductDto(product);
}

export async function createProduct(data, user = null, companyId = null) {
  const targetCompanyId = companyId || user?.companyId || null;
  const { name, categoryId, category } = data;
  if (!name) throw new AppError('no data provided');

  const whereExists = { name };
  if (targetCompanyId) whereExists.companyId = targetCompanyId;
  const exists = await Product.findOne({ where: whereExists });
  if (exists) throw new AppError('product already exists');

  let resolvedCategory = category;
  let resolvedStationId = data.stationId;

  if (categoryId) {
    const cat = await Category.findByPk(categoryId);
    if (cat) {
      resolvedCategory = cat.name;
      if (!resolvedStationId && cat.stationId) {
        resolvedStationId = cat.stationId;
      }
    }
  }

  const product = await Product.create({
    ...data,
    companyId: targetCompanyId,
    category: resolvedCategory || 'Geral',
    categoryId: categoryId || null,
    stationId: resolvedStationId || null,
  });

  const createdProduct = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'stationId'],
        required: false,
      },
    ],
  });

  await log({
    user,
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    details: {
      name: product.name,
      price: product.price,
      category: resolvedCategory,
      categoryId,
      description: product.description,
      companyId: targetCompanyId,
    },
  });

  logger.info('Novo produto cadastrado', { context: 'product_service', productId: product.id, name: product.name, companyId: targetCompanyId });
  const formattedProduct = formatProductDto(createdProduct || product);
  emitEvent('product:created', formattedProduct);
  notifyMenuUpdate('created', formattedProduct);

  return formattedProduct;
}

export async function updateProduct(id, data, user = null, companyId = null) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const where = { id };
  if (companyId) where.companyId = companyId;

  const product = await Product.findOne({
    where,
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'stationId'],
        required: false,
      },
    ],
  });
  if (!product) throw new AppError('product not found', 404);
  const oldValues = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };

  let updatePayload = { ...data };
  if (data.categoryId) {
    const cat = await Category.findByPk(data.categoryId);
    if (cat) {
      updatePayload.category = cat.name;
      if (!updatePayload.stationId && cat.stationId) {
        updatePayload.stationId = cat.stationId;
      }
    }
  }

  await product.update(updatePayload);

  const updatedProduct = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'stationId'],
        required: false,
      },
    ],
  });

  const newValues = typeof updatedProduct.toJSON === 'function' ? updatedProduct.toJSON() : { ...updatedProduct };
  const diff = calculateDiff(oldValues, newValues, PRODUCT_DIFF_FIELDS);

  await log({
    user,
    action: 'UPDATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    details: { name: newValues.name, diff },
  });

  logger.info('Produto atualizado', { context: 'product_service', productId: product.id, updatedBy: user?.userId || user?.id });
  const formattedProduct = formatProductDto(updatedProduct);
  emitEvent('product:updated', formattedProduct);
  notifyMenuUpdate('updated', formattedProduct);

  return formattedProduct;
}

export async function deleteProduct(id, user = null, companyId = null) {
  const where = { id };
  if (companyId) where.companyId = companyId;

  const product = await Product.findOne({ where });
  if (!product) throw new AppError('product not found', 404);
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
  notifyMenuUpdate('deleted', { id: Number(id) });

  return formatProductDto(product);
}

export async function restoreProduct(id, user = null, companyId = null) {
  const where = { id };
  if (companyId) where.companyId = companyId;

  const product = await Product.findOne({ where, paranoid: false });
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
  const formattedProduct = formatProductDto(product);
  emitEvent('product:restored', formattedProduct);
  notifyMenuUpdate('restored', formattedProduct);

  return formattedProduct;
}

export async function permanentDeleteProduct(id, user = null, companyId = null) {
  const where = { id };
  if (companyId) where.companyId = companyId;

  const product = await Product.findOne({ where, paranoid: false });
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
  notifyMenuUpdate('deleted', { id: Number(id) });

  return formatProductDto(product);
}