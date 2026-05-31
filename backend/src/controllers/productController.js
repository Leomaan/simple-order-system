import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';

export const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
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
  res.status(200).json({ success: true, data: product });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'product removed' });
});