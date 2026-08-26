import Settings from '../models/settings.js';
import logger from '../util/logger.js';

function maskValue(val, visibleStart = 8, visibleEnd = 4) {
  if (!val) return '';
  if (val.length <= (visibleStart + visibleEnd)) return '********';
  return `${val.substring(0, visibleStart)}...${'*'.repeat(8)}${val.slice(-visibleEnd)}`;
}

export function formatSettingsWithMasks(settings) {
  const data = typeof settings.toJSON === 'function' ? settings.toJSON() : { ...settings };
  if (data.mercadoPagoAccessToken) {
    data.mercadoPagoAccessToken = maskValue(data.mercadoPagoAccessToken, 8, 4);
  }
  if (data.mercadoPagoWebhookSecret) {
    data.mercadoPagoWebhookSecret = maskValue(data.mercadoPagoWebhookSecret, 2, 2);
  }
  return data;
}

export async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      restaurantName: 'Simple Order Restaurant',
    });
  }
  return settings;
}

export async function getMaskedSettings() {
  const settings = await getSettings();
  return formatSettingsWithMasks(settings);
}

export async function updateSettings(data, user = null) {
  const currentSettings = await getSettings();
  const updateData = { ...data };

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

  await currentSettings.update(updateData);

  logger.info('Configurações do sistema atualizadas', {
    context: 'settings_service',
    updatedBy: user?.userId || user?.id,
  });

  return formatSettingsWithMasks(currentSettings);
}
