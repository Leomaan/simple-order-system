import { Op } from 'sequelize';
import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { updateTotal } from '../util/updateTotalOrder.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';

const VALID_STATUSES = ['OPEN', 'PAID', 'CLOSED'];

export async function findAll(status, page, limit, onlyDeleted = false) {
  const where = {};

  if (status) {
    if (!VALID_STATUSES.includes(status))
      throw new AppError(`status inválido. Use: ${VALID_STATUSES.join(', ')}`);
    where.status = status;
  }

  const queryOptions = {
    where,
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'price'], 
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  };

  if (onlyDeleted) {
    const { Op } = await import('sequelize');
    queryOptions.paranoid = false;
    where.deletedAt = { [Op.ne]: null };
  }

  if (page && limit) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;
    
    queryOptions.limit = parsedLimit;
    queryOptions.offset = offset;

    const { count, rows } = await Order.findAndCountAll(queryOptions);
    return {
      orders: rows,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalOrders: count,
    };
  }

  return Order.findAll(queryOptions);
}

export async function findById(id) {
  const order = await Order.findByPk(id, {
    attributes: ['id', 'table', 'status', 'paymentMethod', 'paymentId', 'paymentQrCode', 'paymentQrCodeCopy', 'paymentExpiresAt'],
    include: [
      {
        model: OrderItem,
        attributes: ['id', 'quantity', 'unitPrice', 'totalPrice'],
        include: [{ model: Product, attributes: ['name', 'price'] }],
      },
    ],
  });

  if (!order) throw new AppError('order not found', 404);

  const total = updateTotal(order.OrderItems);
  return { ...(typeof order.toJSON === 'function' ? order.toJSON() : order), total };
}

export async function createOrder(data, user = null) {
  const { table } = data;
  if (!table) throw new AppError('table is required');

  const openOrder = await Order.findOne({ where: { table, status: 'OPEN' } });
  if (openOrder) throw new AppError('there is already an open order for this table');

  const order = await Order.create(data);

  await log({
    user,
    action: 'CREATE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id }
  });

  logger.info('Novo pedido criado', { context: 'order_service', orderId: order.id, table: order.table, total: order.total });
  emitEvent('order:created', order);

  return order;
}

export async function updateOrder(id, data, user = null) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const order = await Order.findByPk(id);
  if (!order) throw new AppError('order not found', 404);

  if (order.status !== 'OPEN' && data.status === 'OPEN')
    throw new AppError('cannot reopen a closed order');

  const oldTable = order.table;
  await order.update(data);

  await log({
    user,
    action: 'UPDATE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { order: order.id, oldTable, newTable: order.table }
  });

  logger.info('Pedido atualizado', { context: 'order_service', orderId: order.id, updatedBy: user?.userId || user?.id });
  emitEvent('order:updated', order);

  return order;
}

export async function closeOrder(id, user = null) {
  const order = await Order.findByPk(id, {
    include: [OrderItem],
  });

  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('order is already closed');
  if (!order.OrderItems?.length) throw new AppError('cannot close an empty order');

  const total = order.OrderItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );

  await order.update({ status: 'CLOSED' });

  const result = {
    ...(typeof order.toJSON === 'function' ? order.toJSON() : order),
    total,
  };

  await log({
    user,
    action: 'CLOSE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, total }
  });

  logger.info('Pedido encerrado', { context: 'order_service', orderId: order.id, table: order.table, total });
  emitEvent('order:closed', result);

  return result;
}

export async function deleteOrder(id, userOrRole) {
  const userRole = typeof userOrRole === 'object' && userOrRole !== null ? userOrRole.role : userOrRole;
  const user = typeof userOrRole === 'object' && userOrRole !== null ? userOrRole : null;

  const order = await Order.findByPk(id);

  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('cannot delete a closed order');

  if (userRole !== 'ADMIN') {
    throw new AppError('apenas administradores podem excluir pedidos', 403);
  }

  await order.destroy();

  await log({
    user,
    action: 'DELETE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id }
  });

  logger.warn('Pedido removido (Soft Delete)', { context: 'order_service', orderId: order.id, removedBy: user?.userId || user?.id });
  emitEvent('order:deleted', { id: Number(id) });

  return order;
}

export async function restoreOrder(id, user = null) {
  const order = await Order.findOne({ where: { id }, paranoid: false });
  if (!order) throw new AppError('order not found or not deleted', 404);
  await order.restore();

  await log({
    user,
    action: 'RESTORE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id }
  });

  logger.info('Pedido restaurado', { context: 'order_service', orderId: order.id, restoredBy: user?.userId || user?.id });
  emitEvent('order:restored', order);

  return order;
}

export async function permanentDeleteOrder(id, user = null) {
  const order = await Order.findByPk(id, { paranoid: false });
  if (!order) throw new AppError('order not found', 404);
  await order.destroy({ force: true });

  await log({
    user,
    action: 'PERMANENT_DELETE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id }
  });

  logger.warn('Pedido excluído permanentemente', { context: 'order_service', orderId: order.id, deletedBy: user?.userId || user?.id });
  emitEvent('order:deleted', { id: Number(id) });

  return order;
}