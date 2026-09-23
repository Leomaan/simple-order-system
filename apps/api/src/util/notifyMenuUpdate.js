import { emitEvent } from '../util/socket.js';
import logger from '../util/logger.js';

export function notifyMenuUpdate(action, product = null) {
  try {
    const payload = {
      action,
      productId: product?.id || null,
      updatedAt: new Date().toISOString(),
    };

    emitEvent('menu:updated', payload);
  } catch (err) {
    logger.error('Erro ao emitir evento menu:updated', { context: 'public_menu_notifier', error: err.message });
  }
}
