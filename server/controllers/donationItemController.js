
const DonationItem = require("../models/DonationItem");

// GET /api/donation-items
// Get all available donation items for the public website
const getDonationItems = async (req, res) => {
    try {
        const items = await DonationItem.find({
            isAvailable: true,
        }).sort({ sortOrder: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });
    } catch (error) {
        console.error("Get donation items error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch donation items.",
        });
    }
};

// GET /api/donation-items/:id
// Get one available donation item
const getDonationItemById = async (req, res) => {
    try {
        const item = await DonationItem.findOne({
            _id: req.params.id,
            isAvailable: true,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Donation item not found.",
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
                message: "Invalid donation item ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch donation item.",
        });
    }
};

// POST /api/donation-items
// Admin: create a donation item
const createDonationItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            image,
            category,
            unit,
            isAvailable,
            isFeatured,
            sortOrder,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, description and price are required.",
            });
        }

        const itemPrice = Number(price);

        if (
            !Number.isSafeInteger(itemPrice) ||
            itemPrice < 1 ||
            itemPrice > 1000000
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be a whole number from ₹1 to ₹10,00,000.",
            });
        }

        const item = await DonationItem.create({
            name: name.trim(),
            description: description.trim(),
            price: itemPrice,
            image: image || "",
            category: category || "Other",
            unit: unit || "item",
            isAvailable: isAvailable ?? true,
            isFeatured: isFeatured ?? false,
            sortOrder: sortOrder ?? 0,
        });

        res.status(201).json({
            success: true,
            message: "Donation item created successfully.",
            item,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create donation item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create donation item.",
        });
    }
};

// PUT /api/donation-items/:id
// Admin: update a donation item
const updateDonationItem = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "description",
            "price",
            "image",
            "category",
            "unit",
            "isAvailable",
            "isFeatured",
            "sortOrder",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.name !== undefined) {
            if (typeof updates.name !== "string" || !updates.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty.",
                });
            }

            updates.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            if (
                typeof updates.description !== "string" ||
                !updates.description.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Description cannot be empty.",
                });
            }

            updates.description = updates.description.trim();
        }

        if (updates.price !== undefined) {
            updates.price = Number(updates.price);

            if (
                !Number.isSafeInteger(updates.price) ||
                updates.price < 1 ||
                updates.price > 1000000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a whole number from ₹1 to ₹10,00,000.",
                });
            }
        }

        const item = await DonationItem.findByIdAndUpdate(
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
                message: "Donation item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Donation item updated successfully.",
            item,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donation item ID.",
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
            message: "Failed to update donation item.",
        });
    }
};

// DELETE /api/donation-items/:id
// Admin: delete a donation item
const deleteDonationItem = async (req, res) => {
    try {
        const item = await DonationItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Donation item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Donation item deleted successfully.",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donation item ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete donation item.",
        });
    }
};

module.exports = {
    getDonationItems,
    getDonationItemById,
    createDonationItem,
    updateDonationItem,
    deleteDonationItem,
};
