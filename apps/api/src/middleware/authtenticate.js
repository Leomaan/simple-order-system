import jwt from 'jsonwebtoken';
import { AppError } from './appError.js';

export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken || 
    (req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null);

  if (!token)
    return next(new AppError('token não fornecido', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('token inválido ou expirado', 401));
  }
}

export function requireWaiter(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'WAITER' && req.user.role !== 'ADMIN')
      return next(new AppError('acesso não autorizado', 403));
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.role !== 'ADMIN')
      return next(new AppError('acesso restrito ao administrador', 403));
    next();
  });
}