const express = require("express");
const {
  getRegions,
  getLiveFeed,
  addSentiment,
  getStats,
} = require("../controllers/sentimentController");

const router = express.Router();

router.get("/regions", getRegions);
router.get("/feed", getLiveFeed);
router.post("/add", addSentiment);
router.get("/stats", getStats); // ✅ New route

module.exports = router;
