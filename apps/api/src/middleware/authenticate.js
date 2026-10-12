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
    // Vincula o companyId diretamente no request para acesso prático nos controllers e queries
    req.companyId = decoded.companyId || null;
    next();
  } catch (err) {
    return next(new AppError('token inválido ou expirado', 401));
  }
}

export function requireSuperAdmin(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (!req.user?.isSuperAdmin)
      return next(new AppError('acesso restrito ao superadministrador do sistema', 403));
    next();
  });
}

export function requireCompanyUser(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    // SuperAdmin tem bypass global ou o usuário deve pertencer a uma empresa
    if (!req.user?.isSuperAdmin && !req.companyId) {
      return next(new AppError('usuário não vinculado a uma empresa ativa', 403));
    }
    next();
  });
}

export function requireWaiter(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'WAITER' && req.user.role !== 'ADMIN' && !req.user.isSuperAdmin)
      return next(new AppError('acesso não autorizado', 403));
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.role !== 'ADMIN' && !req.user.isSuperAdmin)
      return next(new AppError('acesso restrito ao administrador', 403));
    next();
  });
}