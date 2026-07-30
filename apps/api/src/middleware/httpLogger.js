import logger from '../util/logger.js';

export function httpLogger(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, `HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`, {
      context: 'http_request',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']
    });
  });

  next();
}
