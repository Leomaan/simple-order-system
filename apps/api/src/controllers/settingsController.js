import { asyncHandler } from '../middleware/asyncHandler.js';
import * as settingsService from '../services/settingsService.js';

export const get = asyncHandler(async (req, res) => {
  const data = await settingsService.getFormattedSettings();
  res.status(200).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await settingsService.updateSettings(req.body, req.user);
  res.status(200).json({ success: true, data });
});
