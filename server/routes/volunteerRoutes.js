
const express = require("express");
const router = express.Router();

const {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteerStatus,
    deleteVolunteer,
} = require("../controllers/volunteerController");

// Public: submit an application
router.post("/", createVolunteer);

// Admin: protect these routes with authentication before deployment
router.get("/", getAllVolunteers);
router.get("/:id", getVolunteerById);
router.patch("/:id/status", updateVolunteerStatus);
router.delete("/:id", deleteVolunteer);

module.exports = router;
