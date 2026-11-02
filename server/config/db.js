
const mongoose = require("mongoose");
const dns = require("node:dns");

// Use Google/Cloudflare public DNS to avoid issues with Node.js c-ares
// resolver on private/corporate networks that block or mishandle SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Disable buffering so queries fail promptly when MongoDB is disconnected
mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB Atlas connected successfully");
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
