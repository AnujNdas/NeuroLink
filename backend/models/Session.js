const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, default: "New AI Session" },
    analyses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Analysis" }],
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
