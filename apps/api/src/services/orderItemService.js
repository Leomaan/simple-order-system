import OrderItem from '../models/orderItem.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { sequelize } from '../db/conn.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';
import { formatQuantityDiff } from '../util/diff.js';

export async function findById(id) {
  const item = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!item) throw new AppError('order item not found', 404);
  return item;
}

export async function addItem(data, user = null) {
  const { orderId, productId, quantity } = data;

  if (!orderId || !productId || !quantity)
    throw new AppError('no data provided');
  if (quantity <= 0)
    throw new AppError('invalid quantity');

  const { item, created, itemCompleto } = await sequelize.transaction(async (t) => {
    // Busca concorrente do pedido e produto sob transação com trava de atualização no pedido
    const [order, product] = await Promise.all([
      Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE }),
      Product.findByPk(productId, { transaction: t }),
    ]);

    if (!order || !product) throw new AppError('order or product not found', 404);
    if (order.status !== 'OPEN') throw new AppError('order is not open');
    if (!product.available) throw new AppError('product not available');

    // Busca se o item já existe para aquela mesa/pedido sob trava de atualização
    const existing = await OrderItem.findOne({
      where: { OrderId: orderId, ProductId: productId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      await existing.update({
        quantity: newQty,
        totalPrice: product.price * newQty,
      }, { transaction: t });
      return { 
        item: existing, 
        created: false, 
        itemCompleto: { Order: order, Product: product, OrderId: orderId, id: existing.id } 
      };
    }

    const newItem = await OrderItem.create({
      OrderId: orderId,
      ProductId: productId,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    }, { transaction: t });

    return { 
      item: newItem, 
      created: true, 
      itemCompleto: { Order: order, Product: product, OrderId: orderId, id: newItem.id } 
    };
  });

  await log({
    user,
    action: 'ADD_ORDER_ITEM',
    entity: 'OrderItem',
    entityId: item.id,
    details: {
      table: itemCompleto.Order?.table,
      order: itemCompleto.OrderId,
      product: itemCompleto.Product?.name,
      quantity,
    },
  });

  logger.info('Item adicionado ao pedido', {
    context: 'order_item_service',
    orderId: itemCompleto.OrderId,
    itemId: item.id,
    quantity,
  });

  emitEvent('order_item:created', { orderId: itemCompleto.OrderId, item });

  return { item, created };
}

export async function changeQuantity(id, quantity, user = null) {
  if (!quantity || quantity <= 0)
    throw new AppError('invalid quantity');

  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot change item of a closed order');

  const oldQty = orderItem.quantity;
  await orderItem.update({
    quantity,
    totalPrice: orderItem.Product ? orderItem.Product.price * quantity : orderItem.totalPrice,
  });

  const change = formatQuantityDiff(oldQty, quantity);

  await log({
    user,
    action: 'UPDATE_ORDER_ITEM',
    entity: 'OrderItem',
    entityId: orderItem.id,
    details: {
      table: orderItem.Order?.table,
      order: orderItem.Order?.id,
      product: orderItem.Product?.name,
      quantity,
      change,
    },
  });

  logger.info('Quantidade do item alterada', {
    context: 'order_item_service',
    itemId: orderItem.id,
    newQuantity: quantity,
  });

  emitEvent('order_item:updated', { orderId: orderItem.OrderId, item: orderItem });

  return orderItem;
}

export async function removeItem(id, user = null) {
  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot remove item from a closed order');

  await orderItem.destroy();

  await log({
    user,
    action: 'REMOVE_ORDER_ITEM',
    entity: 'OrderItem',
    entityId: Number(id),
    details: {
      table: orderItem.Order?.table,
      order: orderItem.Order?.id,
      product: orderItem.Product?.name,
    },
  });

  logger.warn('Item removido do pedido', {
    context: 'order_item_service',
    itemId: id,
    orderId: orderItem.Order?.id,
  });

  emitEvent('order_item:deleted', { orderId: orderItem.Order?.id, itemId: Number(id) });

  return { success: true };
}