const jwt      = require("jsonwebtoken");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");
const Donation = require("../models/Donation");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET || "sewaam_secret_key", { expiresIn: "30d" });

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: "All fields are required." });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ success: false, message: "Email already registered. Please login." });

        // Hash password here — no pre-save hook
        const hashed = bcrypt.hashSync(password, 10);

        const user  = await User.create({ name, email, password: hashed });
        const token = signToken(user._id);

        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Register error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email and password are required." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ success: false, message: "Invalid email or password." });

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Invalid email or password." });

        const token = signToken(user._id);
        return res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/my-donations
const getMyDonations = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("email");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const donations = await Donation.find({ email: user.email })
            .populate("campaign", "title image")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, donations });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { register, login, getMe, getMyDonations };
