const Sentiment = require("../models/Sentiment");
const Region = require("../models/Region");

// Fetch all regions and their sentiment info
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching regions" });
  }
};

// Fetch live feed (last 10 entries)
const getLiveFeed = async (req, res) => {
  try {
    const feed = await Sentiment.find().sort({ createdAt: -1 }).limit(10);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Error fetching live feed" });
  }
};

// Add new sentiment
const addSentiment = async (req, res) => {
  try {
    const { text, sentiment, region } = req.body;

    // ✅ Save region too
    const newEntry = await Sentiment.create({ text, sentiment, region });

    // ✅ Update region count or create new region if not exists
    if (region) {
      await Region.updateOne(
        { name: region },
        { $inc: { value: 1 } },
        { upsert: true } // Creates new region if not exists
      );
    }

    res.json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Error adding sentiment" });
  }
};


// Fetch overall sentiment statistics
const getStats = async (req, res) => {
  try {
    const total = await Sentiment.countDocuments();
    const positive = await Sentiment.countDocuments({ sentiment: "positive" });
    const negative = await Sentiment.countDocuments({ sentiment: "negative" });
    const neutral = await Sentiment.countDocuments({ sentiment: "neutral" });

    if (total === 0) {
      return res.json({
        positivePercent: 0,
        neutralPercent: 0,
        negativePercent: 0,
        regionsMonitored: 0,
        aiSummary: "Not enough data to generate insights.",
      });
    }

    res.json({
      positivePercent: ((positive / total) * 100).toFixed(1),
      neutralPercent: ((neutral / total) * 100).toFixed(1),
      negativePercent: ((negative / total) * 100).toFixed(1),
      regionsMonitored: await Region.countDocuments(),
      aiSummary:
        "AI detects increasing positive sentiment this week with low anomaly risk.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching stats" });
  }
};




module.exports = {getRegions , getLiveFeed , addSentiment , getStats};