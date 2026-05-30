import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/appError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) throw new AppError('código de acesso é obrigatório');

  let role;

  if (code === process.env.ADMIN_CODE) {
    role = 'admin';
  } else if (code === process.env.WAITER_CODE) {
    role = 'waiter';
  } else {
    throw new AppError('código de acesso inválido', 401);
  }

  const token = jwt.sign(
    { role },
    process.env.JWT_SECRET,
    { expiresIn: role === 'admin' ? '8h' : '12h' }
  );

  return res.status(200).json({ success: true, role, token });
});