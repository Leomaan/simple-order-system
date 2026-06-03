import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'internal server error';
  return res.status(status).json({ success: false, message });
}