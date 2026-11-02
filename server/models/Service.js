
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "Education",
                "Healthcare",
                "Food",
                "Environment",
                "Community",
                "Other",
            ],
            default: "Other",
        },

        location: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        featured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
