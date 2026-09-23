import { Router } from 'express';
import { getPublicMenuController } from '../controllers/publicMenuController.js';
import { publicMenuLimiter } from '../middleware/publicRateLimiter.js';
import { publicCacheControl } from '../middleware/publicCache.js';

const routes = Router();

routes.get('/', publicMenuLimiter, publicCacheControl(30), getPublicMenuController);

export default routes;
