const express = require("express");
const { registerUser, verifyOTP, loginUser , updateRegion } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
// ✅ New API to update user region
router.put("/update-region/:userId", updateRegion);
module.exports = router;
