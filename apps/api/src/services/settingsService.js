import Settings from '../models/settings.js';
import logger from '../util/logger.js';
import { formatSettingsDto } from '../dto/settingsDto.js';

export async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      restaurantName: 'Simple Order Restaurant',
    });
  }
  return settings;
}

export async function getFormattedSettings() {
  const settings = await getSettings();
  return formatSettingsDto(settings);
}

export async function updateSettings(data, user = null) {
  const currentSettings = await getSettings();
  const updateData = { ...data };

  const isMaskedOrInvalid = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.includes('*') || str.includes('...') || str.includes('•') || /[^\x20-\x7E]/.test(str);
  };

  if (typeof updateData.mercadoPagoAccessToken === 'string') {
    updateData.mercadoPagoAccessToken = updateData.mercadoPagoAccessToken.trim();
  }
  if (typeof updateData.mercadoPagoWebhookSecret === 'string') {
    updateData.mercadoPagoWebhookSecret = updateData.mercadoPagoWebhookSecret.trim();
  }

  // Normalize empty strings to null to allow clearing the configuration
  if (updateData.mercadoPagoAccessToken === '') updateData.mercadoPagoAccessToken = null;
  if (updateData.mercadoPagoWebhookSecret === '') updateData.mercadoPagoWebhookSecret = null;

  // If credentials contain masking indicators, preserve the existing value
  if (updateData.mercadoPagoAccessToken && isMaskedOrInvalid(updateData.mercadoPagoAccessToken)) {
    updateData.mercadoPagoAccessToken = currentSettings.mercadoPagoAccessToken;
  }
  if (updateData.mercadoPagoWebhookSecret && isMaskedOrInvalid(updateData.mercadoPagoWebhookSecret)) {
    updateData.mercadoPagoWebhookSecret = currentSettings.mercadoPagoWebhookSecret;
  }

  await currentSettings.update(updateData);

  logger.info('Configurações do sistema atualizadas', {
    context: 'settings_service',
    updatedBy: user?.userId || user?.id,
  });

  return formatSettingsDto(currentSettings);
}
