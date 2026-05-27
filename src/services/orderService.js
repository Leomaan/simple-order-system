import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { updateTotal } from '../util/updateTotalOrder.js';

export async function findAll() {
  return Order.findAll();
}

export async function findById(id) {
  const order = await Order.findByPk(id, {
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

  const openOrder = await Order.findOne({ where: { table, status: 'OPEN' } });
  if (openOrder) throw new AppError('there is already an open order for this table');

  return Order.create(data);
}

export async function updateOrder(id, data) {
  if (!data || Object.keys(data).length === 0)
    throw new AppError('no data provided');

  const order = await Order.findByPk(id);
  if (!order) throw new AppError('order not found', 404);

  if (order.status !== 'OPEN' && data.status === 'OPEN')
  throw new AppError('cannot reopen a closed order');

  await order.update(data);
  return order;
}

export async function closeOrder(id) {
  const order = await Order.findByPk(id, { include: [OrderItem] });
  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('order is already closed');
  if (!order.OrderItems?.length) throw new AppError('cannot close an empty order');

  await order.update({ status: 'CLOSED' });
  return order;
}

export async function deleteOrder(id) {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('order not found', 404);
  if (order.status === 'CLOSED') throw new AppError('cannot delete a closed order');

  await order.destroy();
}