import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';
import { log } from '../services/auditLogService.js';
 
export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  await log({ 
    user: req.user, 
    action: 'CREATE_PRODUCT', 
    entity: 'Product', 
    entityId: product.id, 
    details: { 
      name: product.name, 
      price: product.price, 
      category: product.category, 
      description: product.description 
    } 
  });
  res.status(201).json({ success: true, data: product });
});
 
export const getAll = asyncHandler(async (req, res) => {
  const { category, onlyDeleted, page, limit, search } = req.query;
  const products = await productService.findAll(category, onlyDeleted === 'true', page, limit, search);
  res.status(200).json({ success: true, data: products });
});
 
export const getById = asyncHandler(async (req, res) => {
  const product = await productService.findById(req.params.id);
  res.status(200).json({ success: true, data: product });
});
 
export const update = asyncHandler(async (req, res) => {
  const oldProduct = await productService.findById(req.params.id);
  const oldVal = {
    name: String(oldProduct.name || ''),
    price: Number(oldProduct.price || 0),
    category: String(oldProduct.category || ''),
    available: Boolean(oldProduct.available),
    description: String(oldProduct.description || '')
  };

  const product = await productService.updateProduct(req.params.id, req.body);
  const newVal = {
    name: String(product.name || ''),
    price: Number(product.price || 0),
    category: String(product.category || ''),
    available: Boolean(product.available),
    description: String(product.description || '')
  };

  const diff = {};
  if (req.body.price !== undefined && Math.abs(oldVal.price - newVal.price) > 0.001) {
    diff.price = { old: oldVal.price, new: newVal.price };
  }
  if (req.body.available !== undefined && oldVal.available !== newVal.available) {
    diff.available = { old: oldVal.available, new: newVal.available };
  }
  if (req.body.category !== undefined && oldVal.category !== newVal.category) {
    diff.category = { old: oldVal.category, new: newVal.category };
  }
  if (req.body.name !== undefined && oldVal.name !== newVal.name) {
    diff.name = { old: oldVal.name, new: newVal.name };
  }
  if (req.body.description !== undefined && oldVal.description !== newVal.description) {
    diff.description = { old: oldVal.description, new: newVal.description };
  }

  await log({ 
    user: req.user, 
    action: 'UPDATE_PRODUCT', 
    entity: 'Product', 
    entityId: product.id, 
    details: { name: newVal.name, diff } 
  });

  res.status(200).json({ success: true, data: product });
});
 
export const remove = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  await log({ user: req.user, action: 'DELETE_PRODUCT', entity: 'Product', entityId: Number(req.params.id), details: { name: product.name } });
  res.status(200).json({ success: true, message: 'product removed' });
});
 
export const restore = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id);
  await log({ user: req.user, action: 'RESTORE_PRODUCT', entity: 'Product', entityId: product.id, details: { name: product.name } });
  res.status(200).json({ success: true, data: product });
});
 
export const permanentDelete = asyncHandler(async (req, res) => {
  const product = await productService.permanentDeleteProduct(req.params.id);
  await log({ user: req.user, action: 'PERMANENT_DELETE_PRODUCT', entity: 'Product', entityId: Number(req.params.id), details: { name: product.name } });
  res.status(200).json({ success: true, message: 'product permanently deleted' });
});