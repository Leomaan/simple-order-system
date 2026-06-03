import { AppError } from './appError.js';

export function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0)
    throw new AppError('id inválido', 400);

  req.params.id = id; 
  next();
}