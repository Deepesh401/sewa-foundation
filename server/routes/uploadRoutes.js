const express = require("express");
const router  = express.Router();
const { uploadImage, uploadMultiple } = require("../controllers/uploadController");

// POST /api/upload        — single image (base64 JSON body)
router.post("/", uploadImage);

// POST /api/upload/multiple — multiple images (base64 array JSON body)
router.post("/multiple", uploadMultiple);

module.exports = router;
