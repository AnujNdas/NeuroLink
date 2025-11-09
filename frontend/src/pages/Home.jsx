import { useState } from "react";
import axios from "axios";

const Home = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/analyze", { text });
      setResult(res.data.result);
    } catch (err) {
      console.error(err);
      setResult({ error: "AI analysis failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-poppins relative overflow-hidden">

      {/* Animated gradient orb background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-lg">
        NeuroLink<span className="text-cyan-300">.AI</span>
      </h1>

      {/* Glass Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500">

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your thoughts here..."
          className="w-full h-40 p-4 bg-transparent text-white border border-white/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder:text-gray-400 shadow-inner shadow-cyan-500/10 transition-all"
        />

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-600 hover:to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze with NeuroLink.AI"}
        </button>

        {/* Result Display */}
        {result && (
          <div className="mt-8 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner shadow-cyan-500/10">
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">AI Analysis Result</h2>
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {typeof result === "object" ? JSON.stringify(result, null, 2) : result}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-sm text-gray-400">
        © {new Date().getFullYear()} <span className="text-cyan-400">NeuroLink.AI</span> — Decode Human Thought.
      </p>
    </div>
  );
};

export default Home;
