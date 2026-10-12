import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user, req.companyId);
  res.status(201).json({ success: true, data: product });
});

export const getAll = asyncHandler(async (req, res) => {
  const { category, categoryId, onlyDeleted, page, limit, search } = req.query;
  const products = await productService.findAll(category, onlyDeleted === 'true', page, limit, search, req.companyId, categoryId);
  res.status(200).json({ success: true, data: products });
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productService.findById(req.params.id, req.companyId);
  res.status(200).json({ success: true, data: product });
});

export const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user, req.companyId);
  res.status(200).json({ success: true, data: product });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, message: 'product removed' });
});

export const restore = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, data: product });
});

export const permanentDelete = asyncHandler(async (req, res) => {
  await productService.permanentDeleteProduct(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, message: 'product permanently deleted' });
});