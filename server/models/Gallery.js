
const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        mediaType: {
            type: String,
            enum: ["Image", "Video"],
            required: true,
        },

        mediaUrl: {
            type: String,
            required: true,
        },

        thumbnailUrl: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "Campaign",
                "Event",
                "Food Distribution",
                "Education",
                "Healthcare",
                "Other",
            ],
            default: "Other",
        },

        eventDate: {
            type: Date,
        },

        featured: {
            type: Boolean,
            default: false,
        },

        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
