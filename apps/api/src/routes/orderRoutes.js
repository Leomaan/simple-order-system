import { Router } from 'express';
import { create, getAll, getById, update, close, remove, restore, permanentDelete, } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderSchema } from '@simple-order/schemas';
import { requireAdmin, requireWaiter } from '../middleware/authtenticate.js';
import { validateId } from '../middleware/validateId.js';

const routes = Router();

routes.post('/', requireWaiter, validate(createOrderSchema), create);
routes.get('/',  requireWaiter, getAll);
routes.get('/:id', validateId, requireWaiter, getById);
routes.put('/:id', validateId, requireWaiter, validate(updateOrderSchema), update);
routes.patch('/:id/close', validateId, requireWaiter, close);
routes.delete('/:id', validateId, remove);
routes.patch('/:id/restore', requireAdmin,  validateId, restore);
routes.delete('/:id/permanent', requireAdmin,  validateId, permanentDelete)

export default routes;
