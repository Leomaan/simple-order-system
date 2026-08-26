import { Router } from 'express';
import { generatePix, receiveWebhook, simulatePaymentConfirmation } from '../controllers/paymentController.js';
import { requireWaiter } from '../middleware/authenticate.js';
import { verifyWebhookSignature } from '../middleware/verifyWebhookSignature.js';

const routes = Router();

// Endpoint to generate PIX payload and QR Code
routes.post('/pix', requireWaiter, generatePix);

// Webhook receiver (protected by signature verification middleware)
routes.post('/webhook', verifyWebhookSignature, receiveWebhook);

// Helper route to manually confirm payment in dev environments
routes.post('/simulate-confirm', requireWaiter, simulatePaymentConfirmation);

export default routes;
