
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },

        donorEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        donorPhone: {
            type: String,
            default: "",
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: [1, "Payment amount must be at least ₹1"],
        },

        currency: {
            type: String,
            default: "INR",
        },

        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            default: null,
        },


        donation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation",
            default: null,
        },


        paymentGateway: {
            type: String,
            enum: ["Razorpay", "Other"],
            default: "Razorpay",
        },

        razorpayOrderId: {
            type: String,
            default: "",
        },

        razorpayPaymentId: {
            type: String,
            default: "",
        },

        razorpaySignature: {
            type: String,
            default: "",
            select: false,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Successful",
                "Failed",
                "Refunded",
            ],
            default: "Pending",
        },

        receiptNumber: {
            type: String,
            unique: true,
            sparse: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
