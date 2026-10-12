import { asyncHandler } from '../middleware/asyncHandler.js';
import * as categoryService from '../services/categoryService.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.companyId);
  res.status(200).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.companyId, req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.companyId, req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.companyId, req.params.id);
  res.status(200).json({ success: true, message: 'Categoria removida com sucesso' });
});
