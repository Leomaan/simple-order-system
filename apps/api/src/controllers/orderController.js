import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderService from '../services/orderService.js';

export const create = asyncHandler(async (req, res) => {
  const targetCompanyId = req.companyId || (req.user?.isSuperAdmin && req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : null);
  if (req.user?.isSuperAdmin && !targetCompanyId) {
    return res.status(400).json({ success: false, message: 'É obrigatório selecionar uma empresa para abrir pedidos' });
  }
  const order = await orderService.createOrder(req.body, req.user, targetCompanyId);
  res.status(201).json({ success: true, data: order });
});

export const getAll = asyncHandler(async (req, res) => {
  const { status, page, limit, onlyDeleted } = req.query;
  const targetCompanyId = req.companyId || (req.user?.isSuperAdmin && req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : null);
  
  if (req.user?.isSuperAdmin && !targetCompanyId) {
    return res.status(200).json({
      success: true,
      data: page && limit ? { orders: [], totalPages: 1, currentPage: 1, totalOrders: 0 } : []
    });
  }

  const orders = await orderService.findAll(status, page, limit, onlyDeleted === 'true', targetCompanyId);
  res.status(200).json({ success: true, data: orders });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id, req.companyId);
  res.status(200).json({ success: true, data: order });
});

export const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body, req.user, req.companyId);
  res.status(200).json({ success: true, data: order });
});

export const close = asyncHandler(async (req, res) => {
  const order = await orderService.closeOrder(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, data: order });
});

export const reopen = asyncHandler(async (req, res) => {
  const order = await orderService.reopenOrder(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, message: 'Pedido reaberto com sucesso', data: order });
});

export const remove = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, message: 'order removed' });
});

export const restore = asyncHandler(async (req, res) => {
  const order = await orderService.restoreOrder(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, data: order });
});

export const permanentDelete = asyncHandler(async (req, res) => {
  await orderService.permanentDeleteOrder(req.params.id, req.user, req.companyId);
  res.status(200).json({ success: true, message: 'order permanently deleted' });
});