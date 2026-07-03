const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, orderController.createOrder);
router.get('/:id', verifyToken, orderController.getOrderById);
router.get('/verify-payment/:id', verifyToken, orderController.verifyPayment);

// Webhook endpoints (called by payment networks)
router.post('/stripe-webhook', orderController.handleStripeWebhook);
router.post('/chapa-webhook', orderController.handleChapaWebhook);

// Backward compatibility or fallback endpoints
router.post('/simulate-payment', verifyToken, orderController.simulatePaymentCompletion);
router.post('/chapa-callback', orderController.handleChapaWebhook);

module.exports = router;
