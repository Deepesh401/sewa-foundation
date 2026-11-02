
const Service = require("../models/Service");

// GET all active services
const getServices = async (req, res) => {
    try {
        const services = await Service.find({ status: "Active" })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: services.length,
            services,
        });
    } catch (error) {
        console.error("Get services error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch services",
        });
    }
};

// GET one service by ID
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service || service.status !== "Active") {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        res.status(200).json({ success: true, service });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to fetch service",
        });
    }
};

// CREATE service (admin access required before deployment)
const createService = async (req, res) => {
    try {
        const { title, description, image, category, location, status, featured } =
            req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        const service = await Service.create({
            title,
            description,
            image,
            category,
            location,
            status: status || "Inactive",
            featured,
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            service,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create service",
        });
    }
};

// UPDATE service (admin access required before deployment)
const updateService = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "description",
            "image",
            "category",
            "location",
            "status",
            "featured",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID",
            });
        }

        res.status(400).json({
            success: false,
            message: error.message || "Failed to update service",
        });
    }
};

// DELETE service (admin access required before deployment)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete service",
        });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
};
