
const Donation = require("../models/Donation");

// GET all successful donations for the public popup
// GET /api/donations/recent
const getRecentDonations = async (req, res) => {
    try {
        const donations = await Donation.find({
            paymentStatus: "Successful",
            isAnonymous: false,
        })
            .select("donorName amount campaign createdAt")
            .populate("campaign", "title")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const publicDonations = donations.map((donation) => {
            const firstName = donation.donorName.trim().split(/\s+/)[0];

            // Display first name and last initial only
            return {
                donorName: `${firstName} ${donation.donorName.trim().split(/\s+/).length > 1
                    ? donation.donorName.trim().split(/\s+/).slice(-1)[0][0] + "."
                    : ""}`.trim(),
                amount: donation.amount,
                campaignName: donation.campaign?.title || "a good cause",
                createdAt: donation.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            count: publicDonations.length,
            donations: publicDonations,
        });
    } catch (error) {
        console.error("Get recent donations error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent donations",
        });
    }
};

// GET donation records for the admin dashboard
// GET /api/donations
// Protect this endpoint with admin authentication before deployment.
const getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate("campaign", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: donations.length,
            donations,
        });
    } catch (error) {
        console.error("Get all donations error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch donations",
        });
    }
};

// GET a donation by ID
// GET /api/donations/:id
// Protect this endpoint with admin authentication before deployment.
const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate("campaign", "title");

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: "Donation not found",
            });
        }

        res.status(200).json({
            success: true,
            donation,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donation ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch donation",
        });
    }
};

module.exports = {
    getRecentDonations,
    getAllDonations,
    getDonationById,
};
