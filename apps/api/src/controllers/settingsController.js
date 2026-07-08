import { asyncHandler } from '../middleware/asyncHandler.js';
import * as settingsService from '../services/settingsService.js';
import { updateSettingsSchema } from '@simple-order/schemas';
import { AppError } from '../middleware/appError.js';

// Helper function to mask sensitive credentials
function maskValue(val, visibleStart = 8, visibleEnd = 4) {
  if (!val) return '';
  if (val.length <= (visibleStart + visibleEnd)) return '********';
  return `${val.substring(0, visibleStart)}...${'*'.repeat(8)}${val.slice(-visibleEnd)}`;
}

export const get = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  const data = settings.toJSON();
  
  if (data.mercadoPagoAccessToken) {
    data.mercadoPagoAccessToken = maskValue(data.mercadoPagoAccessToken, 8, 4);
  }
  if (data.mercadoPagoWebhookSecret) {
    data.mercadoPagoWebhookSecret = maskValue(data.mercadoPagoWebhookSecret, 2, 2);
  }
  
  res.status(200).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const validated = updateSettingsSchema.safeParse(req.body);
  if (!validated.success) {
    const message = validated.error.errors.map(e => e.message).join(', ');
    throw new AppError(message, 400);
  }

  const currentSettings = await settingsService.getSettings();
  const updateData = { ...validated.data };

  // Normalize empty strings to null to allow clearing the configuration
  if (updateData.mercadoPagoAccessToken === '') updateData.mercadoPagoAccessToken = null;
  if (updateData.mercadoPagoWebhookSecret === '') updateData.mercadoPagoWebhookSecret = null;

  // If credentials contain masking indicators, preserve the existing value
  if (updateData.mercadoPagoAccessToken && (updateData.mercadoPagoAccessToken.includes('*') || updateData.mercadoPagoAccessToken.includes('...'))) {
    updateData.mercadoPagoAccessToken = currentSettings.mercadoPagoAccessToken;
  }
  if (updateData.mercadoPagoWebhookSecret && (updateData.mercadoPagoWebhookSecret.includes('*') || updateData.mercadoPagoWebhookSecret.includes('...'))) {
    updateData.mercadoPagoWebhookSecret = currentSettings.mercadoPagoWebhookSecret;
  }

  const settings = await settingsService.updateSettings(updateData);
  const data = settings.toJSON();

  if (data.mercadoPagoAccessToken) {
    data.mercadoPagoAccessToken = maskValue(data.mercadoPagoAccessToken, 8, 4);
  }
  if (data.mercadoPagoWebhookSecret) {
    data.mercadoPagoWebhookSecret = maskValue(data.mercadoPagoWebhookSecret, 2, 2);
  }

  res.status(200).json({ success: true, data });
});
