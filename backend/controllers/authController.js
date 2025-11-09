const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Region = require("../models/Region");
const { sendOTP } = require("../config/brevo");
// 🌍 Region coordinates (you can expand this list)
const regionCoordinates = {
  Europe: { lat: 54.5260, lng: 15.2551 },
  Asia: { lat: 34.0479, lng: 100.6197 },
  America: { lat: 37.0902, lng: -95.7129 },
  Africa: { lat: 8.7832, lng: 34.5085 },
  Australia: { lat: -25.2744, lng: 133.7751 },
};

// ✅ Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password, region } = req.body;

    let user = await User.findOne({ email });

    if (user && user.verified) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        username,
        email,
        password: hashedPassword,
        verified: false,
        region: region || "Unknown",
      });
    } else {
      user.region = region || user.region || "Unknown";
    }

    // ✅ Save region in Region model as well
    if (region && regionCoordinates[region]) {
      await Region.findOneAndUpdate(
        { name: region },
        { 
          name: region,
          lat: regionCoordinates[region].lat,
          lng: regionCoordinates[region].lng 
        },
        { upsert: true, new: true }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpires)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });
    if (!user.verified)
      return res.status(400).json({ success: false, message: "Please verify your email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id , username : user.username , region : user.region }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { username: user.username, email: user.email , region : user.region , id: user._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
// ✅ Update Region from Settings Page
const updateRegion = async (req, res) => {
  try {
    const { userId } = req.params;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ success: false, message: "Region is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { region }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Save/Update region in Region model
    if (regionCoordinates[region]) {
      await Region.findOneAndUpdate(
        { name: region },
        {
          name: region,
          lat: regionCoordinates[region].lat,
          lng: regionCoordinates[region].lng,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: "Region updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Region Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { registerUser, verifyOTP, loginUser , updateRegion };
