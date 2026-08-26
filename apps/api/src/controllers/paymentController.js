import { asyncHandler } from '../middleware/asyncHandler.js';
import * as paymentService from '../services/paymentService.js';
import logger from '../util/logger.js';

export const generatePix = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const paymentData = await paymentService.createPixPayment(orderId);
  logger.info('PIX gerado com sucesso', { context: 'payment_controller', orderId });
  res.status(200).json({ success: true, data: paymentData });
});

export const receiveWebhook = asyncHandler(async (req, res) => {
  // Acknowledges receipt immediately to avoid webhook timeouts
  res.status(200).send('OK');

  try {
    const result = await paymentService.processWebhook(req.body);
    logger.info('Webhook de pagamento processado com sucesso', { context: 'payment_webhook', result });
  } catch (error) {
    logger.error('Erro ao processar webhook assincronamente', { context: 'payment_webhook', error: error.message, stack: error.stack });
  }
});

export const simulatePaymentConfirmation = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'paymentId is required' });
  }

  const user = req.user || { name: 'admin_simulator', role: 'ADMIN' };
  const result = await paymentService.approveMockPayment(paymentId, user);

  if (result.success) {
    res.status(200).json({ success: true, message: 'Payment simulated and approved successfully', data: result });
  } else {
    res.status(400).json({ success: false, message: result.reason || 'Simulation failed' });
  }
});

export const manualPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const validMethods = ['CASH', 'CARD', 'PIX'];
  const method = paymentMethod ? String(paymentMethod).toUpperCase() : 'CASH';

  if (!validMethods.includes(method)) {
    return res.status(400).json({ success: false, message: `paymentMethod must be one of: ${validMethods.join(', ')}` });
  }

  const result = await paymentService.manualPayOrder(orderId, method, req.user);
  res.status(200).json({ success: true, message: 'Pagamento registrado com sucesso', data: result });
});
