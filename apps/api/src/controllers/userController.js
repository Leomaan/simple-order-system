import { asyncHandler } from '../middleware/asyncHandler.js';
import * as userService from '../services/userService.js';
import { log } from '../services/auditLogService.js';
 
export const getAll = asyncHandler(async (req, res) => {
  const onlyDeleted = req.query.onlyDeleted === 'true';
  const { page, limit } = req.query;
  const users = await userService.findAll(onlyDeleted, page, limit);
  res.status(200).json({ success: true, data: users });
});
 
export const getById = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});
 
export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  await log({ user: req.user, action: 'CREATE_USER', entity: 'User', entityId: user.id, details: { name: user.name, role: user.role } });
  res.status(201).json({ success: true, data: user });
});
 
export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user.userId);
  await log({ user: req.user, action: 'UPDATE_USER', entity: 'User', entityId: user.id, details: { name: user.name, ...req.body } });
  res.status(200).json({ success: true, data: user });
});
 
export const remove = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id, req.user.userId);
  await log({ user: req.user, action: 'DELETE_USER', entity: 'User', entityId: Number(req.params.id), details: { name: user.name } });
  res.status(200).json({ success: true, message: 'usuário removido' });
});
 
export const restore = asyncHandler(async (req, res) => {
  const user = await userService.restoreUser(req.params.id);
  await log({ user: req.user, action: 'RESTORE_USER', entity: 'User', entityId: user.id, details: { name: user.name } });
  res.status(200).json({ success: true, data: user });
});
 
export const permanentDelete = asyncHandler(async (req, res) => {
  const user = await userService.permanentDeleteUser(req.params.id, req.user.userId);
  await log({ user: req.user, action: 'PERMANENT_DELETE_USER', entity: 'User', entityId: Number(req.params.id), details: { name: user.name } });
  res.status(200).json({ success: true, message: 'usuário permanentemente deletado' });
});