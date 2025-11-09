// backend/utils/aiEngine.js
const OpenAI = require("openai");
const fetch = require("node-fetch"); // ✅ Needed for Perplexity API in Node
require("dotenv").config();

const API_KEY = process.env.OPENAI_API_KEY;
const isPerplexity = API_KEY && API_KEY.startsWith("pplx-");

const openai =
  !isPerplexity && API_KEY ? new OpenAI({ apiKey: API_KEY }) : null;

const runAIAnalysis = async (input) => {
  try {
    if (!API_KEY) throw new Error("❌ No API key found in environment");

    // ✅ Handle Perplexity API key
    if (isPerplexity) {
      console.log("🧠 Using Perplexity API");

      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          // 🔥 Use a valid Perplexity model (confirmed from official docs)
          model: "sonar",

          messages: [
            {
              role: "system",
              content:
                'You are NeuroLink.AI — analyze text and respond ONLY with pure JSON (no code blocks, no explanations). Return exactly this structure:\n{\n"summary": "...",\n"sentiment": "positive | negative | neutral",\n"suggestion": "..."\n}',
            },

            {
              role: "user",
              content: `Analyze this text deeply: ${input}. Return ONLY valid JSON as per the above structure.`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Perplexity error: ${res.status} - ${txt}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "";
// 🧹 Clean and safely parse the Perplexity response
let parsed;
try {
  const cleanContent = content
    ?.replace(/```json|```/g, "") // remove markdown fences
    ?.replace(/^[^{]*({[\s\S]*})[^}]*$/, "$1") // extract only JSON body
    ?.trim();

  parsed = JSON.parse(cleanContent);
} catch (err) {
  console.warn("⚠️ JSON parse failed, using fallback:", err.message);
  parsed = {
    summary: content?.slice(0, 250) || "No summary available.",
    sentiment: "neutral",
    suggestion:
      "Couldn't parse structured output — showing raw response.",
  };
}


      return {
        original: input,
        ai_analysis: parsed,
        provider: "perplexity",
        isMock: false,
      };
    }

    // ✅ Handle OpenAI
    if (openai) {
      console.log("🧠 Using OpenAI API");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are NeuroLink.AI — analyze text and return a JSON object with summary, sentiment, and suggestion.",
          },
          {
            role: "user",
            content: `Analyze this text deeply: ${input}.
            Return only JSON with keys summary, sentiment, and suggestion.`,
          },
        ],
      });

      const content = response?.choices?.[0]?.message?.content;
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {
          summary: content.slice(0, 150),
          sentiment: "neutral",
          suggestion:
            "Couldn't parse structured output — showing raw response.",
        };
      }

      return {
        original: input,
        ai_analysis: parsed,
        provider: "openai",
        isMock: false,
      };
    }

    throw new Error("No valid AI provider detected");
  } catch (error) {
    console.warn("⚠️ AI Engine Fallback:", error.message);

    const sentimentOptions = ["positive", "neutral", "negative"];
    const randomSentiment =
      sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];

    const mockResponse = {
      summary: `This is a simulated summary for: "${input.slice(0, 60)}..."`,
      sentiment: randomSentiment,
      suggestion: `Try reflecting on your input and taking one small step forward.`,
    };

    return {
      original: input,
      ai_analysis: mockResponse,
      provider: "mock",
      isMock: true,
    };
  }
};
const runAICodeGen = async (prompt) => {
  try {
    if (!API_KEY) throw new Error("❌ Missing API key");

    // helper: decide requested language from the user's prompt
    const detectRequestedLang = (p) => {
      const pp = (p || "").toLowerCase();
      if (/(html|website|page|landing|portfolio|ui|frontend|css|bootstrap)/i.test(pp)) return "html";
      if (/(python|py\s|flask|django|fastapi)/i.test(pp)) return "python";
      if (/(node|javascript|js|typescript|ts|react|vue|angular)/i.test(pp)) return "javascript";
      if (/(java\b)/i.test(pp)) return "java";
      if (/(c\+\+|cpp)/i.test(pp)) return "cpp";
      if (/(c#|csharp)/i.test(pp)) return "csharp";
      if (/(go\b|golang)/i.test(pp)) return "go";
      if (/(php\b)/i.test(pp)) return "php";
      return "unknown";
    };

    const requestedLang = detectRequestedLang(prompt);

    // unified system instruction (make it strict)
    const systemInstruction = `
You are a multilingual code generator. ALWAYS respond with EXACTLY one valid JSON object only (no markdown, no commentary), with any of these keys:
{
  "language": "HTML | JavaScript | Python | Java | C++ | ... (detected or requested)",
  "html": "<...>",    // put HTML/CSS/inline JS for UI/web requests
  "code": "..." ,     // put code for other languages (python, java, js non-ui)
  "prompt": "short summary"
}

Rules:
- If the user's prompt clearly asks for a webpage, UI, landing, portfolio, or frontend → return the UI under 'html' and set language to 'html'.
- If the user's prompt asks for a programming language (python, java, js, etc.) → put the code into 'code' and set language accordingly.
- Do not include code fences, markdown, or explanatory text outside the JSON.
`;

    // --- Perplexity branch (same structure you already had) ---
    if (isPerplexity) {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Task: ${prompt}` },
          ],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Perplexity error: ${res.status} - ${txt}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "";

      // try parse JSON, else fallback
      let parsed;
      try {
        const clean = content.replace(/```json|```/g, "").replace(/^[^{]*({[\s\S]*})[^}]*$/, "$1").trim();
        parsed = JSON.parse(clean);
      } catch (err) {
        // fallback: place raw content into code or html depending on prompt/content
        parsed = { language: requestedLang === "unknown" ? "text" : requestedLang, html: "", code: "", prompt: "" };
        if (/<[a-z!][\s\S]*>/i.test(content) || requestedLang === "html") parsed.html = content;
        else parsed.code = content;
      }

      // Normalise: if requested HTML but parsed put code in `code`, move it to html if it looks like HTML
      if (requestedLang === "html" && (!parsed.html || parsed.html.trim() === "")) {
        if (/<[a-z!][\s\S]*>/i.test(parsed.code || "")) {
          parsed.html = parsed.code;
          parsed.code = "";
        }
      }
      if (!parsed.language || parsed.language === "unknown") parsed.language = requestedLang || parsed.language || "text";

      return { aiResult: parsed, provider: "perplexity", isMock: false };
    }

    // --- OpenAI branch ---
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `Task: ${prompt}` },
        ],
        temperature: 0.2,
      });

      const content = response?.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        // fallback auto-detect
        parsed = { language: requestedLang === "unknown" ? "text" : requestedLang, html: "", code: "", prompt: "" };
        if (/<[a-z!][\s\S]*>/i.test(content) || requestedLang === "html") parsed.html = content;
        else parsed.code = content;
      }

      // final normalisation: if model put code but prompt asked html, convert
      if (requestedLang === "html" && (!parsed.html || parsed.html.trim() === "")) {
        if (/<[a-z!][\s\S]*>/i.test(parsed.code || "")) {
          parsed.html = parsed.code;
          parsed.code = "";
        }
      }
      if (!parsed.language || parsed.language === "unknown") parsed.language = requestedLang || parsed.language || "text";

      return { aiResult: parsed, provider: "openai", isMock: false };
    }

    throw new Error("No valid AI provider detected");
  } catch (error) {
    console.error("⚠️ runAICodeGen fallback:", error.message);
    return {
      aiResult: { html: "", code: "", prompt: `⚠️ Mock output for: "${prompt}"`, language: "unknown" },
      provider: "mock",
      isMock: true,
    };
  }
};





module.exports = { runAIAnalysis , runAICodeGen };
