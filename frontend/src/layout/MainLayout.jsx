// src/layout/MainLayout.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar when resizing back to desktop
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-x-hidden overflow-y-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 z-40 h-full transform transition-transform duration-300 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative"
        }`}
      >
        <Sidebar />
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden border-white/10 backdrop-blur-md">
          <button
            className="text-cyan-400 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-lg font-semibold tracking-wide">NeuroLink</h1>
        </div>

        {/* Optional Navbar (desktop only) */}
        {/* <Navbar /> */}

        {/* Scrollable Content Area */}
        <main className="flex-1 p-3 overflow-x-hidden overflow-y-auto sm:px-4 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
