import rateLimit from 'express-rate-limit';
import logger from '../util/logger.js';

const skipIfDevOrTest = () => process.env.NODE_ENV !== 'production';

export const publicMenuLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'Muitas requisições ao cardápio. Por favor, aguarde alguns instantes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipIfDevOrTest,
  handler: (req, res, next, options) => {
    logger.warn('Limite de requisições ao cardápio público excedido', {
      context: 'rate_limiter_public',
      path: req.originalUrl,
      ip: req.ip || req.headers['x-forwarded-for'],
    });
    res.status(options.statusCode).json(options.message);
  },
});
