require("dotenv").config(); // Load env vars FIRST

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for campaign images (cover + gallery)
const campaignStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         "sewaam/campaigns",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
        transformation: [{ width: 1200, height: 750, crop: "limit", quality: "auto" }],
    },
});

// Storage for product images
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         "sewaam/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
        transformation: [{ width: 600, height: 600, crop: "limit", quality: "auto" }],
    },
});

const uploadCampaignImage = multer({ storage: campaignStorage });
const uploadProductImage  = multer({ storage: productStorage });

module.exports = { cloudinary, uploadCampaignImage, uploadProductImage };
