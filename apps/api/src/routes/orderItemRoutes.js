import { Router } from 'express';
import {create, remove, changeQuantity, changeStatus, claimDelivery} from '../controllers/orderItemController.js';
import { validate } from '../middleware/validate.js';
import { createOrderItemSchema,changeQuantitySchema, } from '@simple-order/schemas';
import { requireWaiter } from '../middleware/authenticate.js';
import { validateId } from '../middleware/validateId.js';

const routes = Router();

routes.post('/',  requireWaiter, validate(createOrderItemSchema), create);
routes.patch('/:id/status', validateId, requireWaiter, changeStatus);
routes.patch('/:id/claim-delivery', validateId, requireWaiter, claimDelivery);
routes.patch('/:id', validateId, requireWaiter, validate(changeQuantitySchema), changeQuantity);
routes.delete('/:id', validateId, requireWaiter, remove);

export default routes;
