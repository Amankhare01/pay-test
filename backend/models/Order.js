// models/order.js
import mongoose from "mongoose";

// Order schema definition
const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  contact:{type: String,},
  status: { type: String,},
  payment_id: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create the model based on the schema
const Order = mongoose.model('Order', orderSchema);
export default Order
