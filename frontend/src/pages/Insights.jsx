// src/pages/Insights.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { FiDownload, FiClock, FiTrendingUp, FiList } from "react-icons/fi";

/**
 * Redesigned Insights — single-file version (Option A)
 *
 * - Tabs: Overview | Trends | Recent
 * - Focused KPIs + clean charts + responsive layout
 * - Uses your existing endpoint: GET /api/ai/insights
 *
 * Drop-in replacement for your previous Insights component.
 */

const COLORS = ["#22d3ee", "#a855f7", "#f87171"]; // Positive, Neutral, Negative

const LoadingPlaceholder = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center w-full py-12 text-gray-400">
    <div className="text-lg animate-pulse">{text}</div>
  </div>
);

const KPI = ({ title, value, sub, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex-1 min-w-[160px] p-4 rounded-2xl bg-white/5 border border-white/10"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs text-gray-300">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
      </div>
      <div className="text-2xl text-cyan-400">{icon}</div>
    </div>
  </motion.div>
);

const CompactListItem = ({ text, tag }) => (
  <li className="flex items-start justify-between gap-3 py-2 border-b border-white/6">
    <div className="text-sm text-gray-200 truncate">{text}</div>
    <div
      className={`text-xs px-2 py-1 rounded-md font-semibold ${
        tag === "Positive"
          ? "bg-cyan-800 text-cyan-200"
          : tag === "Neutral"
          ? "bg-purple-900 text-purple-200"
          : "bg-red-900 text-red-200"
      }`}
    >
      {tag}
    </div>
  </li>
);

export default function Insights() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    total: 0,
    sentiments: { Positive: 0, Neutral: 0, Negative: 0 },
    recentAnalyses: [],
    categories: [],
    sentimentOverTime: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("https://neurolink-backend.onrender.com/api/ai/insights")
      .then((r) => {
        if (!r.ok) throw new Error(`Server ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (!mounted) return;
        if (res.success) {
          setInsights({
            total: res.total || 0,
            sentiments: res.sentiments || { Positive: 0, Neutral: 0, Negative: 0 },
            recentAnalyses: res.recentAnalyses || [],
            categories: res.categories || [],
            sentimentOverTime: res.sentimentOverTime || [],
          });
          setError(null);
        } else {
          setError(res.message || "No data");
        }
      })
      .catch((err) => {
        console.error("Insights fetch error:", err);
        if (mounted) setError("Failed to fetch insights");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const sentimentData = [
    { name: "Positive", value: insights.sentiments.Positive || 0 },
    { name: "Neutral", value: insights.sentiments.Neutral || 0 },
    { name: "Negative", value: insights.sentiments.Negative || 0 },
  ];

  const mostCommon = (() => {
    const s = insights.sentiments;
    const max = Math.max(s.Positive || 0, s.Neutral || 0, s.Negative || 0);
    if (max === 0) return "N/A";
    return Object.keys(s).find((k) => s[k] === max);
  })();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#0f1724] via-[#111827] to-[#0b1220] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              AI Insights
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              Focused analytics — distilled to the most actionable metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // try to download a minimalist CSV (client-side)
                const rows = [
                  ["Metric", "Value"],
                  ["Total Analyses", insights.total || 0],
                  ["Positive", insights.sentiments.Positive || 0],
                  ["Neutral", insights.sentiments.Neutral || 0],
                  ["Negative", insights.sentiments.Negative || 0],
                ];
                const csv = rows.map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "insights-summary.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 font-medium text-black rounded-lg bg-cyan-500 hover:bg-cyan-600"
            >
              <FiDownload /> Export CSV
            </button>
            <div className="items-center hidden gap-2 text-sm text-gray-300 md:flex">
              <FiClock /> Updated just now
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 overflow-x-auto bg-white/5 rounded-2xl">
          <TabButton id="overview" selected={tab === "overview"} setTab={setTab}>
            Overview
          </TabButton>
          <TabButton id="trends" selected={tab === "trends"} setTab={setTab}>
            Trends
          </TabButton>
          <TabButton id="recent" selected={tab === "recent"} setTab={setTab}>
            Recent
          </TabButton>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <main className="space-y-6 lg:col-span-8">
            {/* Error / Loading */}
            {loading && <LoadingPlaceholder text="Loading insights…" />}
            {error && !loading && (
              <div className="p-4 text-sm text-red-100 border border-red-800 rounded bg-red-900/40">
                {error}
              </div>
            )}

            {tab === "overview" && !loading && !error && (
              <>
                {/* KPI row */}
                <div className="flex gap-4 overflow-x-auto">
                  <KPI
                    title="Total Analyses"
                    value={insights.total ?? 0}
                    sub="All saved AI interactions"
                    icon={<FiList />}
                  />
                  <KPI
                    title="Positive"
                    value={insights.sentiments.Positive ?? 0}
                    sub={
                      insights.total
                        ? `${((insights.sentiments.Positive / insights.total) * 100).toFixed(1)}%`
                        : "0%"
                    }
                    icon={<FiTrendingUp />}
                  />
                  <KPI
                    title="Neutral"
                    value={insights.sentiments.Neutral ?? 0}
                    sub="Balanced responses"
                    icon={<FiClock />}
                  />
                  <KPI
                    title="Negative"
                    value={insights.sentiments.Negative ?? 0}
                    sub="Issues / concerns"
                    icon={<FiList />}
                  />
                </div>

                {/* Two-column: Pie + Recent summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <section className="p-4 border rounded-2xl bg-white/5 border-white/8">
                    <h3 className="mb-3 text-lg font-semibold text-cyan-300">
                      Sentiment Mix
                    </h3>

                    {sentimentData.every((d) => d.value === 0) ? (
                      <div className="text-gray-400">No sentiment data yet.</div>
                    ) : (
                      <div style={{ height: 220 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={sentimentData}
                              dataKey="value"
                              innerRadius={48}
                              outerRadius={80}
                              paddingAngle={6}
                              label={({ name, percent }) =>
                                `${name} ${Math.round(percent * 100)}%`
                              }
                            >
                              {sentimentData.map((entry, i) => (
                                <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <ReTooltip
                              contentStyle={{ backgroundColor: "#0b1220", borderRadius: 8 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-300">
                      Most common mood:{" "}
                      <span className="font-semibold text-white">{mostCommon}</span>
                    </div>
                  </section>

                  <section className="p-4 border rounded-2xl bg-white/5 border-white/8">
                    <h3 className="mb-3 text-lg font-semibold text-cyan-300">
                      Snapshot — Recent Analyses
                    </h3>

                    {insights.recentAnalyses.length === 0 ? (
                      <div className="text-gray-400">No recent analyses yet.</div>
                    ) : (
                      <ul className="space-y-2">
                        {insights.recentAnalyses.slice(0, 6).map((it, idx) => (
                          <div
                            key={idx}
                            className="p-3 border rounded-md bg-white/3 border-white/6"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-200 truncate">
                                {it.text}
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded-md font-semibold ${
                                  it.sentiment.toLowerCase() === "positive"
                                    ? "bg-cyan-800 text-cyan-200"
                                    : it.sentiment.toLowerCase() === "neutral"
                                    ? "bg-purple-900 text-purple-200"
                                    : "bg-red-900 text-red-200"
                                }`}
                              >
                                {it.sentiment}
                              </div>
                            </div>
                          </div>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </>
            )}

            {tab === "trends" && !loading && !error && (
              <>
                <section className="p-4 border rounded-2xl bg-white/5 border-white/8">
                  <h3 className="mb-3 text-lg font-semibold text-cyan-300">
                    Sentiment Trend (avg score)
                  </h3>

                  {insights.sentimentOverTime.length === 0 ? (
                    <div className="text-gray-400">Not enough trend data.</div>
                  ) : (
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart data={insights.sentimentOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                          <XAxis dataKey="date" stroke="#9CA3AF" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0b1220", borderRadius: 8 }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>

                <section className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
                  <div className="p-4 border rounded-2xl bg-white/5 border-white/8">
                    <h4 className="mb-2 text-sm text-cyan-300">Category Distribution</h4>
                    {insights.categories.length === 0 ? (
                      <div className="text-gray-400">No category data yet.</div>
                    ) : (
                      <div style={{ height: 220 }}>
                        <ResponsiveContainer>
                          <BarChart data={insights.categories}>
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#0b1220", borderRadius: 8 }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#a855f7" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-2xl bg-white/5 border-white/8">
                    <h4 className="mb-2 text-sm text-cyan-300">Top Insights</h4>
                    <div className="text-sm text-gray-300">
                      - Most common mood: <b>{mostCommon}</b>
                      <br />
                      - Analyses collected: <b>{insights.total}</b>
                      <br />
                      - Use Trends to detect rising issues early.
                    </div>
                  </div>
                </section>
              </>
            )}

            {tab === "recent" && !loading && !error && (
              <section className="p-4 border rounded-2xl bg-white/5 border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-cyan-300">Recent Analyses</h3>
                  <div className="text-sm text-gray-400">
                    Showing last {insights.recentAnalyses.length}
                  </div>
                </div>

                {insights.recentAnalyses.length === 0 ? (
                  <div className="text-gray-400">No recent analyses yet.</div>
                ) : (
                  <ul className="divide-y divide-white/6">
                    {insights.recentAnalyses.map((it, idx) => (
                      <li key={idx} className="py-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="text-sm text-gray-100">{it.text}</div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-400">{/* timestamp placeholder */}</div>
                            <div
                              className={`text-xs px-2 py-1 rounded-md font-semibold ${
                                it.sentiment.toLowerCase() === "positive"
                                  ? "bg-cyan-800 text-cyan-200"
                                  : it.sentiment.toLowerCase() === "neutral"
                                  ? "bg-purple-900 text-purple-200"
                                  : "bg-red-900 text-red-200"
                              }`}
                            >
                              {it.sentiment}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </main>

          {/* Right column — compact details */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="p-4 border rounded-2xl bg-white/5 border-white/8">
              <h4 className="mb-3 text-sm text-gray-300">Quick Metrics</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm text-gray-200">
                  <div>Most common mood</div>
                  <div className="font-semibold">{mostCommon}</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-200">
                  <div>Analyses</div>
                  <div className="font-semibold">{insights.total}</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-200">
                  <div>Regions monitored</div>
                  <div className="font-semibold">—</div>
                </div>
              </div>
            </div>

            {/* <div className="p-4 border rounded-2xl bg-white/5 border-white/8">
              <h4 className="mb-3 text-sm text-gray-300">Sentiment Breakdown</h4>
              {sentimentData.every((d) => d.value === 0) ? (
                <div className="text-gray-400">No data.</div>
              ) : (
                <div style={{ height: 160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sentimentData} dataKey="value" innerRadius={36} outerRadius={60}>
                        {sentimentData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip contentStyle={{ backgroundColor: "#0b1220", borderRadius: 6 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div> */}

            <div className="p-4 border rounded-2xl bg-white/5 border-white/8">
              <h4 className="mb-3 text-sm text-gray-300">Latest Inputs</h4>
              {insights.recentAnalyses.length === 0 ? (
                <div className="text-gray-400">No recent items.</div>
              ) : (
                <ul className="text-sm text-gray-200">
                  {insights.recentAnalyses.slice(0, 5).map((it, i) => (
                    <CompactListItem key={i} text={it.text} tag={it.sentiment} />
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* TabButton (small helper) */
function TabButton({ id, children, selected, setTab }) {
  return (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
        selected
          ? "bg-cyan-500/90 text-black shadow"
          : "text-gray-300 hover:bg-white/4"
      }`}
    >
      {children}
    </button>
  );
}
