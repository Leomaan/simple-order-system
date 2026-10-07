import crypto from 'crypto';
import logger from '../util/logger.js';

export function csrfProtection(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Safe HTTP methods don't require CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF checks for specific exact public/webhook routes
  const bypassRoutes = ['/auth/login', '/auth/refresh', '/payment/webhook'];
  if (bypassRoutes.includes(req.path)) {
    return next();
  }

  const csrfHeader = req.headers['x-xsrf-token'];
  const csrfCookie = req.cookies?.['XSRF-TOKEN'];

  if (!csrfHeader || !csrfCookie) {
    logger.warn('Falha na validação de segurança CSRF: token ausente', {
      context: 'csrf_middleware',
      method: req.method,
      path: req.originalUrl,
      ip: req.ip || req.headers['x-forwarded-for']
    });
    return res.status(403).json({
      success: false,
      message: 'Acesso negado: Validação de segurança CSRF falhou.'
    });
  }

  const headerBuf = Buffer.from(String(csrfHeader));
  const cookieBuf = Buffer.from(String(csrfCookie));

  if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
    logger.warn('Falha na validação de segurança CSRF: tokens divergentes', {
      context: 'csrf_middleware',
      method: req.method,
      path: req.originalUrl,
      ip: req.ip || req.headers['x-forwarded-for']
    });
    return res.status(403).json({
      success: false,
      message: 'Acesso negado: Validação de segurança CSRF falhou.'
    });
  }

  next();
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}
