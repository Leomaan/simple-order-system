import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { loginSchema, refreshSchema } from '../schemas/schemas.js';

const routes = Router();
 
routes.post('/login',   validate(loginSchema),   login);
routes.post('/refresh', validate(refreshSchema), refresh);
routes.post('/logout',  logout);
 
export default routes;