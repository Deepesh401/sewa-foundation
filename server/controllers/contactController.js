
const Contact = require("../models/Contact");

// GET /api/contact
// Admin: get all contact messages
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts,
        });
    } catch (error) {
        console.error("Get contacts error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch contact messages.",
        });
    }
};

// GET /api/contact/:id
// Admin: get one contact message
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        res.status(200).json({
            success: true,
            contact,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch contact message.",
        });
    }
};

// POST /api/contact
// Public: submit a contact form
const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof subject !== "string" ||
            !subject.trim() ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject and message are required.",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        if (name.trim().length > 100 ||
            email.trim().length > 254 ||
            subject.trim().length > 150 ||
            message.trim().length > 5000) {
            return res.status(400).json({
                success: false,
                message: "One or more fields exceed the allowed length.",
            });
        }

        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: typeof phone === "string" ? phone.trim() : "",
            subject: subject.trim(),
            message: message.trim(),
            status: "New",
        });

        res.status(201).json({
            success: true,
            message: "Your message has been submitted successfully.",
            contactId: contact._id,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create contact error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit your message.",
        });
    }
};

// PATCH /api/contact/:id/status
// Admin: update message status and optional admin notes
const updateContactStatus = async (req, res) => {
    try {
        const allowedStatuses = ["New", "In Progress", "Resolved"];
        const { status, adminNotes } = req.body;

        const updates = {};

        if (status !== undefined) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid contact status.",
                });
            }

            updates.status = status;
        }

        if (adminNotes !== undefined) {
            if (typeof adminNotes !== "string" || adminNotes.length > 3000) {
                return res.status(400).json({
                    success: false,
                    message: "Admin notes must be text under 3000 characters.",
                });
            }

            updates.adminNotes = adminNotes.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide a status or admin notes to update.",
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact message updated successfully.",
            contact,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update contact message.",
        });
    }
};

// DELETE /api/contact/:id
// Admin: delete a contact message
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact message deleted successfully.",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete contact message.",
        });
    }
};

module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContactStatus,
    deleteContact,
};
