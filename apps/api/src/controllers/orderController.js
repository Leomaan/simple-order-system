import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderService from '../services/orderService.js';
import { log } from '../services/auditLogService.js';
import logger from '../util/logger.js';

export const create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  await log({ user: req.user, action: 'CREATE_ORDER', entity: 'Order', entityId: order.id, details: { table: order.table, order: order.id } });
  logger.info('Novo pedido criado', { context: 'order_controller', orderId: order.id, table: order.table, total: order.total });
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
  const oldOrder = await orderService.findById(req.params.id);
  const order = await orderService.updateOrder(req.params.id, req.body);
  await log({ user: req.user, action: 'UPDATE_ORDER', entity: 'Order', entityId: order.id, details: {order: order.id, oldTable: oldOrder.table, newTable: order.table}});
  logger.info('Pedido atualizado', { context: 'order_controller', orderId: order.id, updatedBy: req.user?.id });
  res.status(200).json({ success: true, data: order });
});
 
export const close = asyncHandler(async (req, res) => {
  const order = await orderService.closeOrder(req.params.id);
  await log({ user: req.user, action: 'CLOSE_ORDER', entity: 'Order', entityId: order.id, details: { table: order.table, order: order.id, total: order.total } });
  logger.info('Pedido encerrado', { context: 'order_controller', orderId: order.id, table: order.table, total: order.total });
  res.status(200).json({ success: true, data: order });
});
 
export const remove = asyncHandler(async (req, res) => {
  const order = await orderService.findById(req.params.id);
  await orderService.deleteOrder(req.params.id, req.user.role);
  await log({ user: req.user, action: 'DELETE_ORDER', entity: 'Order', entityId: order.id, details: { table: order.table, order: order.id }});
  logger.warn('Pedido removido (Soft Delete)', { context: 'order_controller', orderId: order.id, removedBy: req.user?.id });
  res.status(200).json({ success: true, message: 'order removed' });
});
 
export const restore = asyncHandler(async (req, res) => {
  const order = await orderService.restoreOrder(req.params.id);
  await log({ user: req.user, action: 'RESTORE_ORDER', entity: 'Order', entityId: order.id ,details:{ table: order.table, order: order.id} });
  logger.info('Pedido restaurado', { context: 'order_controller', orderId: order.id, restoredBy: req.user?.id });
  res.status(200).json({ success: true, data: order });
});
 
export const permanentDelete = asyncHandler(async (req, res) => {
  const order = await orderService.permanentDeleteOrder(req.params.id);
  await log({ user: req.user, action: 'PERMANENT_DELETE_ORDER', entity: 'Order', entityId: order.id, details: { table: order.table, order: order.id }});
  logger.warn('Pedido excluído permanentemente', { context: 'order_controller', orderId: order.id, deletedBy: req.user?.id });
  res.status(200).json({ success: true, message: 'order permanently deleted' });
});