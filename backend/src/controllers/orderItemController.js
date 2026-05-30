import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderItemService from '../services/orderItemService.js';

export const create = asyncHandler(async (req, res) => {
  const item = await orderItemService.addItem(req.body);
  res.status(201).json({ success: true, data: item });
});

export const changeQuantity = asyncHandler(async (req, res) => {
  const item = await orderItemService.changeQuantity(req.params.id, req.body.quantity);
  res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await orderItemService.removeItem(req.params.id);
  res.status(200).json({ success: true, message: 'order item removed' });
});