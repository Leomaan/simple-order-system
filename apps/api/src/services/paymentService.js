import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { log } from './auditLogService.js';
import { getSettings } from './settingsService.js';
import logger from '../util/logger.js';
import { emitEvent } from '../util/socket.js';

/**
 * Creates a PIX payment for a specific order.
 * @param {number} orderId 
 * @returns {Promise<object>} The payment details including QR code and copy-paste code.
 */
export async function createPixPayment(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        include: [Product]
      }
    ]
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'CLOSED') throw new AppError('Only closed orders can be paid', 400);
  if (!order.OrderItems?.length) throw new AppError('Cannot pay for an empty order', 400);

  // Calculate order total
  const totalAmount = order.OrderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const settings = await getSettings();
  let accessToken = settings?.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (accessToken) accessToken = String(accessToken).trim();

  const isInvalidToken = !accessToken ||
    accessToken.includes('your_mercado_pago_access_token') ||
    accessToken.includes('*') ||
    accessToken.includes('•') ||
    /[^\x20-\x7E]/.test(accessToken);

  if (isInvalidToken) {
    // Return a mocked payment details if the integration token is not configured yet or contains masked characters
    logger.warn('Token de acesso do Mercado Pago não configurado ou contém caracteres de máscara. Retornando dados de pagamento mock.', { context: 'payment_service' });
    
    const mockPayment = {
      paymentId: `mock_${Date.now()}`,
      paymentQrCode: 'https://via.placeholder.com/250?text=MockPIXQRCode',
      paymentQrCodeCopy: '00020101021226870014br.gov.bcb.pix2565mockpixpayloadfordemo',
      paymentExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    };

    await order.update({
      paymentMethod: 'PIX',
      paymentId: mockPayment.paymentId,
      paymentQrCode: mockPayment.paymentQrCode,
      paymentQrCodeCopy: mockPayment.paymentQrCodeCopy,
      paymentExpiresAt: mockPayment.paymentExpiresAt
    });

    emitEvent('order:updated', order);

    return mockPayment;
  }

  // Fallback to a valid public URL format in local development to satisfy Mercado Pago's validation
  let apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1')) {
    apiBaseUrl = 'https://example.com';
  }

  // Example request payload for Mercado Pago API (v1/payments)
  const paymentPayload = {
    transaction_amount: Number(totalAmount.toFixed(2)),
    description: `Pedido Mesa #${order.table} - Total: R$ ${totalAmount.toFixed(2)}`,
    payment_method_id: 'pix',
    payer: {
      email: 'customer@simpleorder.com', // In a real system, you can pass waiter or client email
      first_name: 'Cliente',
      last_name: `Mesa ${order.table}`
    },
    notification_url: `${apiBaseUrl}/payment/webhook`,
    external_reference: String(order.id)
  };

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `order_${order.id}_${Date.now()}`
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error communicating with Mercado Pago');
    }

    const paymentData = await response.json();

    // Extract PIX details
    const qrCode = paymentData.point_of_interaction?.transaction_data?.qr_code_base64;
    const qrCodeCopy = paymentData.point_of_interaction?.transaction_data?.qr_code;
    const paymentId = String(paymentData.id);
    const paymentExpiresAt = new Date(paymentData.date_of_expiration);

    // Save payment details in database
    await order.update({
      paymentMethod: 'PIX',
      paymentId,
      paymentQrCode: qrCode ? `data:image/png;base64,${qrCode}` : null,
      paymentQrCodeCopy: qrCodeCopy,
      paymentExpiresAt
    });

    emitEvent('order:updated', order);

    return {
      paymentId,
      paymentQrCode: qrCode ? `data:image/png;base64,${qrCode}` : null,
      paymentQrCodeCopy: qrCodeCopy,
      paymentExpiresAt
    };
  } catch (error) {
    logger.error('Falha ao criar pagamento no Mercado Pago', { context: 'payment_service', error: error.message, stack: error.stack });
    throw new AppError(`Error creating PIX payment: ${error.message}`, 500);
  }
}

/**
 * Handles incoming webhooks from Mercado Pago.
 * @param {object} webhookPayload 
 * @param {object} user - User metadata from authentication (if system)
 */
export async function processWebhook(webhookPayload, user = { name: 'webhook_system', role: 'system' }) {
  const action = webhookPayload?.action || webhookPayload?.topic;
  const type = webhookPayload?.type || webhookPayload?.topic;
  const paymentId = webhookPayload?.data?.id || webhookPayload?.id || webhookPayload?.['data.id'];

  // Mercado Pago sends webhooks for payment updates
  if ((type === 'payment' || action === 'payment.created' || action === 'payment.updated') && paymentId) {
    const settings = await getSettings();
    let accessToken = settings?.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (accessToken) accessToken = String(accessToken).trim();

    const isInvalidToken = !accessToken ||
      accessToken.includes('your_mercado_pago_access_token') ||
      accessToken.includes('*') ||
      accessToken.includes('•') ||
      /[^\x20-\x7E]/.test(accessToken);

    if (isInvalidToken) {
      logger.warn('Webhook recebido sem Token de Acesso do Mercado Pago configurado ou inválido. Processando como mock.', { context: 'payment_service' });
      return await approveMockPayment(paymentId, user);
    }

    try {
      // Query Mercado Pago API to safely verify the current payment status
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment status with Mercado Pago');
      }

      const paymentInfo = await response.json();
      const orderId = paymentInfo.external_reference;
      const status = paymentInfo.status; // 'approved', 'pending', 'rejected', 'refunded', etc.

      if (orderId && status === 'approved') {
        const order = await Order.findByPk(orderId, {
          include: [OrderItem]
        });
        if (order && order.status !== 'PAID') {
          const total = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
          await order.update({ status: 'PAID', paymentMethod: 'PIX' });
          await log({
            user,
            action: 'PAY_ORDER',
            entity: 'Order',
            entityId: order.id,
            details: { table: order.table, order: order.id, paymentId, status: 'PAID', total }
          });
          emitEvent('order:updated', order);
          return { success: true, orderId, status: 'PAID' };
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar pagamento do webhook no Mercado Pago', { context: 'payment_service', error: error.message, stack: error.stack });
      throw new AppError(`Webhook process failed: ${error.message}`, 500);
    }
  }

  return { success: false, reason: 'Unsupported action or unhandled state' };
}

/**
 * Simulates approving a payment (useful for local development and testing)
 */
export async function approveMockPayment(paymentId, user) {
  const order = await Order.findOne({
    where: { paymentId },
    include: [OrderItem]
  });
  if (!order) return { success: false, reason: 'Order with paymentId not found' };

  if (order.status !== 'PAID') {
    const total = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
    await order.update({ status: 'PAID', paymentMethod: 'PIX' });
    await log({
      user,
      action: 'PAY_ORDER',
      entity: 'Order',
      entityId: order.id,
      details: { table: order.table, order: order.id, paymentId, status: 'PAID_MOCK', total }
    });
    emitEvent('order:updated', order);
    return { success: true, orderId: order.id, status: 'PAID' };
  }

  return { success: true, reason: 'Order already paid' };
}

/**
 * Manually confirms payment in CASH or CARD.
 * @param {number} orderId 
 * @param {'CASH'|'CARD'|'PIX'} paymentMethod 
 * @param {object} user 
 */
export async function manualPayOrder(orderId, paymentMethod = 'CASH', user = null) {
  const order = await Order.findByPk(orderId, {
    include: [OrderItem]
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.status === 'PAID') throw new AppError('Order is already paid', 400);
  if (!order.OrderItems?.length) throw new AppError('Cannot pay for an empty order', 400);

  const total = order.OrderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  await order.update({
    status: 'PAID',
    paymentMethod,
    paymentExpiresAt: null
  });

  await log({
    user,
    action: 'PAY_ORDER',
    entity: 'Order',
    entityId: order.id,
    details: { table: order.table, order: order.id, paymentMethod, status: 'PAID', total }
  });

  logger.info('Pagamento manual registrado com sucesso', { context: 'payment_service', orderId: order.id, paymentMethod, total });
  emitEvent('order:updated', order);

  return order;
}

/**
 * Actively checks the payment status on Mercado Pago for a given order.
 * @param {number} orderId 
 * @param {object} user 
 */
export async function checkPaymentStatus(orderId, user = null) {
  const order = await Order.findByPk(orderId, {
    include: [OrderItem]
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.status === 'PAID') return { success: true, status: 'PAID', message: 'Order is already paid' };
  if (!order.paymentId) throw new AppError('No payment initiated for this order', 400);

  // If it's a mock payment
  if (order.paymentId.startsWith('mock_')) {
    return { success: false, status: order.status, message: 'Mock payment pending simulation' };
  }

  const settings = await getSettings();
  let accessToken = settings?.mercadoPagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (accessToken) accessToken = String(accessToken).trim();

  if (!accessToken || accessToken.includes('your_mercado_pago_access_token')) {
    throw new AppError('Mercado Pago access token not configured', 500);
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to query Mercado Pago API');
    }

    const paymentInfo = await response.json();
    const status = paymentInfo.status; // 'approved', 'pending', 'rejected', etc.

    if (status === 'approved') {
      const total = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
      await order.update({ status: 'PAID', paymentMethod: 'PIX' });
      await log({
        user: user || { name: 'status_check_system', role: 'system' },
        action: 'PAY_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: { table: order.table, order: order.id, paymentId: order.paymentId, status: 'PAID', total }
      });
      emitEvent('order:updated', order);
      return { success: true, status: 'PAID', order };
    }

    return { success: false, status: status || 'pending', message: `Pagamento ainda em status: ${status}` };
  } catch (error) {
    logger.error('Erro ao consultar status do pagamento no Mercado Pago', { context: 'payment_service', error: error.message });
    throw new AppError(`Erro ao consultar Mercado Pago: ${error.message}`, 500);
  }
}
