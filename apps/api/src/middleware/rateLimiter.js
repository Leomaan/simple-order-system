import rateLimit from 'express-rate-limit';
import logger from '../util/logger.js';

const skipIfDevOrTest = () => process.env.NODE_ENV !== 'production';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true, 
  legacyHeaders: false,
  skip: skipIfDevOrTest,
  handler: (req, res, next, options) => {
    logger.warn('Limite de tentativas de login excedido (Rate Limit)', {
      context: 'rate_limiter',
      ip: req.ip || req.headers['x-forwarded-for'],
      email: req.body?.email
    });
    res.status(options.statusCode).json(options.message);
  }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfDevOrTest,
  handler: (req, res, next, options) => {
    logger.warn('Limite geral de requisições excedido (Rate Limit)', {
      context: 'rate_limiter',
      path: req.originalUrl,
      ip: req.ip || req.headers['x-forwarded-for']
    });
    res.status(options.statusCode).json(options.message);
  }
});