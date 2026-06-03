import { Router } from 'express';
import { requireAdmin } from '../middleware/authtenticate.js';
import { getAll } from '../controllers/auditLogController.js';

const routes = Router();

routes.get('/', requireAdmin, getAll);

export default routes;