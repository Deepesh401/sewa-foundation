const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            default: "",
        },

        gallery: {
            type: [String],
            default: [],
        },

        products: {
            type: [
                {
                    id: Number,
                    name: { type: String, trim: true },
                    price: { type: Number, min: 0 },
                    donated: { type: Number, default: 0 },
                    goal: { type: Number, default: 100 },
                    image: { type: String, default: "" },
                },
            ],
            default: [],
        },

        targetAmount: {
            type: Number,
            required: true,
            min: 1,
        },

        raisedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        donorsCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        category: {
            type: String,
            default: "Community",
            trim: true,
        },

        hasTaxBenefit: {
            type: Boolean,
            default: true,
        },

        startDate: Date,
        endDate: Date,

        status: {
            type: String,
            default: "Active",
        },

        featured: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
