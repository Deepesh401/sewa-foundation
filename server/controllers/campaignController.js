
const Campaign = require("../models/Campaign");

// @desc    Get all active campaigns
// @route   GET /api/campaigns
// @access  Public
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: "Active" })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: campaigns.length,
            campaigns,
        });
    } catch (error) {
        console.error("Get campaigns error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
    }
};

// @desc    Get a single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        // Hide draft and cancelled campaigns from public visitors
        if (["Draft", "Cancelled"].includes(campaign.status)) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        return res.status(200).json({
            success: true,
            campaign,
        });
    } catch (error) {
        console.error("Get campaign error:", error.message);

        // Invalid MongoDB IDs should return 400, not 500
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid campaign ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch campaign",
        });
    }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Admin
const createCampaign = async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            image,
            gallery,
            products,
            targetAmount,
            category,
            startDate,
            endDate,
            status,
            featured,
            hasTaxBenefit,
        } = req.body;

        if (!title || !slug || !description || targetAmount == null) {
            return res.status(400).json({
                success: false,
                message: "Title, slug, description and target amount are required",
            });
        }

        const existingCampaign = await Campaign.findOne({ slug });

        if (existingCampaign) {
            return res.status(409).json({
                success: false,
                message: "A campaign with this slug already exists",
            });
        }

        const campaign = await Campaign.create({
            title,
            slug,
            description,
            image,
            gallery: Array.isArray(gallery) ? gallery : [],
            products: Array.isArray(products) ? products : [],
            targetAmount,
            category,
            startDate,
            endDate,
            status: status || "Draft",
            featured,
            hasTaxBenefit: hasTaxBenefit !== undefined ? hasTaxBenefit : true,
        });

        return res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        console.error("Create campaign error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create campaign",
        });
    }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Admin (protect with authentication before deployment)
const updateCampaign = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "slug",
            "description",
            "image",
            "gallery",
            "products",
            "targetAmount",
            "category",
            "startDate",
            "endDate",
            "status",
            "featured",
            "hasTaxBenefit",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Campaign updated successfully",
            campaign,
        });
    } catch (error) {
        console.error("Update campaign error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid campaign ID",
            });
        }

        if (error.name === "ValidationError" || error.code === 11000) {
            return res.status(400).json({
                success: false,
                message:
                    error.code === 11000
                        ? "A campaign with this slug already exists"
                        : error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update campaign",
        });
    }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Admin (protect with authentication before deployment)
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Campaign deleted successfully",
        });
    } catch (error) {
        console.error("Delete campaign error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid campaign ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete campaign",
        });
    }
};

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
};
