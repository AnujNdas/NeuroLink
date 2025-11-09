const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String }, // temporary OTP for email verification
    otpExpires: { type: Date },

    // ✅ New field for sentiment radar / AI insights region
    region: {
      type: String,
      default: "Unknown", // You can set a default or leave it empty
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
