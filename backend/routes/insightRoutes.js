import express from "express";
import Sentiment from "../models/Sentiment.js";

const router = express.Router();

router.get("/sentiments", async (req, res) => {
  try {
    const sentimentStats = await Sentiment.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } },
    ]);

    // Convert aggregation result to chart-friendly format
    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    sentimentStats.forEach((s) => {
      stats[s._id] = s.count;
    });

    res.json(stats);
  } catch (err) {
    console.error("Error fetching sentiment stats:", err);
    res.status(500).json({ error: "Failed to fetch sentiment data" });
  }
});

export default router;
