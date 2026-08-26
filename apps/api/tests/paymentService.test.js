import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPixPayment, processWebhook, approveMockPayment, manualPayOrder } from '../src/services/paymentService.js';
import Order from '../src/models/order.js';
import { emitEvent } from '../src/util/socket.js';
import * as settingsService from '../src/services/settingsService.js';

vi.mock('../src/models/order.js', () => ({
  default: {
    findByPk: vi.fn(),
    findOne:  vi.fn(),
  }
}));

vi.mock('../src/models/orderItem.js', () => ({ default: {} }));
vi.mock('../src/models/product.js',   () => ({ default: {} }));
vi.mock('../src/services/auditLogService.js', () => ({
  log: vi.fn().mockResolvedValue({})
}));
vi.mock('../src/util/socket.js', () => ({
  emitEvent: vi.fn()
}));
vi.mock('../src/services/settingsService.js', () => ({
  getSettings: vi.fn().mockResolvedValue({})
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createPixPayment', () => {
  it('deve lançar erro se pedido não existir', async () => {
    Order.findByPk.mockResolvedValue(null);
    await expect(createPixPayment(999)).rejects.toMatchObject({
      message: 'Order not found',
      status: 404
    });
  });

  it('deve lançar erro se pedido não estiver fechado (CLOSED)', async () => {
    Order.findByPk.mockResolvedValue({
      id: 1,
      status: 'OPEN',
      OrderItems: [{ totalPrice: 50 }]
    });
    await expect(createPixPayment(1)).rejects.toMatchObject({
      message: 'Only closed orders can be paid',
      status: 400
    });
  });

  it('deve gerar pagamento mock quando token do Mercado Pago não está configurado', async () => {
    const mockOrder = {
      id: 1,
      table: 4,
      status: 'CLOSED',
      OrderItems: [{ totalPrice: 50 }, { totalPrice: 30 }],
      update: vi.fn().mockResolvedValue(true)
    };
    Order.findByPk.mockResolvedValue(mockOrder);
    settingsService.getSettings.mockResolvedValue({ mercadoPagoAccessToken: null });

    const result = await createPixPayment(1);

    expect(result).toHaveProperty('paymentId');
    expect(result).toHaveProperty('paymentQrCode');
    expect(result).toHaveProperty('paymentQrCodeCopy');
    expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      paymentMethod: 'PIX'
    }));
    expect(emitEvent).toHaveBeenCalledWith('order:updated', mockOrder);
  });
});

describe('manualPayOrder', () => {
  it('deve pagar pedido manualmente em DINHEIRO (CASH)', async () => {
    const mockOrder = {
      id: 2,
      table: 5,
      status: 'CLOSED',
      OrderItems: [{ totalPrice: 120 }],
      update: vi.fn().mockResolvedValue(true)
    };
    Order.findByPk.mockResolvedValue(mockOrder);

    const result = await manualPayOrder(2, 'CASH', { id: 1, name: 'Admin' });

    expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'PAID',
      paymentMethod: 'CASH'
    }));
    expect(emitEvent).toHaveBeenCalledWith('order:updated', mockOrder);
    expect(result).toBe(mockOrder);
  });

  it('deve pagar pedido manualmente em CARTÃO (CARD)', async () => {
    const mockOrder = {
      id: 3,
      table: 2,
      status: 'CLOSED',
      OrderItems: [{ totalPrice: 85 }],
      update: vi.fn().mockResolvedValue(true)
    };
    Order.findByPk.mockResolvedValue(mockOrder);

    const result = await manualPayOrder(3, 'CARD');

    expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'PAID',
      paymentMethod: 'CARD'
    }));
    expect(emitEvent).toHaveBeenCalledWith('order:updated', mockOrder);
  });

  it('deve rejeitar se pedido já estiver pago', async () => {
    const mockOrder = {
      id: 4,
      status: 'PAID',
      OrderItems: [{ totalPrice: 50 }]
    };
    Order.findByPk.mockResolvedValue(mockOrder);

    await expect(manualPayOrder(4, 'CASH')).rejects.toMatchObject({
      message: 'Order is already paid',
      status: 400
    });
  });
});

describe('approveMockPayment', () => {
  it('deve aprovar pagamento mock e emitir evento via WebSocket', async () => {
    const mockOrder = {
      id: 5,
      table: 1,
      paymentId: 'mock_12345',
      status: 'CLOSED',
      OrderItems: [{ totalPrice: 40 }],
      update: vi.fn().mockResolvedValue(true)
    };
    Order.findOne.mockResolvedValue(mockOrder);

    const result = await approveMockPayment('mock_12345', { name: 'TestUser' });

    expect(result).toEqual({ success: true, orderId: 5, status: 'PAID' });
    expect(mockOrder.update).toHaveBeenCalledWith({ status: 'PAID', paymentMethod: 'PIX' });
    expect(emitEvent).toHaveBeenCalledWith('order:updated', mockOrder);
  });
});
