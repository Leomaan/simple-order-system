import { asyncHandler } from '../middleware/asyncHandler.js';
import * as paymentService from '../services/paymentService.js';

/**
 * Controller for handling payment endpoints
 */

export const generatePix = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const paymentData = await paymentService.createPixPayment(orderId);
  res.status(200).json({ success: true, data: paymentData });
});

export const receiveWebhook = asyncHandler(async (req, res) => {
  // Webhooks are sent asynchronously. Return a 200 OK fast to Mercado Pago to avoid retries,
  // then process the payload in the background.
  res.status(200).send('OK');

  try {
    const result = await paymentService.processWebhook(req.body);
    console.log('Webhook processed result:', result);
  } catch (error) {
    console.error('Error processing webhook async:', error.message);
  }
});

export const simulatePaymentConfirmation = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'paymentId is required' });
  }

  const user = req.user || { name: 'admin_simulator', role: 'ADMIN' };
  const result = await paymentService.approveMockPayment(paymentId, user);

  if (result.success) {
    res.status(200).json({ success: true, message: 'Payment simulated and approved successfully', data: result });
  } else {
    res.status(400).json({ success: false, message: result.reason || 'Simulation failed' });
  }
});
