import { Op } from 'sequelize';
import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { updateTotal } from '../util/updateTotalOrder.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';
import { formatOrderDto } from '../dto/orderDto.js';

const VALID_STATUSES = ['OPEN', 'PAID', 'CLOSED'];

export async function findAll(status, page, limit, onlyDeleted = false, companyId = null) {
  const where = {};

  if (companyId) {
    where.companyId = companyId;
  }

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
            attributes: ['id', 'name', 'price', 'category', 'categoryId', 'stationId'], 
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  };

  if (onlyDeleted) {
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
      orders: rows.map(formatOrderDto),
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalOrders: count,
    };
  }

  const orders = await Order.findAll(queryOptions);
  return orders.map(formatOrderDto);
}

export async function findById(id, companyId = null) {
  const queryOptions = {
    attributes: ['id', 'table', 'status', 'companyId', 'paymentMethod', 'paymentId', 'paymentQrCode', 'paymentQrCodeCopy', 'paymentExpiresAt', 'createdAt', 'updatedAt'],
    include: [
      {
        model: OrderItem,
        attributes: ['id', 'OrderId', 'quantity', 'unitPrice', 'totalPrice', 'ProductId', 'stationId', 'status', 'deliveredById', 'notes', 'createdAt', 'updatedAt'],
        include: [{ model: Product, attributes: ['id', 'name', 'price', 'category', 'categoryId', 'stationId'] }],
      },
    ],
  };

  const order = companyId
    ? await Order.findOne({ where: { id, companyId }, ...queryOptions })
    : await Order.findByPk(id, queryOptions);

  if (!order) throw new AppError('order not found', 404);

  return formatOrderDto(order);
}

export async function createOrder(data, user = null, companyId = null) {
  const { table } = data;
  if (!table) throw new AppError('table is required');

  const targetCompanyId = companyId || user?.companyId || data.companyId || null;
  const where = { table, status: 'OPEN' };
  if (targetCompanyId) {
    where.companyId = targetCompanyId;
  }

  const openOrder = await Order.findOne({ where });
  if (openOrder) throw new AppError('there is already an open order for this table');

  const orderData = { ...data };
  if (targetCompanyId) {
    orderData.companyId = targetCompanyId;
  }

  const order = await Order.create(orderData);

  await log({
    user,
    action: 'CREATE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.info('Novo pedido criado', { context: 'order_service', orderId: order.id, table: order.table, total: order.total, companyId: order.companyId });
  const formattedOrder = formatOrderDto(order);
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:created', formattedOrder, companyRoom);
  } else {
    emitEvent('order:created', formattedOrder);
  }

  return formattedOrder;
}

export async function updateOrder(id, data, user = null, companyId = null) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const targetCompanyId = companyId || user?.companyId || null;
  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, include: [OrderItem] })
    : await Order.findByPk(id, { include: [OrderItem] });

  if (!order) throw new AppError('order not found', 404);

  if (order.status !== 'OPEN') {
    throw new AppError('apenas pedidos abertos podem ser alterados', 400);
  }

  if (data.status !== undefined && data.status !== order.status) {
    throw new AppError('o status do pedido não pode ser alterado diretamente por esta rota', 400);
  }

  const { status, ...allowedUpdates } = data;

  if (allowedUpdates.table && allowedUpdates.table !== order.table) {
    const tableWhere = {
      table: allowedUpdates.table,
      status: 'OPEN',
      id: { [Op.ne]: order.id },
    };
    if (order.companyId) {
      tableWhere.companyId = order.companyId;
    }

    const existingOpenOrder = await Order.findOne({ where: tableWhere });

    if (existingOpenOrder) {
      throw new AppError(`A mesa ${allowedUpdates.table} já possui outro pedido aberto (#${existingOpenOrder.id})`, 400);
    }
  }

  const oldTable = order.table;
  await order.update(allowedUpdates);

  await log({
    user,
    action: 'UPDATE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { order: order.id, oldTable, newTable: order.table, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.info('Pedido atualizado', { context: 'order_service', orderId: order.id, updatedBy: user?.userId || user?.id, companyId: order.companyId });
  const formattedOrder = formatOrderDto(order);
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:updated', formattedOrder, companyRoom);
  } else {
    emitEvent('order:updated', formattedOrder);
  }

  return formattedOrder;
}

export async function closeOrder(id, user = null, companyId = null) {
  const targetCompanyId = companyId || user?.companyId || null;
  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, include: [OrderItem] })
    : await Order.findByPk(id, { include: [OrderItem] });

  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('order is already closed');
  if (!order.OrderItems?.length) throw new AppError('cannot close an empty order');

  const total = order.OrderItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );

  await order.update({ status: 'CLOSED' });

  const formattedOrder = formatOrderDto(order);

  await log({
    user,
    action: 'CLOSE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, total, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.info('Pedido encerrado', { context: 'order_service', orderId: order.id, table: order.table, total, companyId: order.companyId });
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:closed', formattedOrder, companyRoom);
  } else {
    emitEvent('order:closed', formattedOrder);
  }

  return formattedOrder;
}

export async function reopenOrder(id, user = null, companyId = null) {
  const targetCompanyId = companyId || user?.companyId || null;
  const queryOptions = {
    include: [
      {
        model: OrderItem,
        include: [Product]
      }
    ],
  };

  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, ...queryOptions })
    : await Order.findByPk(id, queryOptions);

  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'PAID') throw new AppError('Não é possível reabrir um pedido que já foi pago', 400);
  if (order.status === 'OPEN') throw new AppError('Este pedido já está aberto', 400);

  // Check if another order is already open for this table in this company
  const tableWhere = {
    table: order.table,
    status: 'OPEN',
    id: { [Op.ne]: order.id }
  };
  if (order.companyId) {
    tableWhere.companyId = order.companyId;
  }

  const existingOpenOrder = await Order.findOne({ where: tableWhere });

  if (existingOpenOrder) {
    throw new AppError(`A mesa ${order.table} já possui outro pedido aberto (#${existingOpenOrder.id})`, 400);
  }

  // Clear payment fields when reopening
  await order.update({
    status: 'OPEN',
    paymentMethod: null,
    paymentId: null,
    paymentQrCode: null,
    paymentQrCodeCopy: null,
    paymentExpiresAt: null
  });

  await log({
    user,
    action: 'REOPEN_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.info('Pedido reaberto com sucesso', { context: 'order_service', orderId: order.id, table: order.table, companyId: order.companyId });
  const formattedOrder = formatOrderDto(order);
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:updated', formattedOrder, companyRoom);
  } else {
    emitEvent('order:updated', formattedOrder);
  }

  return formattedOrder;
}

export async function deleteOrder(id, userOrRole, companyId = null) {
  const userRole = typeof userOrRole === 'object' && userOrRole !== null ? userOrRole.role : userOrRole;
  const user = typeof userOrRole === 'object' && userOrRole !== null ? userOrRole : null;

  const targetCompanyId = companyId || user?.companyId || null;
  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, include: [OrderItem] })
    : await Order.findByPk(id, { include: [OrderItem] });

  if (!order) throw new AppError('order not found', 404);

  if (userRole !== 'ADMIN') {
    throw new AppError('apenas administradores podem excluir pedidos', 403);
  }

  await order.destroy();

  await log({
    user,
    action: 'DELETE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.warn('Pedido removido (Soft Delete)', { context: 'order_service', orderId: order.id, removedBy: user?.userId || user?.id, companyId: order.companyId });
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:deleted', { id: Number(id) }, companyRoom);
  } else {
    emitEvent('order:deleted', { id: Number(id) });
  }

  return formatOrderDto(order);
}

export async function restoreOrder(id, user = null, companyId = null) {
  const targetCompanyId = companyId || user?.companyId || null;
  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, paranoid: false, include: [OrderItem] })
    : await Order.findByPk(id, { paranoid: false, include: [OrderItem] });

  if (!order) throw new AppError('order not found or not deleted', 404);
  await order.restore();

  await log({
    user,
    action: 'RESTORE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.info('Pedido restaurado', { context: 'order_service', orderId: order.id, restoredBy: user?.userId || user?.id, companyId: order.companyId });
  const formattedOrder = formatOrderDto(order);
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:restored', formattedOrder, companyRoom);
  } else {
    emitEvent('order:restored', formattedOrder);
  }

  return formattedOrder;
}

export async function permanentDeleteOrder(id, user = null, companyId = null) {
  const targetCompanyId = companyId || user?.companyId || null;
  const order = targetCompanyId
    ? await Order.findOne({ where: { id, companyId: targetCompanyId }, paranoid: false, include: [OrderItem] })
    : await Order.findByPk(id, { paranoid: false, include: [OrderItem] });

  if (!order) throw new AppError('order not found', 404);
  await order.destroy({ force: true });

  await log({
    user,
    action: 'PERMANENT_DELETE_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, companyId: order.companyId },
    companyId: order.companyId,
  });

  logger.warn('Pedido excluído permanentemente', { context: 'order_service', orderId: order.id, deletedBy: user?.userId || user?.id, companyId: order.companyId });
  const companyRoom = order.companyId ? `company:${order.companyId}` : null;
  if (companyRoom) {
    emitEvent('order:deleted', { id: Number(id) }, companyRoom);
  } else {
    emitEvent('order:deleted', { id: Number(id) });
  }

  return formatOrderDto(order);
}