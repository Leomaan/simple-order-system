import { Router } from 'express';
import { requireAdmin } from '../middleware/authtenticate.js';
import { getSalesToday, getRevenueByPeriod, getOrdersByPeriod } from '../controllers/reportController.js';

const routes = Router();

routes.get('/today', requireAdmin, getSalesToday);

routes.get('/revenue', requireAdmin, getRevenueByPeriod);

routes.get('/orders', requireAdmin, getOrdersByPeriod);

export default routes;