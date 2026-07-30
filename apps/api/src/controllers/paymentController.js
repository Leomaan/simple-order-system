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
  try {
    const { getSettings } = await import('../services/settingsService.js');
    const settings = await getSettings();
    const webhookSecret = settings?.mercadoPagoWebhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (req.headers['x-signature']) {
      const { verifyMercadoPagoSignature } = await import('../util/paymentSignature.js');
      const isValid = verifyMercadoPagoSignature(req.headers, req.query, req.body, webhookSecret);
      if (!isValid) {
        logger.warn('Falha na verificação de assinatura do webhook', { context: 'payment_webhook', ip: req.ip });
        return res.status(403).json({ success: false, message: 'Assinatura do webhook inválida.' });
      }
    } else if (process.env.NODE_ENV === 'production' && webhookSecret) {
      logger.warn('Requisição sem assinatura em produção', { context: 'payment_webhook', ip: req.ip });
      return res.status(403).json({ success: false, message: 'Assinatura ausente e obrigatória em produção.' });
    }
  } catch (err) {
    logger.error('Erro na validação de assinatura do webhook', { context: 'payment_webhook', error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Erro interno ao validar webhook.' });
  }

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
