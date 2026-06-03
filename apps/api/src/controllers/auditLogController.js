import { asyncHandler } from '../middleware/asyncHandler.js';
import { findAll } from '../services/auditLogService.js';

export const getAll = asyncHandler(async (req, res) => {
  const { userId, action, entity, from, to } = req.query;
  const logs = await findAll({ userId, action, entity, from, to });
  res.status(200).json({ success: true, data: logs });
});