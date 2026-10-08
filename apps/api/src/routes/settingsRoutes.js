import { Router } from 'express';
import { get, update } from '../controllers/settingsController.js';
import { requireAdmin } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '@simple-order/schemas';

const routes = Router();

routes.get('/', requireAdmin, get);
routes.put('/', requireAdmin, validate(updateSettingsSchema), update);

export default routes;
