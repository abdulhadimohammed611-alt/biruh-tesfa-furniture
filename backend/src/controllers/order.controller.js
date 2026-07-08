const db = require('../config/db');
const crypto = require('crypto');
require('dotenv').config();

const createOrder = async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod, currency, totalAmount } = req.body;
  const userId = req.user.id;

  if (!cartItems || cartItems.length === 0 || !shippingAddress || !paymentMethod || !currency || !totalAmount) {
    return res.status(400).json({ message: 'Missing required order details.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Validate and check stock for each item
    for (const item of cartItems) {
      const prodResult = await client.query('SELECT stock, name_en FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
      if (prodResult.rows.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      
      const product = prodResult.rows[0];
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name_en}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    // 2. Insert Order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, payment_status, currency, total_amount, order_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        JSON.stringify(shippingAddress),
        paymentMethod,
        'pending', // all start pending until webhook or callback
        currency,
        parseFloat(totalAmount),
        'processing'
      ]
    );

    const order = orderResult.rows[0];

    // 3. Insert Order Items & Decrement Stock
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, parseFloat(item.price)]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 4. Handle Payments Gateways Integration
    let paymentDetails = {};

    if (paymentMethod === 'stripe') {
      const isMockStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock');
      if (!isMockStripe) {
        try {
          const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);
          
          // Construct line items with product names looked up from DB
          const lineItems = [];
          for (const item of cartItems) {
            const prodRes = await client.query('SELECT name_en FROM products WHERE id = $1', [item.product_id]);
            const prodName = prodRes.rows[0]?.name_en || 'Furniture Item';
            
            lineItems.push({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: prodName,
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
              },
              quantity: item.quantity,
            });
          }

          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${frontendUrl}/profile?order_success=true&order_id=${order.id}`,
            cancel_url: `${frontendUrl}/checkout`,
            metadata: { order_id: order.id, user_id: userId },
          });

          await client.query('UPDATE orders SET payment_intent_id = $1 WHERE id = $2', [session.id, order.id]);
          paymentDetails = {
            checkoutUrl: session.url,
            stripeEnabled: true
          };
        } catch (e) {
          console.error('Stripe Checkout Session initialization failed:', e.message);
          throw new Error('Stripe payment service is currently unavailable: ' + e.message);
        }
      } else {
        // Mock Stripe Integration
        const mockSessionId = 'cs_mock_' + Math.random().toString(36).substring(2, 15);
        await client.query('UPDATE orders SET payment_intent_id = $1 WHERE id = $2', [mockSessionId, order.id]);
        const mockFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        paymentDetails = {
          checkoutUrl: `${mockFrontend}/profile?order_success=true&order_id=${order.id}&mock_stripe=true`,
          stripeEnabled: false,
          mockSessionId
        };
      }
    } else if (paymentMethod === 'chapa') {
      const txRef = `tx-bt-${order.id}-${Date.now()}`;
      await client.query('UPDATE orders SET payment_intent_id = $1 WHERE id = $2', [txRef, order.id]);

      const chapaSecret = process.env.CHAPA_SECRET_KEY;
      const isMockChapa = !chapaSecret || chapaSecret.includes('mock');
      
      if (!isMockChapa) {
        try {
          // Real Chapa Integration
          const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${chapaSecret}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: totalAmount.toString(),
              currency: 'ETB',
              email: req.user.email,
              first_name: shippingAddress.name.split(' ')[0] || 'Customer',
              last_name: shippingAddress.name.split(' ')[1] || 'BiruhTesfa',
              tx_ref: txRef,
              callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/chapa-webhook`,
              return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?order_success=true&order_id=${order.id}`,
              customization: {
                title: 'BIRUH TESFA Furniture Payment',
                description: 'Payment for order ' + order.id
              }
            })
          });

          const data = await response.json();
          if (data.status === 'success') {
            paymentDetails = {
              checkoutUrl: data.data.checkout_url,
              chapaEnabled: true
            };
          } else {
            throw new Error(data.message || 'Chapa initialization failed.');
          }
        } catch (e) {
          console.error('Chapa SDK initialization failed:', e.message);
          throw new Error('Chapa payment initialization failed: ' + e.message);
        }
      } else {
        // Mock Chapa
        const chapaFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        paymentDetails = {
          checkoutUrl: `${chapaFrontend}/profile?order_success=true&order_id=${order.id}&mock_chapa=true`,
          chapaEnabled: false
        };
      }
    } else if (paymentMethod === 'telebirr') {
      // Telebirr simulation
      const mockRef = 'telebirr_ref_' + Math.random().toString(36).substring(2, 10);
      await client.query('UPDATE orders SET payment_intent_id = $1 WHERE id = $2', [mockRef, order.id]);
      const telebirrFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      paymentDetails = {
        checkoutUrl: `${telebirrFrontend}/profile?order_success=true&order_id=${order.id}&mock_telebirr=true`,
        telebirrEnabled: false
      };
    } else if (paymentMethod === 'bank_transfer') {
      // Bank transfer instructions
      paymentDetails = {
        instructions: 'Please transfer the total amount to CBE Account 1000123456789 (Biruh Tesfa Furniture) or Awash Bank 0132045678900. Upload or send screenshot to support.',
        bankAccountDetails: 'CBE: 1000123456789, Awash: 0132045678900'
      };
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order created successfully',
      order,
      paymentDetails
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    return res.status(500).json({ message: error.message || 'Server error creating order.' });
  } finally {
    client.release();
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = orderResult.rows[0];

    // Authorize user to see their own order, or admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.*, p.name_en, p.name_am, p.images[1] as image 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    return res.status(200).json({
      ...order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({ message: 'Server error fetching order details.' });
  }
};

// Direct server-to-server transaction status verification
const verifyPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'paid') {
      return res.status(200).json({
        message: 'Order already paid.',
        payment_status: 'paid',
        order
      });
    }

    const paymentMethod = order.payment_method;
    const intentId = order.payment_intent_id;

    if (!intentId) {
      return res.status(400).json({ message: 'No payment transaction ID found for this order.' });
    }

    let isPaid = false;

    if (paymentMethod === 'stripe') {
      const isMockStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock');
      if (!isMockStripe) {
        const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripeInstance.checkout.sessions.retrieve(intentId);
        if (session.payment_status === 'paid') {
          isPaid = true;
        }
      } else {
        isPaid = true;
      }
    } else if (paymentMethod === 'chapa') {
      const chapaSecret = process.env.CHAPA_SECRET_KEY;
      const isMockChapa = !chapaSecret || chapaSecret.includes('mock');
      if (!isMockChapa) {
        const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${intentId}`, {
          headers: {
            'Authorization': `Bearer ${chapaSecret}`
          }
        });
        const data = await response.json();
        if (data.status === 'success' && data.data?.status === 'success') {
          isPaid = true;
        }
      } else {
        isPaid = true;
      }
    } else if (paymentMethod === 'telebirr') {
      isPaid = true;
    }

    if (isPaid) {
      const updatedOrder = await db.query(
        "UPDATE orders SET payment_status = 'paid' WHERE id = $1 RETURNING *",
        [id]
      );
      return res.status(200).json({
        message: 'Payment verified successfully.',
        payment_status: 'paid',
        order: updatedOrder.rows[0]
      });
    }

    return res.status(200).json({
      message: 'Payment verification pending.',
      payment_status: order.payment_status,
      order
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ message: 'Server error verifying payment status: ' + error.message });
  }
};

// Simulation callback endpoint to complete payment (development sandbox only)
const simulatePaymentCompletion = async (req, res) => {
  const { order_id, status } = req.body;
  
  if (!order_id) {
    return res.status(400).json({ message: 'Order ID is required.' });
  }

  try {
    const newStatus = status === 'paid' ? 'paid' : 'failed';
    const result = await db.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
      [newStatus, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({
      message: `Order payment status updated to ${newStatus}`,
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return res.status(500).json({ message: 'Server error updating payment status.' });
  }
};

// Stripe Webhook Endpoint
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const isMockStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock');
    
    if (isMockStripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('Stripe Webhook Signature verification skipped.');
      event = req.body;
    } else {
      const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripeInstance.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    
    console.log(`Stripe Webhook: Checkout completed for Order ${orderId}`);
    
    if (orderId) {
      try {
        await db.query(
          "UPDATE orders SET payment_status = 'paid' WHERE id = $1",
          [orderId]
        );
      } catch (dbErr) {
        console.error('Failed to update order status in Stripe webhook:', dbErr.message);
      }
    }
  }

  return res.status(200).json({ received: true });
};

// Chapa Webhook Handler
const handleChapaWebhook = async (req, res) => {
  console.log('Chapa Webhook Received:', req.body);
  
  const signature = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];
  const chapaWebhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
  const isMockChapa = !process.env.CHAPA_SECRET_KEY || process.env.CHAPA_SECRET_KEY.includes('mock');

  try {
    if (chapaWebhookSecret && !isMockChapa) {
      const hash = crypto
        .createHmac('sha256', chapaWebhookSecret)
        .update(req.rawBody)
        .digest('hex');
      
      if (hash !== signature) {
        console.warn('Chapa Webhook Signature verification failed.');
        return res.status(401).send('Invalid signature');
      }
    } else {
      console.warn('Chapa Webhook Signature verification bypassed.');
    }

    const event = req.body;
    const txRef = event.tx_ref;
    const status = event.status; // 'success' or 'failed'
    
    if (txRef && status) {
      const paymentStatus = status === 'success' ? 'paid' : 'failed';
      await db.query(
        "UPDATE orders SET payment_status = $1 WHERE payment_intent_id = $2",
        [paymentStatus, txRef]
      );
      console.log(`Chapa Webhook updated transaction ${txRef} to ${paymentStatus}`);
    }
    
    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Chapa webhook error:', error);
    return res.status(500).send('Webhook Processing Failed');
  }
};

module.exports = {
  createOrder,
  getOrderById,
  verifyPayment,
  simulatePaymentCompletion,
  handleStripeWebhook,
  handleChapaWebhook
};
