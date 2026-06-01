import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderItemService from '../services/orderItemService.js';
import { log } from '../services/auditLogService.js';
 
export const create = asyncHandler(async (req, res) => {
  const item = await orderItemService.addItem(req.body);
  await log({ user: req.user, action: 'ADD_ORDER_ITEM', entity: 'OrderItem', entityId: item.id, details: { orderId: item.OrderId, productId: item.ProductId, quantity: item.quantity } });
  res.status(201).json({ success: true, data: item });
});
 
export const changeQuantity = asyncHandler(async (req, res) => {
  const item = await orderItemService.changeQuantity(req.params.id, req.body.quantity);
  await log({ user: req.user, action: 'UPDATE_ORDER_ITEM', entity: 'OrderItem', entityId: item.id, details: { quantity: req.body.quantity } });
  res.status(200).json({ success: true, data: item });
});
 
export const remove = asyncHandler(async (req, res) => {
  await orderItemService.removeItem(req.params.id);
  await log({ user: req.user, action: 'REMOVE_ORDER_ITEM', entity: 'OrderItem', entityId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'order item removed' });
});