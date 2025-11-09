import { useState, useEffect } from "react";
import API from "../services/apiClient"; // ✅ Use shared axios instance
import {
  FiHome,
  FiCpu,
  FiBarChart2,
  FiSettings,
  FiMenu,
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import AdaptivePanel from "./AdaptivePanel";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const location = useLocation();
  const userId = sessionStorage.getItem("userId");

  // ✅ Collapse automatically on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch latest sentiment periodically using API client
  useEffect(() => {
    const fetchLatestSentiment = async () => {
      if (!userId) {
        console.warn("⚠️ No userId found in sessionStorage.");
        return;
      }

      try {
        const res = await API.get(`/ai/latest/${userId}`);
        const clean = res.data?.sentiment
          ? res.data.sentiment.toLowerCase()
          : "neutral";
        setSentiment(clean);
      } catch (error) {
        console.error("❌ Error fetching sentiment:", error);
      }
    };

    fetchLatestSentiment();
    const interval = setInterval(fetchLatestSentiment, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div
      className={`${
        collapsed ? "w-15" : "w-64"
      } h-screen bg-gradient-to-br from-[#0f1724] via-[#111827] to-[#0b1220]
      backdrop-blur-md border-r border-white/10 transition-all duration-300
      flex flex-col relative`}
    >
      {/* Scrollable Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <h1 className="text-2xl font-bold text-cyan-400">NeuroLink</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-cyan-400 focus:outline-none"
          >
            <FiMenu size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 pb-20 mt-4">
          {[
            { name: "Dashboard", icon: <FiHome />, path: "/" },
            { name: "AI Lab", icon: <FiCpu />, path: "/ai-lab" },
            { name: "Insights", icon: <FiBarChart2 />, path: "/insights" },
            { name: "Settings", icon: <FiSettings />, path: "/settings" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3 mx-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Panel */}
      <div className="sticky bottom-0 p-3 bg-[#0f1724]/80 backdrop-blur-md border-t border-white/10">
        <AdaptivePanel isCollapsed={collapsed} sentiment={sentiment} />
      </div>
    </div>
  );
};

export default Sidebar;
