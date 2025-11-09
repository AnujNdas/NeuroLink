const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const testPerplexityRoute = require("./routes/testPerplexity");
const sentimentRoutes = require("./routes/sentimentRoutes");

connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "https://neurolink-yftg.onrender.com", // ✅ your deployed frontend
      "http://localhost:5173",              // ✅ local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", testPerplexityRoute);
app.use("/api/sentiment", sentimentRoutes);

app.get("/", (req, res) => {
  res.send("NeuroLink.AI API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
