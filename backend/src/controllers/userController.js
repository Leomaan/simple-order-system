import { asyncHandler } from '../middleware/asyncHandler.js';
import * as userService from '../services/userService.js';

export const getAll = asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.status(200).json({ success: true, data: users });
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user.userId);
  res.status(200).json({ success: true, data: user });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.userId);
  res.status(200).json({ success: true, message: 'usuário removido' });
});