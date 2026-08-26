import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll, findById, createOrder, updateOrder, closeOrder, reopenOrder, deleteOrder, restoreOrder, permanentDeleteOrder } from '../src/services/orderService.js';
import Order from '../src/models/order.js';
import OrderItem from '../src/models/orderItem.js';

vi.mock('../src/models/order.js', () => ({
  default: {
    findAll:  vi.fn(),
    findByPk: vi.fn(),
    findOne:  vi.fn(),
    create:   vi.fn(),
  }
}));

vi.mock('../src/models/orderItem.js', () => ({ default: {} }));
vi.mock('../src/models/product.js',   () => ({ default: {} }));
vi.mock('../src/util/updateTotalOrder.js', () => ({
  updateTotal: vi.fn().mockReturnValue(100)
}));

beforeEach(() => vi.clearAllMocks());

describe('findAll', () => {
  it('deve retornar todos os pedidos', async () => {
    const orders = [{ id: 1, table: 3 }];
    Order.findAll.mockResolvedValue(orders);

    const result = await findAll();

    expect(result).toEqual(orders);
    expect(Order.findAll).toHaveBeenCalledOnce();
  });

  it('deve filtrar pedidos por status', async () => {
    const openOrders = [{ id: 1, table: 3, status: 'OPEN' }];
    Order.findAll.mockResolvedValue(openOrders);
    const result = await findAll('OPEN');
    expect(result).toEqual(openOrders);
    expect(Order.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'OPEN' },
      })
    );
  });

  it('deve lançar AppError se status for inválido', async () => {
    await expect(findAll('INVALIDO')).rejects.toMatchObject({
      message: expect.stringContaining('status inválido'),
    });
  });
});

describe('createOrder', () => {
  it('deve criar um pedido com sucesso', async () => {
    Order.findOne.mockResolvedValue(null);
    Order.create.mockResolvedValue({ id: 1, table: 3, status: 'OPEN' });

    const result = await createOrder({ table: 3 });

    expect(result).toMatchObject({ id: 1, table: 3 });
  });

  it('deve lançar AppError se status não for fornecido', async () => {
    await expect(createOrder({})).rejects.toMatchObject({ message: 'table is required' });
  });

  it('deve lançar AppError se mesa já tiver pedido aberto', async () => {
    Order.findOne.mockResolvedValue({ id: 1, table: 3, status: 'OPEN' });

    await expect(createOrder({ table: 3 })).rejects.toMatchObject({
      message: 'there is already an open order for this table',
    });
  });
});

describe('updateOrder', () => {
  it('deve atualizar um pedido com sucesso', async () => {
    const order = { id: 1, table: 3, status: 'OPEN', update: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    await updateOrder(1, { table: 4 });

    expect(order.update).toHaveBeenCalledWith({ table: 4 });
  });

  it('deve lançar AppError se nenhum dado for fornecido', async () => {
    await expect(updateOrder(1, {})).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError 404 se pedido não existir', async () => {
    Order.findByPk.mockResolvedValue(null);

    await expect(updateOrder(99, { table: 4 })).rejects.toMatchObject({ status: 404 });
  });

  it('deve lançar AppError ao tentar reabrir pedido fechado', async () => {
    const order = { id: 1, status: 'CLOSED', update: vi.fn() };
    Order.findByPk.mockResolvedValue(order);

    await expect(updateOrder(1, { status: 'OPEN' })).rejects.toMatchObject({ message: 'cannot reopen a closed order' });
  });
});

describe('closeOrder', () => {
  it('deve fechar um pedido com sucesso', async () => {
    const order = {
      id: 1,
      status: 'OPEN',
      OrderItems: [{ id: 1 }],
      update: vi.fn().mockResolvedValue(true),
      toJSON() {
        return { id: this.id, status: this.status, OrderItems: this.OrderItems };
      }
    };
    Order.findByPk.mockResolvedValue(order);

    await closeOrder(1);

    expect(order.update).toHaveBeenCalledWith({ status: 'CLOSED' });
  });

  it('deve lançar AppError se pedido já estiver fechado', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'CLOSED', OrderItems: [] });

    await expect(closeOrder(1)).rejects.toMatchObject({ message: 'order is already closed' });
  });

  it('deve lançar AppError se pedido estiver vazio', async () => {
    Order.findByPk.mockResolvedValue({ id: 1, status: 'OPEN', OrderItems: [] });

    await expect(closeOrder(1)).rejects.toMatchObject({ message: 'cannot close an empty order' });
  });
});

describe('deleteOrder', () => {
  it('deve deletar um pedido com sucesso', async () => {
    const order = { 
      id: 1, 
      status: 'OPEN', 
      destroy: vi.fn().mockResolvedValue(true) 
    };
    Order.findByPk.mockResolvedValue(order);

    await deleteOrder(1, 'ADMIN');

    expect(order.destroy).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError se usuário não for administrador', async () => {
    const order = { id: 1, status: 'OPEN' };
    Order.findByPk.mockResolvedValue(order);

    await expect(deleteOrder(1, 'WAITER')).rejects.toMatchObject({ 
      status: 403, 
      message: 'apenas administradores podem excluir pedidos' 
    });
  });

  it('deve lançar AppError se pedido não existir', async () => {
    Order.findByPk.mockResolvedValue(null);

    await expect(deleteOrder(99, 'ADMIN')).rejects.toMatchObject({ status: 404 });
  });

  it('deve permitir que o ADMIN exclua um pedido fechado/pendente (CLOSED)', async () => {
    const order = { id: 1, status: 'CLOSED', destroy: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    const result = await deleteOrder(1, 'ADMIN');

    expect(order.destroy).toHaveBeenCalledOnce();
    expect(result).toBe(order);
  });

  it('deve permitir que o ADMIN exclua um pedido pago (PAID)', async () => {
    const order = { id: 2, status: 'PAID', destroy: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    const result = await deleteOrder(2, 'ADMIN');

    expect(order.destroy).toHaveBeenCalledOnce();
    expect(result).toBe(order);
  });
});

describe('restoreOrder', () => {
  it('deve restaurar um pedido com sucesso', async () => {
    const order = { id: 1, restore: vi.fn().mockResolvedValue(true) };
    Order.findOne.mockResolvedValue(order);

    await restoreOrder(1);

    expect(order.restore).toHaveBeenCalledOnce();
  });
});

describe('reopenOrder', () => {
  it('deve reabrir um pedido fechado com sucesso', async () => {
    const mockOrder = {
      id: 1,
      table: 3,
      status: 'CLOSED',
      update: vi.fn().mockResolvedValue(true)
    };
    Order.findByPk.mockResolvedValue(mockOrder);
    Order.findOne.mockResolvedValue(null);

    const result = await reopenOrder(1);

    expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'OPEN',
      paymentMethod: null,
      paymentId: null
    }));
    expect(result).toBe(mockOrder);
  });

  it('deve rejeitar reabrir pedido pago', async () => {
    const mockOrder = { id: 2, status: 'PAID' };
    Order.findByPk.mockResolvedValue(mockOrder);

    await expect(reopenOrder(2)).rejects.toMatchObject({
      message: 'Não é possível reabrir um pedido que já foi pago',
      status: 400
    });
  });
});

describe('permanentDeleteOrder', () => {
  it('deve deletar permanentemente um pedido', async () => {
    const order = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    await permanentDeleteOrder(1);

    expect(order.destroy).toHaveBeenCalledWith({ force: true });
  });
});