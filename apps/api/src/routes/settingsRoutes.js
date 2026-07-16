import { Router } from 'express';
import { get, update } from '../controllers/settingsController.js';
import { requireAdmin } from '../middleware/authenticate.js';

const routes = Router();

routes.get('/', requireAdmin, get);
routes.put('/', requireAdmin, update);

export default routes;
