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

  const result = await Order.findOne({
    where: {
      status: 'CLOSED',
      deletedAt: null,
      updatedAt: { [Op.between]: [today, tomorrow] },
    },
    attributes: [
      [fn('COUNT', fn('DISTINCT', col('Order.id'))), 'totalOrders'],
      [fn('COALESCE', fn('SUM', col('OrderItems.totalPrice')), 0), 'totalRevenue'],
    ],
    include: [
      {
        model: OrderItem,
        attributes: [],
      },
    ],
    raw: true,
    subQuery: false,
  });

  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    date: localDate,
    totalOrders: Number(result?.totalOrders || 0),
    totalRevenue: Number(Number(result?.totalRevenue || 0).toFixed(2)),
  };
}

export async function revenueByPeriod(from, to) {
  if (!from || !to) throw new AppError('from e to são obrigatórios');

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  if (fromDate > toDate) throw new AppError('from deve ser anterior a to');

  const result = await Order.findOne({
    where: {
      status: 'CLOSED',
      deletedAt: null,
      updatedAt: { [Op.between]: [fromDate, toDate] },
    },
    attributes: [
      [fn('COUNT', fn('DISTINCT', col('Order.id'))), 'totalOrders'],
      [fn('COALESCE', fn('SUM', col('OrderItems.totalPrice')), 0), 'totalRevenue'],
    ],
    include: [
      {
        model: OrderItem,
        attributes: [],
      },
    ],
    raw: true,
    subQuery: false,
  });

  return {
    from: from,
    to: to,
    totalOrders: Number(result?.totalOrders || 0),
    totalRevenue: Number(Number(result?.totalRevenue || 0).toFixed(2)),
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