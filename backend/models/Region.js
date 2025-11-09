// models/Region.js
const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral",
  },
  value: { type: Number, default: 0 }, // total sentiments counted
});

module.exports = mongoose.model("Region", regionSchema);
