import logger from '../util/logger.js';

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'internal server error';
  
  logger.error(err, { 
    path: req.originalUrl, 
    method: req.method, 
    ip: req.ip || req.headers['x-forwarded-for'] 
  });
  
  return res.status(status).json({ success: false, message });
}