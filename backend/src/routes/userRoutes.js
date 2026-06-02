import { Router } from 'express';
import { getAll, getById, create, update, remove, permanentDelete, restore } from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/authtenticate.js';
import { validateId } from '../middleware/validateId.js';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../schemas/userSchema.js';

const routes = Router();
 
routes.get('/', requireAdmin, getAll);
routes.get('/:id', requireAdmin, validateId, getById);
routes.post('/', requireAdmin, validate(createUserSchema), create);
routes.patch('/:id', requireAdmin, validateId, validate(updateUserSchema   ), update);
routes.delete('/:id', requireAdmin, validateId, remove);
routes.patch('/:id/restore', requireAdmin, validateId, restore);
routes.delete('/:id/permanent', requireAdmin, validateId, permanentDelete);
 
export default routes;