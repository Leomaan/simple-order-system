import { Op, fn, col, literal } from 'sequelize';
import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';

export async function salesToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders = await Order.findAll({
    where: {
      status: 'CLOSED',
      deletedAt: null,
      updatedAt: { [Op.between]: [today, tomorrow] },
    },
    include: [
      {
        model: OrderItem,
        attributes: ['quantity', 'totalPrice'],
        include: [{ model: Product, attributes: ['name'] }],
      },
    ],
  });

  const total = orders.reduce((sum, order) => {
    return sum + order.OrderItems.reduce((s, item) => s + Number(item.totalPrice), 0);
  }, 0);

  return {
    date: today.toISOString().split('T')[0],
    totalOrders: orders.length,
    totalRevenue: Number(total.toFixed(2)),
  };
}

export async function revenueByPeriod(from, to) {
  if (!from || !to) throw new AppError('from e to são obrigatórios');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  if (fromDate > toDate) throw new AppError('from deve ser anterior a to');

  const orders = await Order.findAll({
    where: {
      status: 'CLOSED',
      deletedAt: null,
      updatedAt: { [Op.between]: [fromDate, toDate] },
    },
    include: [
      {
        model: OrderItem,
        attributes: ['quantity', 'totalPrice'],
      },
    ],
  });

  const total = orders.reduce((sum, order) => {
    return sum + order.OrderItems.reduce((s, item) => s + Number(item.totalPrice), 0);
  }, 0);

  return {
    from: from,
    to: to,
    totalOrders: orders.length,
    totalRevenue: Number(total.toFixed(2)),
  };
}

export async function ordersByPeriod(from, to, status) {
  if (!from || !to) throw new AppError('from e to são obrigatórios');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  if (fromDate > toDate) throw new AppError('from deve ser anterior a to');

  const where = {
    deletedAt: null,
    createdAt: { [Op.between]: [fromDate, toDate] },
  };

  const VALID_STATUSES = ['OPEN', 'PAID', 'CLOSED'];
  if (status) {
    if (!VALID_STATUSES.includes(status))
      throw new AppError(`status inválido. Use: ${VALID_STATUSES.join(', ')}`);
    where.status = status;
  }

  const orders = await Order.findAll({
    where,
    attributes: ['id', 'table', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });

  return {
    from,
    to,
    status: status || 'ALL',
    totalOrders: orders.length,
    orders,
  };
}