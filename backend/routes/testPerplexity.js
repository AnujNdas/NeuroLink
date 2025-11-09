// routes/testPerplexity.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/test-perplexity", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-small-online", // or sonar-medium-online
        messages: [
          { role: "system", content: "You are NeuroLink AI assistant." },
          { role: "user", content: "Hello, Perplexity! Can you hear me?" },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // 👈 your Perplexity key here
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Perplexity API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
