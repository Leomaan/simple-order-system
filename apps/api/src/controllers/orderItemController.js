import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderItemService from '../services/orderItemService.js';
import { log } from '../services/auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';
 
export const create = asyncHandler(async (req, res) => {
  const { item, created } = await orderItemService.addItem(req.body);
  const itemCompleto = await orderItemService.findById(item.id); 
  await log({ user: req.user, action: 'ADD_ORDER_ITEM', entity: 'OrderItem', entityId: item.id, details: { table: itemCompleto.Order.table, order: itemCompleto.OrderId, product: itemCompleto.Product.name, quantity: req.body.quantity } });
  logger.info('Item adicionado ao pedido', { context: 'order_item_controller', orderId: itemCompleto.OrderId, itemId: item.id, quantity: req.body.quantity });
  
  emitEvent('order_item:created', { orderId: itemCompleto.OrderId, item: itemCompleto });
  res.status(created ? 201 : 200).json({ success: true, data: item });
});
 
export const changeQuantity = asyncHandler(async (req, res) => {
  const item = await orderItemService.findById(req.params.id);
  const oldQty = item.quantity;
  const itemUpdated = await orderItemService.changeQuantity(req.params.id, req.body.quantity,);
  const diff = req.body.quantity - oldQty; 
  const change = diff > 0 ? `Adicionou ${diff}` : `Reduziu ${Math.abs(diff)}`;
  await log({ user: req.user, action: 'UPDATE_ORDER_ITEM', entity: 'OrderItem', entityId: itemUpdated.id, details: { table: item.Order.table, order: item.Order.id, product: item.Product.name, quantity: req.body.quantity, change: change } });
  logger.info('Quantidade do item alterada', { context: 'order_item_controller', itemId: itemUpdated.id, newQuantity: req.body.quantity });
  
  emitEvent('order_item:updated', { orderId: item.OrderId, item: itemUpdated });
  res.status(200).json({ success: true, data: itemUpdated });
});
 
export const remove = asyncHandler(async (req, res) => {
  const item = await orderItemService.findById(req.params.id);

  await orderItemService.removeItem(req.params.id);
  await log({ user: req.user, action: 'REMOVE_ORDER_ITEM', entity: 'OrderItem', entityId: Number(req.params.id), details: { table: item.Order.table, order: item.Order.id, product: item.Product.name } });
  logger.warn('Item removido do pedido', { context: 'order_item_controller', itemId: req.params.id, orderId: item.Order?.id });
  
  emitEvent('order_item:deleted', { orderId: item.Order?.id, itemId: Number(req.params.id) });
  res.status(200).json({ success: true, message: 'order item removed' });
});