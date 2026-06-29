import { Router } from 'express';
import { generatePix, receiveWebhook, simulatePaymentConfirmation } from '../controllers/paymentController.js';
import { requireWaiter } from '../middleware/authtenticate.js';

const routes = Router();

// Endpoint to generate PIX payload and QR Code
routes.post('/pix', requireWaiter, generatePix);

// Webhook receiver (must be public so Mercado Pago can reach it)
routes.post('/webhook', receiveWebhook);

// Helper route to manually confirm payment in dev environments
routes.post('/simulate-confirm', requireWaiter, simulatePaymentConfirmation);

export default routes;
