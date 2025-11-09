import { useEffect, useState, useRef } from "react";
import { FiSearch, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 🟢 Load username & avatar
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedUsername}`;
      setAvatarUrl(avatar);
    }
  }, []);

  // 🟡 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔴 Handle Logout
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
      {/* 🔍 Search Bar */}
      <div className="flex items-center w-full max-w-md gap-3 px-3 py-2 bg-white/10 rounded-xl">
        <FiSearch className="text-gray-300" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full text-white placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* 🔔 Right Section */}
      <div className="relative flex items-center gap-4 text-gray-300" ref={dropdownRef}>
        <FiBell className="cursor-pointer hover:text-cyan-400" size={20} />

        {/* 👤 Profile Section */}
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <span className="font-medium text-white">{username || "Guest"}</span>
          <img
            src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=random"}
            alt="avatar"
            className="border rounded-full w-9 h-9 border-cyan-400"
          />
        </div>

        {/* ⬇️ Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 w-40 py-2 text-white border shadow-lg top-14 bg-white/10 backdrop-blur-md border-white/20 rounded-xl">
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-red-300 transition hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
