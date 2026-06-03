import { asyncHandler } from '../middleware/asyncHandler.js';
import * as authService from '../services/authService.js';
 
export const login = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const result = await authService.login(req.body.email, req.body.password, ip);
  res.status(200).json({ success: true, data: result });
});
 
export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.status(200).json({ success: true, data: result });
});
 
export const logout = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  await authService.logout(req.body.refreshToken, req.user, ip);
  res.status(200).json({ success: true, message: 'logout realizado com sucesso' });
});