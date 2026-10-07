import logger from '../util/logger.js';
import { verifyMercadoPagoSignature } from '../util/paymentSignature.js';
import { getSettings } from '../services/settingsService.js';

export async function verifyWebhookSignature(req, res, next) {
  try {
    const settings = await getSettings();
    const webhookSecret = settings?.mercadoPagoWebhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!req.headers['x-signature']) {
        logger.warn('Requisição de webhook sem assinatura em produção bloqueada', {
          context: 'payment_webhook',
          ip: req.ip || req.headers['x-forwarded-for'],
        });
        return res.status(403).json({ success: false, message: 'Assinatura ausente e obrigatória em produção.' });
      }

      if (!webhookSecret) {
        logger.error('Webhook recebido em produção mas webhookSecret não está configurado', {
          context: 'payment_webhook',
        });
        return res.status(500).json({ success: false, message: 'Segredo do webhook não configurado no servidor.' });
      }

      const isValid = verifyMercadoPagoSignature(req.headers, req.query, req.body, webhookSecret);
      if (!isValid) {
        logger.warn('Falha na verificação de assinatura do webhook em produção', {
          context: 'payment_webhook',
          ip: req.ip || req.headers['x-forwarded-for'],
        });
        return res.status(403).json({ success: false, message: 'Assinatura do webhook inválida.' });
      }
    } else {
      // Em desenvolvimento/teste, valida se a assinatura foi enviada e o secret está definido
      if (req.headers['x-signature'] && webhookSecret) {
        const isValid = verifyMercadoPagoSignature(req.headers, req.query, req.body, webhookSecret);
        if (!isValid) {
          logger.warn('Falha na verificação de assinatura do webhook (Dev)', {
            context: 'payment_webhook',
            ip: req.ip || req.headers['x-forwarded-for'],
          });
          return res.status(403).json({ success: false, message: 'Assinatura do webhook inválida.' });
        }
      }
    }

    next();
  } catch (err) {
    logger.error('Erro na validação de assinatura do webhook', { context: 'payment_webhook', error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Erro interno ao validar webhook.' });
  }
}
