// models/Sentiment.js
const mongoose = require("mongoose");

const sentimentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    required: true,
  },
  region: String, 
  createdAt: { type: Date, default: Date.now },
});

const Sentiment = mongoose.model("Sentiment", sentimentSchema);

module.exports = Sentiment;

