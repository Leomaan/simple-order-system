import { Router } from 'express';
import { create, getAll, getById, update, close, reopen, remove, restore, permanentDelete, } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderSchema } from '@simple-order/schemas';
import { requireAdmin, requireWaiter } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const routes = Router();

routes.post('/', requireWaiter, validate(createOrderSchema), create);
routes.get('/',  requireWaiter, getAll);
routes.get('/:id', validateId, requireWaiter, getById);
routes.put('/:id', validateId, requireWaiter, validate(updateOrderSchema), update);
routes.patch('/:id/close', validateId, requireWaiter, close);
routes.patch('/:id/reopen', validateId, requireWaiter, reopen);
routes.delete('/:id', validateId, requireAdmin, remove);
routes.patch('/:id/restore', requireAdmin,  validateId, restore);
routes.delete('/:id/permanent', requireAdmin,  validateId, permanentDelete)

export default routes;
