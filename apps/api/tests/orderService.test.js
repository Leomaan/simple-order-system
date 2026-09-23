import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll, findById, createOrder, updateOrder, closeOrder, reopenOrder, deleteOrder, restoreOrder, permanentDeleteOrder } from '../src/services/orderService.js';
import Order from '../src/models/order.js';

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
vi.mock('../src/util/socket.js', () => ({
  emitEvent: vi.fn()
}));
vi.mock('../src/services/auditLogService.js', () => ({
  log: vi.fn().mockResolvedValue(true)
}));

// MOCK ESTÁTICO DO DTO: Retorna exatamente a estrutura basica recebida
// sem aplicar defaults do DTO real
vi.mock('../src/dto/orderDto.js', () => ({
  formatOrderDto: vi.fn((order) => {
    if (!order) return null;
    return {
      id: order.id,
      table: order.table,
      status: order.status,
      total: order.total || 0,
      items: order.OrderItems || order.items || [],
    };
  })
}));

beforeEach(() => vi.clearAllMocks());

describe('findAll', () => {
  it('deve retornar todos os pedidos', async () => {
    const mockDbOrders = [{ id: 1, table: 3, status: 'OPEN', total: 0, OrderItems: [] }];
    Order.findAll.mockResolvedValue(mockDbOrders);

    const result = await findAll();

    expect(result).toEqual([
      expect.objectContaining({ id: 1, table: 3 })
    ]);
    expect(Order.findAll).toHaveBeenCalledOnce();
  });

  it('deve filtrar pedidos por status', async () => {
    const openOrders = [{ id: 1, table: 3, status: 'OPEN', OrderItems: [] }];
    Order.findAll.mockResolvedValue(openOrders);

    const result = await findAll('OPEN');

    expect(result).toEqual([
      expect.objectContaining({ id: 1, table: 3, status: 'OPEN' })
    ]);
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

describe('deleteOrder', () => {
  it('deve deletar um pedido com sucesso', async () => {
    const order = { 
      id: 1, 
      status: 'OPEN', 
      table: 3,
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
    const order = { id: 1, table: 3, status: 'CLOSED', destroy: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    const result = await deleteOrder(1, 'ADMIN');

    expect(order.destroy).toHaveBeenCalledOnce();
    expect(result).toEqual(expect.objectContaining({ id: 1, status: 'CLOSED' }));
  });

  it('deve permitir que o ADMIN exclua um pedido pago (PAID)', async () => {
    const order = { id: 2, table: 5, status: 'PAID', destroy: vi.fn().mockResolvedValue(true) };
    Order.findByPk.mockResolvedValue(order);

    const result = await deleteOrder(2, 'ADMIN');

    expect(order.destroy).toHaveBeenCalledOnce();
    expect(result).toEqual(expect.objectContaining({ id: 2, status: 'PAID' }));
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
    expect(result).toEqual(expect.objectContaining({ id: 1, table: 3 }));
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