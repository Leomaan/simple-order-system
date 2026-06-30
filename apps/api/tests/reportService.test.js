import { describe, it, expect, vi, beforeEach } from 'vitest';
import { salesToday, revenueByPeriod, ordersByPeriod } from '../src/services/reportService.js';
import Order from '../src/models/order.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/order.js', () => ({
  default: { 
    findAll: vi.fn(),
    findOne: vi.fn()
  }
}));

vi.mock('../src/models/orderItem.js', () => ({ default: {} }));
vi.mock('../src/models/product.js',   () => ({ default: {} }));

beforeEach(() => vi.clearAllMocks());

describe('salesToday', () => {
  it('deve retornar resumo das vendas do dia', async () => {
    Order.findOne.mockResolvedValue({
      totalOrders: 2,
      totalRevenue: 80.90,
    });

    const result = await salesToday();

    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('totalOrders', 2);
    expect(result).toHaveProperty('totalRevenue', 80.90);
  });

  it('deve retornar zero quando não há pedidos no dia', async () => {
    Order.findOne.mockResolvedValue(null);

    const result = await salesToday();

    expect(result.totalOrders).toBe(0);
    expect(result.totalRevenue).toBe(0);
  });

  it('deve retornar a data de hoje', async () => {
    Order.findOne.mockResolvedValue(null);

    const result = await salesToday();
    
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    expect(result.date).toBe(localDate);
  });
});

describe('revenueByPeriod', () => {
  it('deve retornar faturamento no período', async () => {
    Order.findOne.mockResolvedValue({
      totalOrders: 2,
      totalRevenue: 350.00,
    });

    const result = await revenueByPeriod('2026-01-01', '2026-12-31');

    expect(result.totalOrders).toBe(2);
    expect(result.totalRevenue).toBe(350.00);
    expect(result.from).toBe('2026-01-01');
    expect(result.to).toBe('2026-12-31');
  });

  it('deve retornar zero quando não há pedidos no período', async () => {
    Order.findOne.mockResolvedValue(null);

    const result = await revenueByPeriod('2026-01-01', '2026-01-02');

    expect(result.totalOrders).toBe(0);
    expect(result.totalRevenue).toBe(0);
  });

  it('deve lançar AppError se from não for fornecido', async () => {
    await expect(revenueByPeriod(null, '2026-12-31'))
      .rejects.toMatchObject({ message: 'from e to são obrigatórios' });
  });

  it('deve lançar AppError se to não for fornecido', async () => {
    await expect(revenueByPeriod('2026-01-01', null))
      .rejects.toMatchObject({ message: 'from e to são obrigatórios' });
  });

  it('deve lançar AppError se from for posterior a to', async () => {
    await expect(revenueByPeriod('2026-12-31', '2026-01-01'))
      .rejects.toMatchObject({ message: 'from deve ser anterior a to' });
  });
});

describe('ordersByPeriod', () => {
  it('deve retornar pedidos no período', async () => {
    const orders = [
      { id: 1, table: 3, status: 'CLOSED', createdAt: '2026-06-01' },
      { id: 2, table: 5, status: 'OPEN',   createdAt: '2026-06-02' },
    ];
    Order.findAll.mockResolvedValue(orders);

    const result = await ordersByPeriod('2026-06-01', '2026-06-02');

    expect(result.totalOrders).toBe(2);
    expect(result.status).toBe('ALL');
    expect(result.orders).toEqual(orders);
  });

  it('deve filtrar por status', async () => {
    const orders = [{ id: 1, table: 3, status: 'CLOSED', createdAt: '2026-06-01' }];
    Order.findAll.mockResolvedValue(orders);

    const result = await ordersByPeriod('2026-06-01', '2026-06-02', 'CLOSED');

    expect(result.status).toBe('CLOSED');
    expect(result.totalOrders).toBe(1);
  });

  it('deve lançar AppError se from não for fornecido', async () => {
    await expect(ordersByPeriod(null, '2026-12-31'))
      .rejects.toMatchObject({ message: 'from e to são obrigatórios' });
  });

  it('deve lançar AppError se to não for fornecido', async () => {
    await expect(ordersByPeriod('2026-01-01', null))
      .rejects.toMatchObject({ message: 'from e to são obrigatórios' });
  });

  it('deve lançar AppError se from for posterior a to', async () => {
    await expect(ordersByPeriod('2026-12-31', '2026-01-01'))
      .rejects.toMatchObject({ message: 'from deve ser anterior a to' });
  });

  it('deve lançar AppError se status for inválido', async () => {
    await expect(ordersByPeriod('2026-01-01', '2026-12-31', 'INVALIDO'))
      .rejects.toMatchObject({ message: expect.stringContaining('status inválido') });
  });
});