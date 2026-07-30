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

  // Bypass CSRF checks for the login and refresh routes, since session/tokens are being established/renewed
  const bypassRoutes = ['/auth/login', '/auth/refresh'];
  if (bypassRoutes.some(route => req.originalUrl.includes(route))) {
    return next();
  }

  const csrfHeader = req.headers['x-xsrf-token'];
  const csrfCookie = req.cookies['XSRF-TOKEN'];

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    logger.warn('Falha na validação de segurança CSRF', {
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
