import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addItem, changeQuantity, removeItem } from '../src/services/orderItemService.js';
import OrderItem from '../src/models/orderItem.js';
import Order from '../src/models/order.js';
import Product from '../src/models/product.js';

vi.mock('../src/models/orderItem.js', () => ({
  default: {
    findOne:  vi.fn(),
    findByPk: vi.fn(),
    create:   vi.fn(),
  }
}));

vi.mock('../src/models/order.js', () => ({
  default: { findByPk: vi.fn() }
}));

vi.mock('../src/models/product.js', () => ({
  default: { findByPk: vi.fn() }
}));

vi.mock('../src/services/auditLogService.js', () => ({
  log: vi.fn().mockResolvedValue(true)
}));

vi.mock('../src/util/socket.js', () => ({
  emitEvent: vi.fn()
}));

vi.mock('../src/db/conn.js', () => ({
  sequelize: {
    define: vi.fn(),
    transaction: vi.fn((fn) => fn({
      LOCK: {
        UPDATE: 'UPDATE'
      }
    })),
  }
}));

beforeEach(() => vi.clearAllMocks());

describe('addItem', () => {
  it('deve adicionar um item ao pedido com sucesso', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'OPEN' });
    Product.findByPk.mockResolvedValue({ id: 1, price: 25.90, available: true });
    OrderItem.findOne.mockResolvedValue(null);
    OrderItem.create.mockResolvedValue({ id: 1, OrderId: 1, ProductId: 1, quantity: 2 });

    const result = await addItem({ orderId: 1, productId: 1, quantity: 2 });

    expect(OrderItem.create).toHaveBeenCalledOnce();
    expect(result.item).toMatchObject({ quantity: 2 }); 
    expect(result.created).toBe(true);                  
  });

  it('deve somar a quantidade se item já existir', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'OPEN' });
    Product.findByPk.mockResolvedValue({ id: 1, price: 25.90, available: true });

    const existing = { quantity: 2, update: vi.fn().mockResolvedValue(true) };
    OrderItem.findOne.mockResolvedValue(existing);

    const result = await addItem({ orderId: 1, productId: 1, quantity: 3 });

    expect(existing.update).toHaveBeenCalledWith({ quantity: 5, totalPrice: 25.90 * 5 }, expect.any(Object));
    expect(result.created).toBe(false); 
  });

  it('deve lançar AppError se dados não forem fornecidos', async () => {
    await expect(addItem({ orderId: 1 })).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError se pedido não estiver aberto', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'CLOSED' });
    Product.findByPk.mockResolvedValue({ id: 1, price: 25.90, available: true });

    await expect(addItem({ orderId: 1, productId: 1, quantity: 2 })).rejects.toMatchObject({
      message: 'order is not open'
    });
  });

  it('deve lançar AppError se produto não estiver disponível', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'OPEN' });
    Product.findByPk.mockResolvedValue({ id: 1, price: 25.90, available: false });

    await expect(addItem({ orderId: 1, productId: 1, quantity: 2 })).rejects.toMatchObject({
      message: 'product not available'
    });
  });

  it('deve lançar AppError se quantidade for inválida', async () => {
    await expect(addItem({ orderId: 1, productId: 1, quantity: -1 })).rejects.toMatchObject({
      message: 'invalid quantity'
    });
  });
});

describe('changeQuantity', () => {
  it('deve alterar a quantidade com sucesso', async () => {
    const orderItem = {
      Order:   { status: 'OPEN' },
      Product: { price: 25.90 },
      update:  vi.fn().mockResolvedValue(true)
    };
    OrderItem.findByPk.mockResolvedValue(orderItem);

    await changeQuantity(1, 5);

    expect(orderItem.update).toHaveBeenCalledWith({ quantity: 5, totalPrice: 25.90 * 5 });
  });

  it('deve lançar AppError se quantidade for inválida', async () => {
    await expect(changeQuantity(1, 0)).rejects.toMatchObject({ message: 'invalid quantity' });
    await expect(changeQuantity(1, -1)).rejects.toMatchObject({ message: 'invalid quantity' });
  });

  it('deve lançar AppError se item não existir', async () => {
    OrderItem.findByPk.mockResolvedValue(null);

    await expect(changeQuantity(99, 2)).rejects.toMatchObject({ status: 404 });
  });

  it('deve lançar AppError se pedido estiver fechado', async () => {
    OrderItem.findByPk.mockResolvedValue({
      Order:   { status: 'CLOSED' },
      Product: { price: 25.90 },
    });

    await expect(changeQuantity(1, 2)).rejects.toMatchObject({
      message: 'cannot change item of a closed order'
    });
  });
});

describe('removeItem', () => {
  it('deve remover um item com sucesso', async () => {
    const orderItem = { Order: { status: 'OPEN' }, destroy: vi.fn().mockResolvedValue(true) };
    OrderItem.findByPk.mockResolvedValue(orderItem);

    await removeItem(1);

    expect(orderItem.destroy).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError se item não existir', async () => {
    OrderItem.findByPk.mockResolvedValue(null);

    await expect(removeItem(99)).rejects.toMatchObject({ status: 404 });
  });

  it('deve lançar AppError se pedido estiver fechado', async () => {
    OrderItem.findByPk.mockResolvedValue({ Order: { status: 'CLOSED' } });

    await expect(removeItem(1)).rejects.toMatchObject({
      message: 'cannot remove item from a closed order'
    });
  });
});