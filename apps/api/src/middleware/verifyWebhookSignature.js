import logger from '../util/logger.js';
import { verifyMercadoPagoSignature } from '../util/paymentSignature.js';
import { getSettings } from '../services/settingsService.js';

export async function verifyWebhookSignature(req, res, next) {
  try {
    const settings = await getSettings();
    const webhookSecret = settings?.mercadoPagoWebhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (req.headers['x-signature']) {
      const isValid = verifyMercadoPagoSignature(req.headers, req.query, req.body, webhookSecret);
      if (!isValid) {
        logger.warn('Falha na verificação de assinatura do webhook', { context: 'payment_webhook', ip: req.ip });
        return res.status(403).json({ success: false, message: 'Assinatura do webhook inválida.' });
      }
    } else if (process.env.NODE_ENV === 'production' && webhookSecret) {
      logger.warn('Requisição sem assinatura em produção', { context: 'payment_webhook', ip: req.ip });
      return res.status(403).json({ success: false, message: 'Assinatura ausente e obrigatória em produção.' });
    }

    next();
  } catch (err) {
    logger.error('Erro na validação de assinatura do webhook', { context: 'payment_webhook', error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Erro interno ao validar webhook.' });
  }
}
