
const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
    {
        siteName: {
            type: String,
            default: "Sewaam Foundation",
        },

        tagline: {
            type: String,
            default: "",
        },

        aboutText: {
            type: String,
            default: "",
        },

        logoUrl: {
            type: String,
            default: "",
        },

        heroImageUrl: {
            type: String,
            default: "",
        },

        heroSlides: {
            type: [
                {
                    image:       { type: String, default: "" },
                    title:       { type: String, default: "" },
                    subtitle:    { type: String, default: "" },
                    buttonLabel: { type: String, default: "Donate Now" },
                    buttonLink:  { type: String, default: "/donate" },
                    order:       { type: Number, default: 0 },
                },
            ],
            default: [],
        },

        contactEmail: {
            type: String,
            default: "",
        },

        contactPhone: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
        },

        socialLinks: {
            website: { type: String, default: "" },
            instagram: { type: String, default: "" },
            facebook: { type: String, default: "" },
            youtube: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "SiteSettings",
    siteSettingsSchema
);
