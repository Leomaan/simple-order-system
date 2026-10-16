import { asyncHandler } from '../middleware/asyncHandler.js';
import * as settingsService from '../services/settingsService.js';

export const get = asyncHandler(async (req, res) => {
  const data = await settingsService.getFormattedSettings(req.companyId);
  res.status(200).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await settingsService.updateSettings(req.body, req.user, req.companyId);
  res.status(200).json({ success: true, data });
});
