
const mongoose = require("mongoose");

const donationItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Donation item name is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, "Item price is required"],
            min: [1, "Price must be greater than zero"],
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "Food",
                "Healthcare",
                "Animal Welfare",
                "Education",
                "Clothing",
                "Other",
            ],
            default: "Other",
        },

        unit: {
            type: String,
            default: "item",
            trim: true,
            // Examples: kg, kit, month, item
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("DonationItem", donationItemSchema);
