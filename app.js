const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const Order = require('./model/order');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Handle creating an order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    if (![599, 499, 899].includes(parseInt(amount))) {
      return res.status(400).json({ error: "Invalid room price" });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
      notes,
    };
    const order = await razorpay.orders.create(options);
    const newOrder = new Order({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
    await newOrder.save();

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in creating order");
  }
});

// Handle payment verification
app.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const secret = razorpay.key_secret;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      // Find the order in MongoDB
      const order = await Order.findOne({ order_id: razorpay_order_id });
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        await order.save();  // Update order status in MongoDB
      }
      res.status(200).json({ status: "ok" });
      console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: "verification_failed" });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Error verifying payment" });
  }
});
app.get('/fetch-payment-details', async (req, res) => {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const order = await Order.findOne({ order_id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentDetails = {
      order_id: order.order_id,
      amount: order.amount / 100, // Convert back from paise to INR
      currency: order.currency,
      payment_id: order.payment_id || null,
      status: order.status,
    };

    res.json(paymentDetails);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Error fetching payment details" });
  }
});



// Static file route for frontend (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/payment-success", (req, res) => {
  res.sendFile(path.join(__dirname, "payment.html"));
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
