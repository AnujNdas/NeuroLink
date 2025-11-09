const { runAIAnalysis , runAICodeGen } = require("../utils/aiEngine");
const Analysis = require("../models/Analysis");
const Sentiment = require("../models/Sentiment")

const analyzeText = async (req, res) => {
  try {
    const { inputText, userId, region } = req.body; // ✅ Accept region
    const result = await runAIAnalysis(inputText);
    const { summary, sentiment, suggestion, confidenceScore } = result.ai_analysis;

    // ✅ Save to Analysis Model
    const saved = await Analysis.create({
      user: userId || null,
      inputText,
      aiResult: result.ai_analysis,
      isMock: result.isMock,
      region: region || "Unknown",
    });

    // ✅ Save to Sentiment Model
    await Sentiment.create({
      text: inputText,
      sentiment,
      confidence: confidenceScore || null,
      user: userId || null,
      region: region || "Unknown", // ✅ Important for Radar Page
    });

    res.json({
      success: true,
      analysis: saved,
    });
  } catch (error) {
    console.error("🔥 AI Controller Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============== INSIGHTS ===============
const getInsights = async (req, res) => {
  try {
    // Fetch from both models
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    const sentimentsDB = await Sentiment.find().sort({ createdAt: -1 });

    // Combine both datasets
    const allData = [
      ...analyses.map((a) => ({
        text: a.inputText,
        sentiment: a.aiResult?.sentiment || "neutral",
        confidence: a.aiResult?.confidenceScore || null,
        category: a.category || "Uncategorized",
        createdAt: a.createdAt,
      })),
      ...sentimentsDB.map((s) => ({
        text: s.text,
        sentiment: s.sentiment || "neutral",
        confidence: null,
        category: "Uncategorized",
        createdAt: s.createdAt,
      })),
    ];

    const total = allData.length;
    const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
    const categories = {};
    const sentimentTrend = {};

    allData.forEach((item) => {
      const s = item.sentiment.toLowerCase();
      const cat = item.category || "Uncategorized";
      const date = new Date(item.createdAt).toISOString().split("T")[0];

      // Sentiment counts
      if (s === "positive") sentiments.Positive++;
      else if (s === "negative") sentiments.Negative++;
      else sentiments.Neutral++;

      // Category counts
      categories[cat] = (categories[cat] || 0) + 1;

      // Sentiment score trend (mock score if missing)
      const score =
        item.confidence ||
        (s === "positive" ? 0.9 : s === "negative" ? 0.2 : 0.5);

      sentimentTrend[date] = sentimentTrend[date]
        ? [...sentimentTrend[date], score]
        : [score];
    });

    // Convert trend data to average score per date
    const sentimentOverTime = Object.keys(sentimentTrend)
      .sort()
      .map((date) => ({
        date,
        score:
          sentimentTrend[date].reduce((a, b) => a + b, 0) /
          sentimentTrend[date].length,
      }));

    // Prepare categories array for chart
    const categoryArray = Object.keys(categories).map((name) => ({
      name,
      value: categories[name],
    }));

    // Recent 5 analyses
    const recentAnalyses = allData.slice(0, 5).map((a) => ({
      text: a.text,
      sentiment: a.sentiment,
    }));

    res.json({
      success: true,
      total,
      sentiments,
      categories: categoryArray,
      sentimentOverTime,
      recentAnalyses,
    });
  } catch (err) {
    console.error("🔥 Insights Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Generate Code Route
// ✅ Enhanced Generate Code Route
const generateCode = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { aiResult, provider, isMock } = await runAICodeGen(prompt);

    // 🧩 Flatten aiResult for frontend
    res.json({
      success: true,
      language: aiResult.language || "text",
      code: aiResult.code || aiResult.html || "",
      provider: provider || "unknown",
      isMock: isMock || false,
    });
  } catch (error) {
    console.error("⚠️ generateCode error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// ✅ Language detection helper
function detectLanguage(text = "") {
  if (/<[a-z!][\s\S]*>/i.test(text)) return "html";
  if (/def |import |print\(/.test(text)) return "python";
  if (/function|const|let|=>|console\.log/.test(text)) return "javascript";
  if (/#include|std::/.test(text)) return "cpp";
  if (/public class|System\.out\.println/.test(text)) return "java";
  if (/{|}|SELECT|INSERT|UPDATE/.test(text)) return "sql";
  if (/\bpackage\s+[\w.]+|fun\s+\w+/.test(text)) return "kotlin";
  if (/<?php|echo|->/.test(text)) return "php";
  return "text";
}



// ✅ Export both routes
module.exports = { analyzeText, getInsights , generateCode };
