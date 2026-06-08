const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Create a new Cashfree/Mock checkout order
router.post('/create-order', authenticateJWT, createOrder);

// Verify Cashfree/Mock checkout order status
router.post('/verify', authenticateJWT, verifyPayment);

module.exports = router;
