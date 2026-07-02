import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Product from '../models/product.js';
import { AppError } from '../middleware/appError.js';
import { log } from './auditLogService.js';

/**
 * Service to handle integration with Payment Gateways (e.g., Mercado Pago)
 */

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

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken.includes('your_mercado_pago_access_token')) {
    // Return a mocked payment details if the integration token is not configured yet
    console.warn('Mercado Pago Access Token is not set. Returning mock payment details.');
    
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

    return mockPayment;
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
    notification_url: `${process.env.API_BASE_URL}/payment/webhook`,
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

    return {
      paymentId,
      paymentQrCode: qrCode ? `data:image/png;base64,${qrCode}` : null,
      paymentQrCodeCopy: qrCodeCopy,
      paymentExpiresAt
    };
  } catch (error) {
    console.error('Failed to create Mercado Pago payment:', error);
    throw new AppError(`Error creating PIX payment: ${error.message}`, 500);
  }
}

/**
 * Handles incoming webhooks from Mercado Pago.
 * @param {object} webhookPayload 
 * @param {object} user - User metadata from authentication (if system)
 */
export async function processWebhook(webhookPayload, user = { name: 'webhook_system', role: 'system' }) {
  const { action, type, data } = webhookPayload;

  // Mercado Pago sends webhooks for payment updates
  if (type === 'payment' && (action === 'payment.created' || action === 'payment.updated')) {
    const paymentId = data.id;
    if (!paymentId) return { success: false, reason: 'No payment ID found in webhook payload' };

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken || accessToken.includes('your_mercado_pago_access_token')) {
      console.warn('Webhook received but Access Token not set. Processing as demo/mock update.');
      // In local development, if we want to manually simulate a webhook approval:
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
        if (order && order.status === 'CLOSED') {
          const total = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
          await order.update({ status: 'PAID' });
          await log({
            user,
            action: 'PAY_ORDER',
            entity: 'Order',
            entityId: order.id,
            details: { table: order.table, order: order.id, paymentId, status: 'PAID', total }
          });
          return { success: true, orderId, status: 'PAID' };
        }
      }
    } catch (error) {
      console.error('Error processing webhook payment verification:', error);
      throw new AppError(`Webhook process failed: ${error.message}`, 500);
    }
  }

  return { success: false, reason: 'Unsupported action or unhandled state' };
}

/**
 * Simulates approving a payment (useful for local development and testing)
 */
async function approveMockPayment(paymentId, user) {
  const order = await Order.findOne({
    where: { paymentId },
    include: [OrderItem]
  });
  if (!order) return { success: false, reason: 'Order with paymentId not found' };

  if (order.status === 'CLOSED') {
    const total = order.OrderItems?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
    await order.update({ status: 'PAID' });
    await log({
      user,
      action: 'PAY_ORDER',
      entity: 'Order',
      entityId: order.id,
      details: { table: order.table, order: order.id, paymentId, status: 'PAID_MOCK', total }
    });
    return { success: true, orderId: order.id, status: 'PAID' };
  }

  return { success: true, reason: 'Order already paid or closed' };
}
