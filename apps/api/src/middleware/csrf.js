import crypto from 'crypto';

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
    console.warn(`[CSRF Warning] Falha na validação: Header = "${csrfHeader}", Cookie = "${csrfCookie}"`);
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
