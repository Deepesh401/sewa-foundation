const express  = require("express");
const router   = express.Router();
const { register, login, getMe, getMyDonations } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login",    login);
router.get("/me",        protect, getMe);
router.get("/my-donations", protect, getMyDonations);

module.exports = router;
