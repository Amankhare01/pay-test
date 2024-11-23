const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
app.use(express.static(path.join(__dirname)));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const readData = () => {
  if (fs.existsSync("orders.json")) {
    const data = fs.readFileSync("orders.json");
    return JSON.parse(data);
  }
  return [];
};

const writeData = (data) => {
  fs.writeFileSync("orders.json", JSON.stringify(data, null, 2));
};

if (!fs.existsSync("orders.json")) {
  writeData([]);
}

// app.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency, receipt, notes } = req.body;

//     const options = {
//       amount: amount * 100,
//       currency,
//       receipt,
//       notes,
//     };
//     const order = await razorpay.orders.create(options);

//     const orders = readData();
//     orders.push({
//       order_id: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       receipt: order.receipt,
//       status: "created",
//     });
//     writeData(orders);

//     res.json(order);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error in Creating order");
//   }
// });

app.post("/verify-payment", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const secret = razorpay.key_secret;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    );
    if (isValidSignature) {
      const orders = readData();

      const order = orders.find((o) => o.order_id === razorpay_order_id);

      if (order) {
        order.status = "paid";
        order.payment_id = razorpay_payment_id;
        writeData(orders);
      }
      res.status(200).json({ status: "ok" });
      console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: "verification_failed" });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error verifying payment" });
  }
});

app.get("/payment-success", (req, res) => {
  res.sendFile(path.join(__dirname, "pay.html"));
});

const validAmounts = [599, 499, 899];

app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    if (!validAmounts.includes(parseInt(amount))) {
      return res.status(400).json({ error: "Invalid room price" });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
      notes,
    };
    const order = await razorpay.orders.create(options);

    const orders = readData();
    orders.push({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
    });
    writeData(orders);

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Creating order");
  }
});