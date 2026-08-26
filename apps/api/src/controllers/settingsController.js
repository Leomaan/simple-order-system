import { asyncHandler } from '../middleware/asyncHandler.js';
import * as settingsService from '../services/settingsService.js';
import { updateSettingsSchema } from '@simple-order/schemas';
import { AppError } from '../middleware/appError.js';

export const get = asyncHandler(async (req, res) => {
  const data = await settingsService.getMaskedSettings();
  res.status(200).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const validated = updateSettingsSchema.safeParse(req.body);
  if (!validated.success) {
    const message = validated.error.errors.map(e => e.message).join(', ');
    throw new AppError(message, 400);
  }

  const data = await settingsService.updateSettings(validated.data, req.user);
  res.status(200).json({ success: true, data });
});
