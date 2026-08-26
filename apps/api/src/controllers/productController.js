import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user);
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
  const product = await productService.updateProduct(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: product });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'product removed' });
});

export const restore = asyncHandler(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id, req.user);
  res.status(200).json({ success: true, data: product });
});

export const permanentDelete = asyncHandler(async (req, res) => {
  await productService.permanentDeleteProduct(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'product permanently deleted' });
});