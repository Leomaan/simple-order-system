import { asyncHandler } from '../middleware/asyncHandler.js';
import * as authService from '../services/authService.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,             
  secure: isProduction,            
  sameSite: isProduction ? 'strict' : 'lax',
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

  res.status(200).json({
    success: true,
    data: { role: result.role, name: result.name }, 
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const result = await authService.refresh(token);

  res.cookie('accessToken', result.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { role: result.role, name: result.name },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const ip = req.ip || req.headers['x-forwarded-for'];

  await authService.logout(token, req.user, ip);

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.status(200).json({ success: true, message: 'logout realizado com sucesso' });
});