import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { login } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const loginSchema = z.object({
  code: z.string({ error: 'código de acesso é obrigatório' }).min(1),
});

const routes = Router();

routes.post('/login', validate(loginSchema), asyncHandler(login));

export default routes;