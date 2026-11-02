
const express = require("express");
const router = express.Router();

const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} = require("../controllers/serviceController");

router.get("/", getServices);
router.get("/:id", getServiceById);

// Add admin authentication middleware before deployment
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
