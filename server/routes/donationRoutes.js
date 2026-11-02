
const express = require("express");
const router = express.Router();

const {
    getRecentDonations,
    getAllDonations,
    getDonationById,
} = require("../controllers/donationController");

// Public route: recent verified donations for the website popup
router.get("/recent", getRecentDonations);

// Admin routes: protect with authentication before deployment
router.get("/", getAllDonations);
router.get("/:id", getDonationById);

module.exports = router;
