import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.js';
import RefreshToken from '../models/refreshToken.js';
import { AppError } from '../middleware/appError.js';

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

  await RefreshToken.create({ token, UserId: userId, expiresAt });
  return token;
}

export async function login(email, password) {
  const user = await User.findOne({ where: { email } });

  if (!user || !user.active)
    throw new AppError('credenciais inválidas', 401);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    throw new AppError('credenciais inválidas', 401);

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken, role: user.role, name: user.name };
}

export async function refresh(token) {
  if (!token) throw new AppError('refresh token não fornecido', 401);

  const stored = await RefreshToken.findOne({
    where: { token },
    include: [User],
  });

  if (!stored) throw new AppError('refresh token inválido', 401);
  if (new Date() > stored.expiresAt) {
    await stored.destroy();
    throw new AppError('refresh token expirado', 401);
  }
  if (!stored.User.active) throw new AppError('usuário inativo', 401);

  const accessToken = generateAccessToken(stored.User);
  return { accessToken };
}

export async function logout(token) {
  if (!token) throw new AppError('refresh token não fornecido', 400);
  await RefreshToken.destroy({ where: { token } });
}