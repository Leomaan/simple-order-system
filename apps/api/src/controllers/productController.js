import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';
import { log } from '../services/auditLogService.js';
 
export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  await log({ user: req.user, action: 'CREATE_PRODUCT', entity: 'Product', entityId: product.id, details: { name: product.name } });
  res.status(201).json({ success: true, data: product });
});
 
export const getAll = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const products = await productService.findAll(category);
  res.status(200).json({ success: true, data: products });
});
 
export const getById = asyncHandler(async (req, res) => {
  const product = await productService.findById(req.params.id);
  res.status(200).json({ success: true, data: product });
});
 
export const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  await log({ user: req.user, action: 'UPDATE_PRODUCT', entity: 'Product', entityId: product.id, details: req.body });
  res.status(200).json({ success: true, data: product });
});
 
export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  await log({ user: req.user, action: 'DELETE_PRODUCT', entity: 'Product', entityId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'product removed' });
});
 
export const restore = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id);
  await log({ user: req.user, action: 'RESTORE_PRODUCT', entity: 'Product', entityId: product.id });
  res.status(200).json({ success: true, data: product });
});
 
export const permanentDelete = asyncHandler(async (req, res) => {
  await productService.permanentDeleteProduct(req.params.id);
  await log({ user: req.user, action: 'PERMANENT_DELETE_PRODUCT', entity: 'Product', entityId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'product permanently deleted' });
});