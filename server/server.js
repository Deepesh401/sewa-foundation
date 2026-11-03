
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import routes FIRST
const campaignRoutes     = require("./routes/campaignRoutes");
const serviceRoutes      = require("./routes/serviceRoutes");
const donationRoutes     = require("./routes/donationRoutes");
const paymentRoutes      = require("./routes/paymentRoutes");
const donationItemRoutes = require("./routes/donationItemRoutes");
const galleryRoutes      = require("./routes/galleryRoutes");
const volunteerRoutes    = require("./routes/volunteerRoutes");
const contactRoutes      = require("./routes/contactRoutes");
const uploadRoutes       = require("./routes/uploadRoutes");
const heroSliderRoutes   = require("./routes/heroSliderRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/campaigns",     campaignRoutes);
app.use("/api/services",      serviceRoutes);
app.use("/api/donations",     donationRoutes);
app.use("/api/payments",      paymentRoutes);
app.use("/api/donation-items",donationItemRoutes);
app.use("/api/gallery",       galleryRoutes);
app.use("/api/volunteers",    volunteerRoutes);
app.use("/api/contact",       contactRoutes);
app.use("/api/upload",        uploadRoutes);
app.use("/api/hero-slides",   heroSliderRoutes);

// Test API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Sewaam Foundation API is running",
    });
});

// Start server after connecting to MongoDB
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();


