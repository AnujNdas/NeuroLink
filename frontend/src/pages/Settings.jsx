import { useState } from "react";
import { FiUser, FiSliders, FiBell, FiMonitor, FiMapPin } from "react-icons/fi";

const Settings = () => {
  const [theme, setTheme] = useState("dark");
  const [tone, setTone] = useState("balanced");
  const [notifications, setNotifications] = useState(true);
  const [region, setRegion] = useState("India");

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#0f1724] via-[#111827] to-[#0b1220] text-white space-y-10 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
            Settings
          </h1>
          <p className="mt-2 text-gray-400">
            Customize your profile, AI preferences, and system appearance.
          </p>
        </div>
      </div>

      {/* Profile Settings Card */}
      <div className="p-6 transition-shadow border shadow-lg bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <FiUser className="text-2xl text-cyan-400" />
          <h2 className="text-xl font-semibold">Profile Settings</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="text"
            placeholder="Full Name"
            className="p-3 text-white placeholder-gray-400 border bg-white/5 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="p-3 text-white placeholder-gray-400 border bg-white/5 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {/* Region Selector */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 mb-2 text-sm text-gray-300">
              <FiMapPin /> Region / Location
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-3 border bg-white/5 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>Asia</option>
              <option>Europe</option>
              <option>Africa</option>
              <option>South America</option>
            </select>
          </div>
        </div>

        <button className="px-6 py-2 mt-6 font-medium text-white transition-all rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-cyan-500">
          Save Changes
        </button>
      </div>

      {/* AI Preferences */}
      <div className="p-6 transition-shadow border shadow-lg bg-white/10 backdrop-blur-md border-white/20 rounded-2xl hover:shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <FiSliders className="text-2xl text-purple-400" />
          <h2 className="text-xl font-semibold">AI Preferences</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm text-gray-300">Response Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border bg-white/5 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="analytical">Analytical</option>
              <option value="friendly">Friendly</option>
              <option value="creative">Creative</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Future sections (Appearance, Notifications, Devices) can follow same design */}
    </div>
  );
};

export default Settings;
