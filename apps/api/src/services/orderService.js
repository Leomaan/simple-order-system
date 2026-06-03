import { Op } from 'sequelize';
import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { updateTotal } from '../util/updateTotalOrder.js';

const VALID_STATUSES = ['OPEN', 'PAID', 'CLOSED'];

export async function findAll(status) {
  const where = { deletedAt: null };

  if (status) {
    if (!VALID_STATUSES.includes(status))
      throw new AppError(`status inválido. Use: ${VALID_STATUSES.join(', ')}`);
    where.status = status;
  }

   return Order.findAll({
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
  });
}

export async function findById(id) {
  const order = await Order.findOne({
    where: { id, deletedAt: null },
    attributes: ['id', 'table', 'status'],
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
  return { ...order.toJSON(), total };
}

export async function createOrder(data) {
  const { table } = data;
  if (!table) throw new AppError('table is required');

  const openOrder = await Order.findOne({ where: { table, status: 'OPEN', deletedAt: null } });
  if (openOrder) throw new AppError('there is already an open order for this table');

  return Order.create(data);
}

export async function updateOrder(id, data) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const order = await Order.findOne({ where: { id, deletedAt: null } });
  if (!order) throw new AppError('order not found', 404);

  if (order.status !== 'OPEN' && data.status === 'OPEN')
    throw new AppError('cannot reopen a closed order');

  await order.update(data);
  return order;
}

export async function closeOrder(id) {
  const order = await Order.findOne({
    where: { id, deletedAt: null },
    include: [OrderItem],
  });
  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('order is already closed');
  if (!order.OrderItems?.length) throw new AppError('cannot close an empty order');

  await order.update({ status: 'CLOSED' });
  return order;
}

export async function deleteOrder(id) {
  const order = await Order.findOne({ where: { id, deletedAt: null } });
  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('cannot delete a closed order');

  await order.update({ deletedAt: new Date() });
}

export async function restoreOrder(id) {
  const order = await Order.findOne({ where: { id, deletedAt: { [Op.not]: null } } });
  if (!order) throw new AppError('order not found or not deleted', 404);
  await order.update({ deletedAt: null });
  return order;
}

export async function permanentDeleteOrder(id) {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('order not found', 404);
  await order.destroy();
}