
const express = require("express");
const router = express.Router();

const {
    getDonationItems,
    getDonationItemById,
    createDonationItem,
    updateDonationItem,
    deleteDonationItem,
} = require("../controllers/donationItemController");

// Public routes
router.get("/", getDonationItems);
router.get("/:id", getDonationItemById);

// Admin routes — authentication middleware must be added
// before deployment.
router.post("/", createDonationItem);
router.put("/:id", updateDonationItem);
router.delete("/:id", deleteDonationItem);

module.exports = router;
