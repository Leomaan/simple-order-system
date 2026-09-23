function maskValue(val, visibleStart = 8, visibleEnd = 4) {
  if (!val) return '';
  if (val.length <= (visibleStart + visibleEnd)) return '********';
  return `${val.substring(0, visibleStart)}...${'*'.repeat(8)}${val.slice(-visibleEnd)}`;
}

export function formatSettingsDto(settings) {
  if (!settings) return null;

  const raw = typeof settings.toJSON === 'function' ? settings.toJSON() : settings;

  return {
    id: raw.id,
    restaurantName: raw.restaurantName || '',
    mercadoPagoAccessToken: maskValue(raw.mercadoPagoAccessToken, 8, 4),
    mercadoPagoWebhookSecret: maskValue(raw.mercadoPagoWebhookSecret, 2, 2),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null,
  };
}
