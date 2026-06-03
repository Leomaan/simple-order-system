import { Router } from 'express';
import {create, remove, changeQuantity,} from '../controllers/orderItemController.js';
import { validate } from '../middleware/validate.js';
import { createOrderItemSchema,changeQuantitySchema, } from '@simple-order/schemas';
import { requireWaiter } from '../middleware/authtenticate.js';
import { validateId } from '../middleware/validateId.js';

const routes = Router();

routes.post('/',  requireWaiter, validate(createOrderItemSchema), create);
routes.patch('/:id', validateId, requireWaiter, validate(changeQuantitySchema), changeQuantity);
routes.delete('/:id', validateId, requireWaiter, remove);

export default routes;
