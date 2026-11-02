
const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment,
} = require("../controllers/paymentController");

// Create a Razorpay order
// POST /api/payments/create-order
router.post("/create-order", createOrder);

// Verify a Razorpay payment
// POST /api/payments/verify
router.post("/verify", verifyPayment);

module.exports = router;
