import { asyncHandler } from '../middleware/asyncHandler.js';
import * as orderItemService from '../services/orderItemService.js';
import { log } from '../services/auditLogService.js';
 
export const create = asyncHandler(async (req, res) => {
  const { item, created } = await orderItemService.addItem(req.body);
  const itemCompleto = await orderItemService.findById(item.id); 

  await log({ user: req.user, action: 'ADD_ORDER_ITEM', entity: 'OrderItem', entityId: item.id, details: { table: itemCompleto.Order.table, order: itemCompleto.OrderId, product: itemCompleto.Product.name, quantity: itemCompleto.quantity } });
  res.status(created ? 201 : 200).json({ success: true, data: item });
});
 
export const changeQuantity = asyncHandler(async (req, res) => {
  const item = await orderItemService.findById(req.params.id); // quantidade antiga
  const oldQty = item.quantity;
  const itemUpdated = await orderItemService.changeQuantity(
    req.params.id,
    req.body.quantity,
  );
  const diff = req.body.quantity - oldQty; 
  const change = diff > 0 ? `Adicionou ${diff}` : `Reduziu ${Math.abs(diff)}`;
  await log({ user: req.user, action: 'UPDATE_ORDER_ITEM', entity: 'OrderItem', entityId: itemUpdated.id, details: { table: item.Order.table, order: item.Order.id, product: item.Product.name, quantity: req.body.quantity, change: change } });
  res.status(200).json({ success: true, data: item });
});
 
export const remove = asyncHandler(async (req, res) => {
  const item = await orderItemService.findById(req.params.id);

  await orderItemService.removeItem(req.params.id);
  await log({ user: req.user, action: 'REMOVE_ORDER_ITEM', entity: 'OrderItem', entityId: Number(req.params.id), details: { table: item.Order.table, order: item.Order.id, product: item.Product.name } });
  res.status(200).json({ success: true, message: 'order item removed' });
});