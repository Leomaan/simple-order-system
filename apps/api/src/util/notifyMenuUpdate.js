import { emitEvent } from '../util/socket.js';
import logger from '../util/logger.js';

export function notifyMenuUpdate(action, product = null, companyId = null) {
  try {
    const payload = {
      action,
      productId: product?.id || null,
      updatedAt: new Date().toISOString(),
    };

    const targetCompanyId = companyId || product?.companyId;
    const companyRoom = targetCompanyId ? `company:${targetCompanyId}` : null;
    emitEvent('menu:updated', payload, companyRoom);
  } catch (err) {
    logger.error('Erro ao emitir evento menu:updated', { context: 'public_menu_notifier', error: err.message });
  }
}
