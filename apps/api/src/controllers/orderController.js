import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderService from '../services/orderService.js';
import { log } from '../services/auditLogService.js';
 
export const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  await log({ user: req.user, action: 'CREATE_ORDER', entity: 'Order', entityId: order.id, details: { table: order.table } });
  res.status(201).json({ success: true, data: order });
});
 
export const getAll = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders = await orderService.findAll(status);
  res.status(200).json({ success: true, data: orders });
});
 
export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id);
  res.status(200).json({ success: true, data: order });
});
 
export const update = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  await log({ user: req.user, action: 'UPDATE_ORDER', entity: 'Order', entityId: order.id, details: req.body });
  res.status(200).json({ success: true, data: order });
});
 
export const close = asyncHandler(async (req, res) => {
  const order = await orderService.closeOrder(req.params.id);
  await log({ user: req.user, action: 'CLOSE_ORDER', entity: 'Order', entityId: order.id });
  res.status(200).json({ success: true, data: order });
});
 
export const remove = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id);
  await log({ user: req.user, action: 'DELETE_ORDER', entity: 'Order', entityId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'order removed' });
});
 
export const restore = asyncHandler(async (req, res) => {
  const order = await orderService.restoreOrder(req.params.id);
  await log({ user: req.user, action: 'RESTORE_ORDER', entity: 'Order', entityId: order.id });
  res.status(200).json({ success: true, data: order });
});
 
export const permanentDelete = asyncHandler(async (req, res) => {
  await orderService.permanentDeleteOrder(req.params.id);
  await log({ user: req.user, action: 'PERMANENT_DELETE_ORDER', entity: 'Order', entityId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'order permanently deleted' });
});