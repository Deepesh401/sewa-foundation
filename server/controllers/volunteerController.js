
const Volunteer = require("../models/Volunteer");

// GET /api/volunteers
// Admin: view all volunteer applications
const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: volunteers.length,
            volunteers,
        });
    } catch (error) {
        console.error("Get volunteers error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch volunteer applications.",
        });
    }
};

// GET /api/volunteers/:id
// Admin: view one application
const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer application not found.",
            });
        }

        res.status(200).json({ success: true, volunteer });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid volunteer ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch volunteer application.",
        });
    }
};

// POST /api/volunteers
// Public: submit a volunteer application
const createVolunteer = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            age,
            city,
            interests,
            availability,
            message,
        } = req.body;

        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof phone !== "string" ||
            !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and phone are required.",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const volunteer = await Volunteer.create({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            age: age === undefined || age === "" ? undefined : Number(age),
            city: typeof city === "string" ? city.trim() : "",
            interests: Array.isArray(interests) ? interests : [],
            availability:
                typeof availability === "string" ? availability.trim() : "",
            message: typeof message === "string" ? message.trim() : "",
        });

        res.status(201).json({
            success: true,
            message: "Volunteer application submitted successfully.",
            volunteerId: volunteer._id,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create volunteer error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit volunteer application.",
        });
    }
};

// PATCH /api/volunteers/:id/status
// Admin: update application status
const updateVolunteerStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            "Pending",
            "Contacted",
            "Approved",
            "Rejected",
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid volunteer status.",
            });
        }

        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer application not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Volunteer status updated successfully.",
            volunteer,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid volunteer ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update volunteer status.",
        });
    }
};

// DELETE /api/volunteers/:id
// Admin: delete an application
const deleteVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer application not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Volunteer application deleted successfully.",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid volunteer ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete volunteer application.",
        });
    }
};

module.exports = {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteerStatus,
    deleteVolunteer,
};
