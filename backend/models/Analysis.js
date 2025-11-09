const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inputText: { type: String, required: true },
    aiResult: {
      summary: String,
      sentiment: String,
      suggestion: String,
    },
    isMock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
