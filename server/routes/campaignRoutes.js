
const express = require("express");

const router = express.Router();

const {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
} = require("../controllers/campaignController");

// Public routes
router.get("/", getCampaigns);
router.get("/:id", getCampaignById);

// Admin routes
// IMPORTANT: Add admin authentication middleware before deployment.
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

module.exports = router;
