import { asyncHandler } from '../middleware/asyncHandler.js';
import { sequelize } from '../models/index.js';
import logger from '../util/logger.js';

export const checkHealth = asyncHandler(async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(), 
      database: 'connected' 
    });
  } catch (err) {
    logger.error('Falha na verificação de saúde da API (Health Check)', {
      context: 'health_check',
      error: err.message,
      stack: err.stack
    });

    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(), 
      database: 'disconnected' 
    });
  }
});
