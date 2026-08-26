import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderService from '../services/orderService.js';

export const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user);
  res.status(201).json({ success: true, data: order });
});

export const getAll = asyncHandler(async (req, res) => {
  const { status, page, limit, onlyDeleted } = req.query;
  const orders = await orderService.findAll(status, page, limit, onlyDeleted === 'true');
  res.status(200).json({ success: true, data: orders });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id);
  res.status(200).json({ success: true, data: order });
});

export const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: order });
});

export const close = asyncHandler(async (req, res) => {
  const order = await orderService.closeOrder(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
});

export const remove = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'order removed' });
});

export const restore = asyncHandler(async (req, res) => {
  const order = await orderService.restoreOrder(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
});

export const permanentDelete = asyncHandler(async (req, res) => {
  await orderService.permanentDeleteOrder(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'order permanently deleted' });
});