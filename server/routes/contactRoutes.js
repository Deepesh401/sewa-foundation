
const express = require("express");
const router = express.Router();

const {
    getAllContacts,
    getContactById,
    createContact,
    updateContactStatus,
    deleteContact,
} = require("../controllers/contactController");

// Public: submit a contact form
router.post("/", createContact);

// Admin routes: add authentication before deployment
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.patch("/:id/status", updateContactStatus);
router.delete("/:id", deleteContact);

module.exports = router;
