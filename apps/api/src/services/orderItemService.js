import OrderItem from '../models/orderItem.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { sequelize } from '../db/conn.js';

export async function addItem(data) {
  const { orderId, productId, quantity } = data;

  if (!orderId || !productId || !quantity)
    throw new AppError('no data provided');
  if (quantity <= 0)
    throw new AppError('invalid quantity');

  return sequelize.transaction(async (t) => {
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
      return { item: existing, created: false };
    }

    const item = await OrderItem.create({
      OrderId: orderId,
      ProductId: productId,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    }, { transaction: t });

    return { item, created: true };
  });
}

export async function changeQuantity(id, quantity) {
  if (!quantity || quantity <= 0)
    throw new AppError('invalid quantity');

  const orderItem = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot change item of a closed order');

  await orderItem.update({
    quantity,
    totalPrice: orderItem.Product.price * quantity,
  });

  return orderItem;
}

export async function removeItem(id) {
  const orderItem = await OrderItem.findByPk(id, { include: [Order] });
  if (!orderItem) throw new AppError('order item not found', 404);

  if (orderItem.Order?.status === 'CLOSED')
    throw new AppError('cannot remove item from a closed order');

  await orderItem.destroy();
}

export async function findById(id) {
  const item = await OrderItem.findByPk(id, { include: [Order, Product] });
  if (!item) throw new AppError('order item not found', 404);
  return item;
}