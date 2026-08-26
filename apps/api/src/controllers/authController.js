import { asyncHandler } from '../middleware/asyncHandler.js';
import * as authService from '../services/authService.js';
import crypto from 'crypto';
import logger from '../util/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,             
  secure: isProduction,            
  sameSite: isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax',
};

const getCsrfCookieOptions = (req) => {
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  return {
    httpOnly: false,
    secure: isProduction && !isLocal,
    sameSite: isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax',
  };
};

export const login = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const result = await authService.login(req.body.email, req.body.password, ip);

  res.cookie('accessToken', result.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie('refreshToken', result.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  // Gerar token CSRF para a sessão do cliente
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', csrfToken, {
    ...getCsrfCookieOptions(req),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info('Login realizado com sucesso', { context: 'auth_controller', email: req.body.email, role: result.role, ip });

  res.status(200).json({
    success: true,
    data: { role: result.role, name: result.name, csrfToken }, 
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.refresh(token);

  res.cookie('accessToken', result.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Renovar o token CSRF
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', csrfToken, {
    ...getCsrfCookieOptions(req),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info('Token de acesso renovado com sucesso', { context: 'auth_controller', role: result.role });

  res.status(200).json({
    success: true,
    data: { role: result.role, name: result.name, csrfToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const ip = req.ip || req.headers['x-forwarded-for'];

  await authService.logout(token, req.user, ip);

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.clearCookie('XSRF-TOKEN', getCsrfCookieOptions(req));

  logger.info('Logout realizado com sucesso', { context: 'auth_controller', userId: req.user?.id, ip });

  res.status(200).json({ success: true, message: 'logout realizado com sucesso' });
});