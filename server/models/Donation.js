
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: [1, "Donation must be at least ₹1"],
        },

        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            default: null,
        },

        paymentMethod: {
            type: String,
            enum: ["Razorpay", "Other"],
            default: "Razorpay",
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Successful",
                "Failed",
                "Refunded",
            ],
            default: "Pending",
        },

        paymentOrderId: {
            type: String,
            default: "",
        },

        paymentId: {
            type: String,
            default: "",
        },

        receiptNumber: {
            type: String,
            unique: true,
            sparse: true,
        },

        message: {
            type: String,
            default: "",
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
