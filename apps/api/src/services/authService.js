import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.js';
import RefreshToken from '../models/refreshToken.js';
import { AppError } from '../middleware/appError.js';
import { log } from './auditLogService.js';

function generateAccessToken(user) {
  return jwt.sign(
    { 
      userId: user.userId || user.id, 
      role: user.role, 
      name: user.name,
      companyId: user.companyId || null,
      isSuperAdmin: !!user.isSuperAdmin,
      impersonating: !!user.impersonating,
      impersonatedCompany: user.impersonatedCompany || null,
    },
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

export async function login(email, password, ip) {
  const user = await User.findOne({ where: { email } });

  if (!user || !user.active)
    throw new AppError('credenciais inválidas', 401);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    throw new AppError('credenciais inválidas', 401);

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  await log({
    user:   { userId: user.id, name: user.name, role: user.role },
    action: 'LOGIN',
    ip,
  });

  return { 
    accessToken, 
    refreshToken, 
    role: user.role, 
    name: user.name,
    companyId: user.companyId || null,
    isSuperAdmin: !!user.isSuperAdmin
  };
}

export async function refresh(token, impersonationData = null) {
  if (!token) throw new AppError('refresh token não fornecido', 401);

  const stored = await RefreshToken.findOne({ where: { token }, include: [User] });

  if (!stored) throw new AppError('refresh token inválido', 401);
  if (new Date() > stored.expiresAt) {
    await stored.destroy();
    throw new AppError('refresh token expirado', 401);
  }
  if (!stored.User.active) throw new AppError('usuário inativo', 401);

  const impersonatedCompanyId = typeof impersonationData === 'object' && impersonationData !== null
    ? impersonationData.companyId
    : impersonationData;

  const isImpersonating = Boolean(
    stored.User.isSuperAdmin &&
    impersonatedCompanyId &&
    (typeof impersonationData === 'object' ? impersonationData.impersonating !== false : true)
  );

  const effectiveCompanyId = (stored.User.isSuperAdmin && impersonatedCompanyId)
    ? impersonatedCompanyId
    : (stored.User.companyId || null);

  const effectiveName = isImpersonating && impersonationData?.name
    ? impersonationData.name
    : stored.User.name;

  const userPayload = {
    ...(typeof stored.User.toJSON === 'function' ? stored.User.toJSON() : stored.User),
    id: stored.User.id,
    userId: stored.User.id,
    name: effectiveName,
    companyId: effectiveCompanyId,
    isSuperAdmin: !!stored.User.isSuperAdmin,
    impersonating: isImpersonating,
    impersonatedCompany: isImpersonating ? impersonationData?.impersonatedCompany : null,
  };

  const accessToken = generateAccessToken(userPayload);
  return { 
    accessToken, 
    role: stored.User.role, 
    name: effectiveName, 
    companyId: effectiveCompanyId,
    isSuperAdmin: !!stored.User.isSuperAdmin,
    impersonating: isImpersonating,
  };
}

export async function logout(token, user = null, ip = null) {
  if (!token) throw new AppError('refresh token não fornecido', 400);

  let currentUser = user;
  if (!currentUser) {
    const stored = await RefreshToken.findOne({ where: { token }, include: [User] });
    if (stored?.User) {
      currentUser = { userId: stored.User.id, name: stored.User.name, role: stored.User.role };
    }
  }

  await RefreshToken.destroy({ where: { token } });

  if (currentUser) {
    await log({ user: currentUser, action: 'LOGOUT', ip });
  }
}