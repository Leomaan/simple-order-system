import jwt from 'jsonwebtoken';
import { AppError } from './appError.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new AppError('token não fornecido', 401);

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError('token inválido ou expirado', 401);
  }
}

export function requireWaiter(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'waiter' && req.user.role !== 'admin')
      throw new AppError('acesso não autorizado', 403);
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin')
      throw new AppError('acesso restrito ao administrador', 403);
    next();
  });
}