import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productService from '../services/productService.js';

export const create = asyncHandler(async (req, res) => {
  const targetCompanyId = req.companyId || (req.user?.isSuperAdmin && req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : null);
  if (req.user?.isSuperAdmin && !targetCompanyId) {
    return res.status(400).json({ success: false, message: 'É obrigatório selecionar uma empresa para cadastrar produtos' });
  }
  const product = await productService.createProduct(req.body, req.user, targetCompanyId);
  res.status(201).json({ success: true, data: product });
});

export const getAll = asyncHandler(async (req, res) => {
  const { category, categoryId, onlyDeleted, page, limit, search } = req.query;
  const targetCompanyId = req.companyId || (req.user?.isSuperAdmin && req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : null);
  
  if (req.user?.isSuperAdmin && !targetCompanyId) {
    return res.status(200).json({
      success: true,
      data: page && limit ? { products: [], totalPages: 1, currentPage: 1, totalProducts: 0 } : []
    });
  }

  const products = await productService.findAll(category, onlyDeleted === 'true', page, limit, search, targetCompanyId, categoryId);
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