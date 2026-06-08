const User = require('../models/user');
const Payment = require('../models/payment');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create Cashfree Order or Mock Order for payment checkout
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find User
    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if already Pro
    if (user.isPro) {
      return successResponse(res, 'User is already a Pro member', { isPro: true });
    }

    const orderId = `cf_order_${Date.now()}_${userId}`;
    const amount = 1499.00; // Flat price in INR (~$19 USD)
    const currency = 'INR';

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isMock = !appId || !secretKey;

    if (!isMock) {
      // Real Cashfree API order creation
      try {
        const cashfreeUrl = 'https://sandbox.cashfree.com/pg/orders'; // Sandbox endpoint
        const response = await fetch(cashfreeUrl, {
          method: 'POST',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: amount,
            order_currency: currency,
            customer_details: {
              customer_id: `cust_${userId}`,
              customer_email: user.email,
              customer_phone: '9999999999', // Cashfree requires a valid customer phone number format
            },
            order_meta: {
              return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status?order_id={order_id}`,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Cashfree order creation error:', data);
          return errorResponse(res, data.message || 'Error communicating with Cashfree Payment Gateway', response.status);
        }

        // Save payment record in database
        const payment = await Payment.create({
          userId,
          orderId,
          paymentSessionId: data.payment_session_id,
          amount,
          currency,
          status: 'PENDING',
        });

        return successResponse(res, 'Cashfree order created successfully', {
          isMock: false,
          orderId,
          paymentSessionId: data.payment_session_id,
          amount,
        });

      } catch (cfError) {
        console.error('Cashfree connection failed, falling back to mock sandbox:', cfError.message);
        // Fallback to mock order on connection failures
      }
    }

    // Mock/Sandbox Fallback Flow
    const paymentSessionId = `mock_session_${Date.now()}_${userId}`;
    const payment = await Payment.create({
      userId,
      orderId,
      paymentSessionId,
      amount,
      currency,
      status: 'PENDING',
    });

    return successResponse(res, 'Mock payment session initialized successfully', {
      isMock: true,
      orderId,
      paymentSessionId,
      amount,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Verify Cashfree checkout or simulated Mock order status
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, simulateStatus } = req.body;
    const userId = req.user.id;

    if (!orderId) {
      return errorResponse(res, 'Order ID is required for verification', 400);
    }

    // Find local payment record
    const payment = await Payment.findOne({ where: { orderId, userId } });
    if (!payment) {
      return errorResponse(res, 'Payment transaction record not found', 404);
    }

    // If transaction is already marked paid, return success directly
    if (payment.status === 'PAID') {
      // Ensure user is Pro
      const user = await User.findByPk(userId);
      if (user && !user.isPro) {
        user.isPro = true;
        await user.save();
      }
      return successResponse(res, 'Payment already verified successfully', { status: 'PAID' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isMock = !appId || !secretKey || payment.paymentSessionId.startsWith('mock_session_');

    if (!isMock) {
      // Real API Verification
      try {
        const cashfreeUrl = `https://sandbox.cashfree.com/pg/orders/${orderId}`;
        const response = await fetch(cashfreeUrl, {
          method: 'GET',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
          },
        });

        const data = await response.json();
        payment.gatewayResponse = JSON.stringify(data);

        if (response.ok && data.order_status === 'PAID') {
          // Success
          payment.status = 'PAID';
          await payment.save();

          // Grant Pro Status
          const user = await User.findByPk(userId);
          user.isPro = true;
          await user.save();

          return successResponse(res, 'Payment verified and Pro status granted successfully', { status: 'PAID' });
        } else {
          // Check if it failed or is still active/pending
          if (data.order_status === 'FAILED') {
            payment.status = 'FAILED';
          }
          await payment.save();

          return successResponse(res, `Payment status checked: ${data.order_status || 'PENDING'}`, {
            status: payment.status,
            gatewayStatus: data.order_status,
          });
        }
      } catch (cfError) {
        console.error('Cashfree status verification connection failed:', cfError.message);
        // Fallback or bubble up error
      }
    }

    // Mock payment simulation logic
    if (simulateStatus === 'SUCCESS') {
      payment.status = 'PAID';
      payment.gatewayResponse = JSON.stringify({ simulateStatus, message: 'Mock payment success simulation' });
      await payment.save();

      // Grant Pro Status
      const user = await User.findByPk(userId);
      user.isPro = true;
      await user.save();

      return successResponse(res, 'Mock payment simulated successfully. Pro status granted!', { status: 'PAID' });
    } else {
      payment.status = 'FAILED';
      payment.gatewayResponse = JSON.stringify({ simulateStatus, message: 'Mock payment failure simulation' });
      await payment.save();

      return successResponse(res, 'Mock payment simulated as FAILED', { status: 'FAILED' });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
