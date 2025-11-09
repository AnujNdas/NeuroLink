const express = require("express");
const { analyzeText , getInsights , generateCode } = require("../controllers/aiController");
const Analysis = require("../models/Analysis");
const router = express.Router();

router.post("/analyze", analyzeText);
router.get("/insights", getInsights); // ✅ new route
router.post("/code", generateCode); // ✅ new route
// ✅ Get latest sentiment for a user
router.get("/latest/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const latest = await Analysis.findOne({ user: userId }).sort({ createdAt: -1 });
    // console.log("🧠 Latest Analysis:", latest);

    if (!latest) {
      return res.json({ success: true, sentiment: "neutral" });
    }

    // ✅ Unified sentiment extraction
    let sentiment =
      (latest.aiResult && latest.aiResult.sentiment) ||
      latest.sentiment ||
      "neutral";


    res.json({ success: true, sentiment });
  } catch (error) {
    console.error("❌ Error in /latest:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
