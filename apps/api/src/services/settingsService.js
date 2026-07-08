import Settings from '../models/settings.js';

export async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      restaurantName: 'Simple Order Restaurant',
    });
  }
  return settings;
}

export async function updateSettings(data) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      restaurantName: data.restaurantName || 'Simple Order Restaurant',
      mercadoPagoAccessToken: data.mercadoPagoAccessToken,
      mercadoPagoWebhookSecret: data.mercadoPagoWebhookSecret,
    });
  } else {
    await settings.update(data);
  }
  return settings;
}
