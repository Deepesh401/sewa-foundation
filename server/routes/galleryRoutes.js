
const express = require("express");
const router = express.Router();

const {
    getGalleryItems,
    getGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
} = require("../controllers/galleryController");

// Public routes
router.get("/", getGalleryItems);
router.get("/:id", getGalleryItemById);

// Admin routes: protect with authentication before deployment
router.post("/", createGalleryItem);
router.put("/:id", updateGalleryItem);
router.delete("/:id", deleteGalleryItem);

module.exports = router;
