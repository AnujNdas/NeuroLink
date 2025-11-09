// src/components/AdaptivePanel.jsx
import { useState, useEffect } from "react";
import { FiSun, FiVolume2, FiSmile } from "react-icons/fi";

const AdaptivePanel = ({ isCollapsed, sentiment }) => {
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(50);
  const [emotion, setEmotion] = useState("Calm 😌");
  useEffect(() => {
  console.log("🎯 Current Sentiment:", sentiment);
}, [sentiment]);

  // ✅ Update UI based on new sentiment value
  useEffect(() => {
    if (!sentiment) return;

    const mood = sentiment.trim().toLowerCase();

    if (mood === "positive") {
      setBrightness(120);
      setVolume(60);
      setEmotion("Happy 😊");
    } else if (mood === "negative") {
      setBrightness(80);
      setVolume(40);
      setEmotion("Sad 😔");
    } else if (mood === "angry") {
      setBrightness(90);
      setVolume(70);
      setEmotion("Angry 😡");
    } else if (mood === "neutral") {
      setBrightness(100);
      setVolume(80);
      setEmotion("Excited 🤩");
    } else if (mood === "stressed") {
      setBrightness(90);
      setVolume(30);
      setEmotion("Stressed 😥");
    } else if (mood === "tired") {
      setBrightness(70);
      setVolume(20);
      setEmotion("Tired 😴");
    } else {
      setBrightness(100);
      setVolume(50);
      setEmotion("Calm 😌");
    }
  }, [sentiment]); // ✅ Runs whenever `sentiment` changes

  // ✅ Apply brightness globally
  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  return (
    <div
      className={`flex flex-col ${
        isCollapsed
          ? "items-center gap-4"
          : "gap-3 p-3 border-t border-white/10"
      }`}
    >
      {!isCollapsed ? (
        <>
          <h2 className="text-sm font-semibold text-cyan-400">
            Adaptive Controls
          </h2>

          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="flex items-center gap-1">
                <FiSun className="text-cyan-300" /> Brightness
              </span>
              <span>{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-1 rounded cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="flex items-center gap-1">
                <FiVolume2 className="text-purple-300" /> Sound
              </span>
              <span>{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1 rounded cursor-pointer accent-purple-400"
            />
          </div>

          {/* Emotion */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="flex items-center gap-1">
              <FiSmile className="text-yellow-300" /> Mood
            </span>
            <span className="text-cyan-300">{emotion}</span>
          </div>
        </>
      ) : (
        <>
          {/* Collapsed View */}
          <button
            title={`Brightness: ${brightness}%`}
            onClick={() => setBrightness((prev) => (prev >= 150 ? 50 : prev + 25))}
            className="p-2 transition rounded-lg hover:bg-white/10"
          >
            <FiSun className="text-xl text-cyan-300" />
          </button>

          <button
            title={`Volume: ${volume}%`}
            onClick={() => setVolume((prev) => (prev >= 100 ? 0 : prev + 10))}
            className="p-2 transition rounded-lg hover:bg-white/10"
          >
            <FiVolume2 className="text-xl text-purple-300" />
          </button>

          <button
            title={`Mood: ${emotion}`}
            className="p-2 transition rounded-lg hover:bg-white/10"
          >
            <FiSmile className="text-xl text-yellow-300" />
          </button>
        </>
      )}
    </div>
  );
};

export default AdaptivePanel;
