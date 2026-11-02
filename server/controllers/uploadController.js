const { cloudinary } = require("../config/cloudinary");

// Upload a single image from base64 or multipart
// POST /api/upload  — body: { data: "data:image/...;base64,..." }  OR multipart file
const uploadImage = async (req, res) => {
    try {
        // Case 1: base64 data URI sent as JSON (from admin DirectImageUploader)
        if (req.body?.data) {
            const result = await cloudinary.uploader.upload(req.body.data, {
                folder: req.body.folder || "sewaam/campaigns",
                transformation: [{ width: 1200, height: 750, crop: "limit", quality: "auto" }],
            });
            return res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
        }

        // Case 2: multipart file upload (req.file set by multer middleware)
        if (req.file) {
            return res.status(200).json({ success: true, url: req.file.path, publicId: req.file.filename });
        }

        return res.status(400).json({ success: false, message: "No image data provided" });
    } catch (err) {
        console.error("Upload error:", err.message);
        return res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
};

// Upload multiple images (gallery)
// POST /api/upload/multiple — body: { images: ["data:image/...;base64,...", ...], folder: "..." }
const uploadMultiple = async (req, res) => {
    try {
        const { images = [], folder = "sewaam/campaigns" } = req.body;
        if (!images.length) return res.status(400).json({ success: false, message: "No images provided" });

        const uploads = await Promise.all(
            images.map((img) =>
                cloudinary.uploader.upload(img, {
                    folder,
                    transformation: [{ width: 1200, height: 750, crop: "limit", quality: "auto" }],
                })
            )
        );

        return res.status(200).json({
            success: true,
            urls: uploads.map((r) => r.secure_url),
        });
    } catch (err) {
        console.error("Multi-upload error:", err.message);
        return res.status(500).json({ success: false, message: err.message || "Upload failed" });
    }
};

module.exports = { uploadImage, uploadMultiple };
