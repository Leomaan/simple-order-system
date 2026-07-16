import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema } from '@simple-order/schemas';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authenticate.js';

const routes = Router();
 
routes.post('/login', loginLimiter, validate(loginSchema), login);
routes.post('/refresh', validate(refreshSchema), refresh);
routes.post('/logout', authenticate, logout);
 
export default routes;