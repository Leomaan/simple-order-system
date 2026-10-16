import OrderItem from '../models/orderItem.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { sequelize } from '../db/conn.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';
import { formatQuantityDiff } from '../util/diff.js';
import { formatOrderItemDto } from '../dto/orderItemDto.js';

export async function findById(id) {
  const item = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!item) throw new AppError('order item not found', 404);
  return formatOrderItemDto(item);
}

export async function addItem(data, user = null, companyId = null) {
  const { orderId, productId, quantity, notes } = data;

  if (!orderId || !productId || !quantity)
    throw new AppError('no data provided');
  if (quantity <= 0)
    throw new AppError('invalid quantity');

  const targetCompanyId = companyId || user?.companyId || null;

  const { item, created, itemCompleto } = await sequelize.transaction(async (t) => {
    // Busca concorrente do pedido e produto sob transação com trava de atualização no pedido
    const [order, product] = await Promise.all([
      Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE }),
      Product.findByPk(productId, { transaction: t }),
    ]);

    if (!order || !product) throw new AppError('order or product not found', 404);
    if (order.status !== 'OPEN') throw new AppError('order is not open');
    if (!product.available) throw new AppError('product not available');

    // Validação de isolamento multi-tenant
    if (targetCompanyId) {
      if (order.companyId && order.companyId !== targetCompanyId) {
        throw new AppError('acesso não autorizado a este pedido', 403);
      }
      if (product.companyId && product.companyId !== targetCompanyId) {
        throw new AppError('produto não pertence a este estabelecimento', 400);
      }
    }
    if (order.companyId && product.companyId && order.companyId !== product.companyId) {
      throw new AppError('produto incompatível com o estabelecimento do pedido', 400);
    }

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
        stationId: product.stationId || existing.stationId,
        notes: notes !== undefined ? notes : existing.notes,
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
      stationId: product.stationId || null,
      notes: notes || null,
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
      stationId: item.stationId,
      companyId: itemCompleto.Order?.companyId,
    },
    companyId: itemCompleto.Order?.companyId,
  });

  logger.info('Item adicionado ao pedido', {
    context: 'order_item_service',
    orderId: itemCompleto.OrderId,
    itemId: item.id,
    quantity,
    stationId: item.stationId,
    companyId: itemCompleto.Order?.companyId,
  });

  const formattedItem = formatOrderItemDto(item);
  const companyRoom = itemCompleto.Order?.companyId ? `company:${itemCompleto.Order.companyId}` : null;
  emitEvent('order_item:created', { orderId: itemCompleto.OrderId, item: formattedItem }, companyRoom);

  return { item: formattedItem, created };
}

export async function changeQuantity(id, quantity, user = null) {
  if (!quantity || quantity <= 0)
    throw new AppError('invalid quantity');

  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot change item of a closed order');
  if (orderItem.Order?.status === 'PAID')
    throw new AppError('cannot change item of a paid order');

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

  const formattedItem = formatOrderItemDto(orderItem);
  const companyRoom = orderItem.Order?.companyId ? `company:${orderItem.Order.companyId}` : null;
  emitEvent('order_item:updated', { orderId: orderItem.OrderId, item: formattedItem }, companyRoom);

  return formattedItem;
}

export async function removeItem(id, user = null) {
  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot remove item from a closed order');
  if (orderItem.Order?.status === 'PAID')
    throw new AppError('cannot remove item from a paid order');

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

  const companyRoom = orderItem.Order?.companyId ? `company:${orderItem.Order.companyId}` : null;
  emitEvent('order_item:deleted', { orderId: orderItem.Order?.id, itemId: Number(id) }, companyRoom);

  return { success: true };
}

export async function updateStatus(id, newStatus, user = null) {
  const validStatuses = ['PENDING', 'QUEUED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    throw new AppError('status de item inválido', 400);
  }

  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('item do pedido não encontrado', 404);

  await orderItem.update({ status: newStatus });

  const companyRoom = orderItem.Order?.companyId ? `company:${orderItem.Order.companyId}` : null;
  const payload = {
    itemId: orderItem.id,
    orderId: orderItem.OrderId,
    table: orderItem.Order?.table,
    status: newStatus,
    productName: orderItem.Product?.name,
  };

  emitEvent('item_status_changed', payload, companyRoom);
  emitEvent('order_item:status_changed', payload, companyRoom);

  return orderItem;
}

export async function claimDelivery(id, user) {
  return await sequelize.transaction(async (t) => {
    const item = await OrderItem.findByPk(id, {
      include: [Order, Product],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!item) throw new AppError('item não encontrado', 404);

    if (item.status === 'DELIVERING' && item.deliveredById && item.deliveredById !== user.userId) {
      throw new AppError('este item já foi assumido por outro garçom', 409);
    }

    if (item.status === 'DELIVERED') {
      throw new AppError('este item já foi entregue na mesa', 400);
    }

    await item.update({
      status: 'DELIVERING',
      deliveredById: user.userId,
    }, { transaction: t });

    const companyRoom = item.Order?.companyId ? `company:${item.Order.companyId}` : null;
    const payload = {
      itemId: item.id,
      orderId: item.OrderId,
      table: item.Order?.table,
      status: 'DELIVERING',
      deliveredBy: {
        id: user.userId,
        name: user.name,
      },
      productName: item.Product?.name,
    };

    // Notifica em broadcast imediato para bloquear o prato nos outros celulares
    emitEvent('delivery_claimed', payload, companyRoom);
    emitEvent('order_item:status_changed', payload, companyRoom);

    return item;
  });
}