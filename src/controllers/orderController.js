import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderService from '../services/orderService.js';

export const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({ success: true, data: order });
});

export const getAll = asyncHandler(async (req, res) => {
  const orders = await orderService.findAll();
  res.status(200).json({ success: true, data: orders });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id);
  res.status(200).json({ success: true, data: order });
});

export const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  res.status(200).json({ success: true, data: order });
});

export const close = asyncHandler(async (req, res) => {
  const order = await orderService.closeOrder(req.params.id);
  res.status(200).json({ success: true, data: order });
});

export const remove = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id);
  res.status(200).json({ success: true, message: 'order removed' });
});