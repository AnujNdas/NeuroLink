// src/pages/AiLab.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FiCpu,
  FiActivity,
  FiCode,
  FiMic,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";

import { Bot, User, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  {
    id: "text-analyzer",
    name: "Text Analyzer",
    icon: <FiCpu className="text-lg" />,
    placeholder: "Type text to analyze, summarize or ask questions...",
  },
  {
    id: "emotion-detector",
    name: "Emotion Detector",
    icon: <FiActivity className="text-lg" />,
    placeholder: "Send a message to detect emotion / sentiment...",
  },
  {
    id: "code-generator",
    name: "Code Generator",
    icon: <FiCode className="text-lg" />,
    placeholder: "Describe what you want and get a structured prompt or code...",
  },
];

const AiLab = () => {
  // session-derived
  const username = sessionStorage.getItem("username")
  const [copied, setCopied] = useState(false);
  const sessionToken = sessionStorage.getItem("sessionToken") || null;
  const userId = sessionStorage.getItem("userId") || null;
  const sessionRegion =
    sessionStorage.getItem("region") || sessionUser?.region || "Unknown";

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState({
    "text-analyzer": [],
    "emotion-detector": [],
    "prompt-generator": [],
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Initialize speech recognition if available
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition || null;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      addUserMessage(transcript);
      runAnalysis(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto scroll on chats change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight + 200;
  }, [chats, activeTab, isProcessing]);

  const addUserMessage = (text) => {
    if (!text) return;
    setChats((prev) => {
      const next = { ...prev };
      next[activeTab] = [
        ...(next[activeTab] || []),
        { sender: "user", text, ts: Date.now() },
      ];
      return next;
    });
  };

  const addAiMessage = (text) => {
    setChats((prev) => {
      const next = { ...prev };
      next[activeTab] = [
        ...(next[activeTab] || []),
        { sender: "ai", text, ts: Date.now() },
      ];
      return next;
    });
  };

  // Main analysis runner — routes by activeTab
  const runAnalysis = async (textToAnalyze) => {
    const text = (textToAnalyze ?? input ?? "").trim();
    if (!text) return;

    // show user message in chat (if not voice autopushed)
    if (!textToAnalyze) addUserMessage(text);

    setIsProcessing(true);
    try {
      const basePayload = { region: sessionRegion, userId };
      // Route selection
      let endpoint = "https://neurolink-backend.onrender.com/api/ai/analyze";
      let payload = { ...basePayload, inputText: text };

      if (activeTab === "emotion-detector") {
        endpoint = "https://neurolink-backend.onrender.com/api/ai/insights"; // your insights route expects a GET normally, but keeping POST here per your backend design
        payload = { ...basePayload, inputText: text };
      } else if (activeTab === "code-generator") {
        endpoint = "https://neurolink-backend.onrender.com/api/ai/code";
        // For code/prompt generation some backends expect "prompt" not "inputText"
        payload = { ...basePayload, prompt: text };
      }

      // Send request (assumes frontend is served such that relative path works,
      // otherwise change to full URL like https://neurolink-backend.onrender.com/api/ai/code)
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("AI API error:", res.status, errText);
        addAiMessage(`⚠️ Server error: ${res.status}`);
        return;
      }

      const data = await res.json();

      // Normalize possible shapes
      const aiResult =
        data.analysis?.aiResult ||
        data.aiResult ||
        data.result ||
        data.aiResult?.aiResult ||
        data ||
        {};

      // Build reply depending on tab
      let reply = "";

      if (activeTab === "text-analyzer") {
        if (aiResult.summary) reply += `### 🧠 Summary\n${aiResult.summary}\n\n`;
        if (aiResult.suggestion) {
          reply += `### ✅ Suggestions\n`;
          reply += Array.isArray(aiResult.suggestion)
            ? aiResult.suggestion.map((s) => `- ${s}`).join("\n")
            : aiResult.suggestion;
          reply += "\n\n";
        }
      } else if (activeTab === "emotion-detector") {
        if (aiResult.summary) reply += `### 🧠 Summary\n${aiResult.summary}\n\n`;
        const emotion = aiResult.sentiment || aiResult.emotion || "neutral";
        const emotionMap = {
          positive: "😊 Positive / Happy",
          negative: "😔 Negative / Sad",
          neutral: "😐 Neutral",
          angry: "😡 Angry",
          fear: "😨 Fear / Anxiety",
          surprise: "😲 Surprised",
        };
        reply += `### ❤️ Emotion\n${
          emotionMap[emotion.toLowerCase()] || emotion
        }\n\n`;
      } else if (activeTab === "prompt-generator") {
        // preferred backend keys: language, html, code, prompt
        const language = (aiResult.language || "").toString().toLowerCase();
        const html = aiResult.html?.toString?.() ?? "";
        const code = aiResult.code?.toString?.() ?? "";
        const promptOut = aiResult.prompt?.toString?.() ?? "";

        if (html && html.trim()) {
          // Use HTML code block
          reply += `🌐 **Generated HTML**\n\`\`\`html\n${html.trim()}\n\`\`\``;
        } else if (code && code.trim()) {
          // Choose proper fence from language
          const langMap = {
            python: "python",
            js: "js",
            javascript: "js",
            java: "java",
            c: "c",
            cpp: "cpp",
            cplusplus: "cpp",
            html: "html",
            css: "css",
            json: "json",
            php: "php",
            go: "go",
            rust: "rust",
            ts: "ts",
            typescript: "ts",
          };
          const fence = langMap[language] || "js";
          const prettyLang = (language || "Code").toUpperCase();
          reply += `💻 **Generated ${prettyLang}**\n\`\`\`${fence}\n${code.trim()}\n\`\`\``;
        } else if (promptOut && promptOut.trim()) {
          reply += `✨ **Generated Prompt**\n${promptOut.trim()}`;
        } else {
          // fallback: attempt to detect from strings in aiResult or raw
          const raw =
            typeof aiResult === "string"
              ? aiResult
              : aiResult.summary ||
                aiResult.output ||
                aiResult.result ||
                JSON.stringify(aiResult, null, 2);

          if (/<[a-z!][\s\S]*>/i.test(raw)) {
            reply += `🌐 **Detected HTML**\n\`\`\`html\n${raw.trim()}\n\`\`\``;
          } else if (/function|const|let|=>|console\.log/.test(raw)) {
            reply += `💻 **Detected JavaScript Code**\n\`\`\`js\n${raw.trim()}\n\`\`\``;
          } else if (/def |import |print\(|:\n\s/.test(raw)) {
            reply += `🐍 **Detected Python Code**\n\`\`\`python\n${raw.trim()}\n\`\`\``;
          } else {
            reply += raw.trim() || "No output detected.";
          }
        }
      }

      if (!reply) reply = "No meaningful AI response.";

      addAiMessage(reply.trim());
    } catch (err) {
      console.error("AI call error:", err);
      addAiMessage("❌ Network error while contacting AI backend.");
    } finally {
      setInput("");
      setIsProcessing(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    runAnalysis();
  };

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      try {
        rec.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        console.error("Could not start recognition:", err);
        setIsListening(false);
      }
    }
  };

  const clearHistory = (tabId) => {
    setChats((prev) => ({ ...prev, [tabId]: [] }));
  };

  // message renderer (with safe markdown wrapper)
const renderMessage = (m, i) => {
  const isUser = m.sender === "user";

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // 🧠 Render text + multiple code blocks with structure: prompt → generated text → code
  const renderText = (text) => {
    const segments = text.split(/```/g);
    const parts = [];

    for (let i = 0; i < segments.length; i++) {
      if (i % 2 === 0) {
        // Regular text (explanation or prompt)
        if (segments[i].trim()) {
          parts.push(
            <ReactMarkdown
              key={`text-${i}`}
              class="mb-2 leading-relaxed text-gray-200 whitespace-pre-wrap"
            >
              {segments[i].trim()}
            </ReactMarkdown>
          );
        }
      } else {
        // Code block — syntax highlight + copy
        const firstLineBreak = segments[i].indexOf("\n");
        const lang =
          firstLineBreak !== -1
            ? segments[i].slice(0, firstLineBreak).trim()
            : "plaintext";
        const code =
          firstLineBreak !== -1
            ? segments[i].slice(firstLineBreak + 1)
            : segments[i];

        parts.push(
          <div key={`code-${i}`} className="relative my-3 group">
            <button
              onClick={() => handleCopy(code)}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-gray-300 hidden group-hover:block"
            >
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            </button>
            <SyntaxHighlighter
              language={lang}
              style={oneDark}
              customStyle={{
                borderRadius: "0.75rem",
                fontSize: "0.9rem",
                background: "rgba(25, 25, 25, 0.95)",
                padding: "1rem",
                color: "#e8f0ff", // brighter code text
                lineHeight: "1.5",
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {code.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }
    }

    return parts;
  };

  return (
    <AnimatePresence key={m.ts + "-" + i}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-[86%] md:max-w-[72%] break-words p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none"
              : "bg-white/10 text-gray-100 rounded-bl-none border border-white/5 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-300">
            {isUser ? (
              <>
                <User size={14} /> You
              </>
            ) : (
              <>
                <Bot size={14} /> NeuroLink
              </>
            )}
          </div>

          {/* 💬 Message content */}
          <div
            className={`prose prose-sm max-w-none ${
              isUser ? "text-white" : "text-gray-100"
            }`}
          >
            {renderText(m.text)}
          </div>

          <div className="text-[10px] text-gray-400 mt-2 text-right">
            {new Date(m.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};



return (
<div className="w-full min-h-screen overflow-x-hidden text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  <div className="w-full max-w-6xl px-4 py-1 mx-auto space-y-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent sm:text-3xl md:text-4xl bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">
              AI Lab
            </h1>
            <p className="text-xs text-gray-300 sm:text-sm">
              Region: <span className="text-cyan-300">{sessionRegion}</span>
            </p>
          </div>
          <div className="text-sm sm:text-right">
            <div className="text-xs text-gray-400">User</div>
            <div className="font-semibold">{username || "Guest"}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 overflow-x-auto border rounded-2xl bg-white/5 border-white/10 scrollbar-thin scrollbar-thumb-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center flex-shrink-0 gap-2 px-3 py-2 rounded-xl text-sm sm:text-base transition ${
                activeTab === t.id
                  ? "bg-cyan-500 text-black shadow-lg"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Chat Box */}
        <div className="border rounded-2xl border-white/10 bg-white/5 shadow-lg overflow-hidden flex flex-col h-[75vh] sm:h-[70vh]">
          {/* Chat messages */}
          <div
            ref={scrollRef}
            className="flex-1 px-3 py-4 overflow-y-auto sm:px-5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {(chats[activeTab] || []).length === 0 && !isProcessing ? (
              <div className="mt-10 text-sm text-center text-gray-400">
                No messages yet — say hello 👋
              </div>
            ) : (
              (chats[activeTab] || []).map((m, i) => renderMessage(m, i))
            )}
            {isProcessing && (
              <div className="mt-3 text-gray-300 animate-pulse">
                NeuroLink is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex flex-col items-end gap-2 p-3 border-t sm:flex-row sm:items-center sm:gap-3 sm:p-4 border-white/10 bg-gradient-to-t from-transparent"
          >
            <div className="flex items-center w-full gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition ${
                  isListening ? "bg-red-500" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {isListening ? <MicOff /> : <Mic />}
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  TABS.find((t) => t.id === activeTab)?.placeholder
                }
                className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[48px] max-h-[160px] text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full p-3 text-black transition sm:w-auto bg-cyan-500 hover:bg-cyan-600 rounded-xl"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiLab;
