const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Donation = require("../models/Donation");
const Payment = require("../models/Payment");
const Campaign = require("../models/Campaign");

const razorpay = new Razorpay({
    key_id:    process.env.RAZORPAY_KEY_ID     || "rzp_test_Tt2ZsTQ6a358Z2",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "J81lBGU1GHAB7T07n6VcGfGS",
});

// POST /api/payments/create-order
const createOrder = async (req, res) => {
    try {
        const { donorName, email, phone, amount, campaignId, message, isAnonymous } = req.body;

        // Validate required fields
        if (!donorName || !String(donorName).trim()) {
            return res.status(400).json({ success: false, message: "Donor name is required." });
        }
        if (!email || !String(email).trim()) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const donationAmount = Number(amount);
        if (!donationAmount || donationAmount < 1) {
            return res.status(400).json({ success: false, message: "Amount must be at least ₹1." });
        }

        // Only use campaignId if it's a valid MongoDB ObjectId
        const validCampaignId = campaignId && mongoose.Types.ObjectId.isValid(String(campaignId))
            ? campaignId : null;
        // 1. Create Donation record
        const donation = await Donation.create({
            donorName: String(donorName).trim(),
            email:     String(email).trim().toLowerCase(),
            phone:     phone ? String(phone).trim() : "",
            amount:    donationAmount,
            campaign:  validCampaignId,
            message:   message ? String(message).trim() : "",
            isAnonymous: Boolean(isAnonymous),
            paymentStatus: "Pending",
        });

        // 2. Create Razorpay order
        const receipt = `rcpt_${donation._id.toString().slice(-14)}`;
        const order = await razorpay.orders.create({
            amount:   donationAmount * 100, // paise
            currency: "INR",
            receipt,
            notes: {
                donationId: donation._id.toString(),
                campaignId: validCampaignId || "general",
            },
        });

        // 3. Create Payment record (use correct field names from Payment model)
        await Payment.create({
            donorName:       String(donorName).trim(),
            donorEmail:      String(email).trim().toLowerCase(),
            donorPhone:      phone ? String(phone).trim() : "",
            amount:          donationAmount,
            campaign:        validCampaignId,
            donation:        donation._id,
            razorpayOrderId: order.id,
            status:          "Pending",           // valid enum value
            message:         message ? String(message).trim() : "",
            isAnonymous:     Boolean(isAnonymous),
        });

        return res.status(200).json({
            success: true,
            order,                               // contains order.id, order.amount, order.currency
            donationId: donation._id,
            keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_Tt2ZsTQ6a358Z2",
        });

    } catch (error) {
        console.error("Create order error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order.",
        });
    }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification details are missing." });
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "J81lBGU1GHAB7T07n6VcGfGS";
        const generated = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generated !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature." });
        }

        // Update Payment record
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = "Successful";
            await payment.save();

            // Update Donation record
            const donation = await Donation.findById(payment.donation);
            if (donation) {
                donation.paymentStatus = "Successful";
                donation.paymentId      = razorpay_payment_id;
                donation.paymentOrderId = razorpay_order_id;
                await donation.save();

                // Update campaign stats — try by ObjectId first, then by slug from message
                let campaignUpdated = false;

                if (donation.campaign) {
                    const updated = await Campaign.findByIdAndUpdate(donation.campaign, {
                        $inc: { raisedAmount: donation.amount, donorsCount: 1 }
                    });
                    if (updated) campaignUpdated = true;
                }

                // Fallback: extract campaign slug/title from payment message and find by slug
                if (!campaignUpdated && donation.message) {
                    // message format: "Campaign Title - ..." or just "Campaign Title"
                    const titlePart = donation.message.split(" - ")[0].trim();
                    if (titlePart) {
                        const slugGuess = titlePart.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        await Campaign.findOneAndUpdate(
                            { $or: [{ slug: slugGuess }, { title: { $regex: new RegExp(`^${titlePart}$`, "i") } }] },
                            { $inc: { raisedAmount: donation.amount, donorsCount: 1 } }
                        );
                    }
                }
            }
        }

        return res.status(200).json({ success: true, message: "Payment verified successfully." });

    } catch (error) {
        console.error("Verify payment error:", error.message);
        return res.status(500).json({ success: false, message: "Payment verification failed." });
    }
};

// GET /api/payments/:id
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate("donation");
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found." });
        }
        return res.status(200).json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch payment." });
    }
};

module.exports = { createOrder, verifyPayment, getPaymentById };
