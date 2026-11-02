
const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
    {
        fullName: {
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
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            min: 16,
            max: 120,
        },

        city: {
            type: String,
            default: "",
        },

        interests: [{
            type: String,
            trim: true,
        }],

        availability: {
            type: String,
            default: "",
        },

        message: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Contacted",
                "Approved",
                "Rejected",
            ],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
