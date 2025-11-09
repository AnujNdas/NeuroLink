import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiMail, FiUser } from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const handlechatclick = () => {
    navigate('/ai-lab')
  }
  return (
    <div className="w-full min-h-screen text-white bg-[#05060f]">

      {/* Hero Section */}
      <section className="flex flex-col items-center px-6 py-20 text-center">
        <h2 className="mb-4 text-4xl font-semibold md:text-6xl">
          Talk to <span className="text-cyan-400">NeuroLink AI</span> — 
          <br />Smarter, Faster, Better
        </h2>
        <p className="max-w-2xl text-gray-400">
          Your personal AI companion for conversations, analytics, decision-making,
          and automation — all in one space.
        </p>

        {/* Glowing AI Orb */}
        <div className="relative flex items-center justify-center w-56 h-56 mt-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl">
          <div className="flex items-center justify-center w-40 h-40 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-cyan-500/50">
            <FiSend className="text-4xl" />
          </div>
        </div>

        <button className="px-6 py-3 mt-10 transition rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105" onClick={handlechatclick}>
          Chat with NeuroLink
        </button>
      </section>

      {/* Capabilities Section */}
      <section className="px-6 py-16 md:px-12">
        <h3 className="text-3xl font-semibold text-center text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
          What NeuroLink Can Do
        </h3>
        <div className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Real-time AI Conversations",
            "Emotion & Sentiment Detection",
            "Text Summarization & Insights",
            "Multi-language Understanding",
            "Smart Auto-completions",
            "Data-driven Recommendations",
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 transition border bg-white/5 border-white/10 rounded-2xl backdrop-blur-lg hover:scale-105"
            >
              <h4 className="text-lg font-semibold text-cyan-400">{item}</h4>
              <p className="mt-2 text-sm text-gray-400">
                Experience unmatched intelligence and speed with NeuroLink AI.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-20 text-center md:px-12 bg-gradient-to-b from-transparent to-blue-900/10">
        <h3 className="text-3xl font-semibold">Get in Touch</h3>
        <p className="mt-2 text-gray-400">
          Got questions or need assistance? NeuroLink AI is here to help.
        </p>
        <form className="flex flex-col max-w-2xl gap-4 mx-auto mt-8">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex items-center w-full p-3 border bg-white/5 border-white/10 rounded-xl">
              <FiUser className="mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                className="w-full text-white bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center w-full p-3 border bg-white/5 border-white/10 rounded-xl">
              <FiMail className="mr-2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full text-white bg-transparent outline-none"
              />
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 mt-4 transition rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105">
            <FiSend /> Contact Us
          </button>
        </form>
      </section>
    </div>
  );
};

export default Dashboard;
