
const Gallery = require("../models/Gallery");

// GET /api/gallery
// Public: get published gallery items
const getGalleryItems = async (req, res) => {
    try {
        const items = await Gallery.find({
            isPublished: true,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });
    } catch (error) {
        console.error("Get gallery error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery items.",
        });
    }
};

// GET /api/gallery/:id
// Public: get one published gallery item
const getGalleryItemById = async (req, res) => {
    try {
        const item = await Gallery.findOne({
            _id: req.params.id,
            isPublished: true,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found.",
            });
        }

        res.status(200).json({
            success: true,
            item,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery item.",
        });
    }
};

// POST /api/gallery
// Admin: create a gallery item
const createGalleryItem = async (req, res) => {
    try {
        const {
            title,
            description,
            mediaType,
            mediaUrl,
            thumbnailUrl,
            category,
            eventDate,
            featured,
            isPublished,
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof mediaUrl !== "string" ||
            !mediaUrl.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and media URL are required.",
            });
        }

        if (!["Image", "Video"].includes(mediaType)) {
            return res.status(400).json({
                success: false,
                message: "Media type must be Image or Video.",
            });
        }

        const item = await Gallery.create({
            title: title.trim(),
            description:
                typeof description === "string" ? description.trim() : "",
            mediaType,
            mediaUrl: mediaUrl.trim(),
            thumbnailUrl:
                typeof thumbnailUrl === "string" ? thumbnailUrl.trim() : "",
            category: category || "Other",
            eventDate: eventDate || null,
            featured: featured ?? false,
            isPublished: isPublished ?? false,
        });

        res.status(201).json({
            success: true,
            message: "Gallery item created successfully.",
            item,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create gallery item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create gallery item.",
        });
    }
};

// PUT /api/gallery/:id
// Admin: update a gallery item
const updateGalleryItem = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "description",
            "mediaType",
            "mediaUrl",
            "thumbnailUrl",
            "category",
            "eventDate",
            "featured",
            "isPublished",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.title !== undefined) {
            if (typeof updates.title !== "string" || !updates.title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty.",
                });
            }

            updates.title = updates.title.trim();
        }

        if (updates.mediaUrl !== undefined) {
            if (
                typeof updates.mediaUrl !== "string" ||
                !updates.mediaUrl.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Media URL cannot be empty.",
                });
            }

            updates.mediaUrl = updates.mediaUrl.trim();
        }

        const item = await Gallery.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Gallery item updated successfully.",
            item,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update gallery item.",
        });
    }
};

// DELETE /api/gallery/:id
// Admin: delete a gallery item
const deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Gallery item deleted successfully.",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery item ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete gallery item.",
        });
    }
};

module.exports = {
    getGalleryItems,
    getGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
};
