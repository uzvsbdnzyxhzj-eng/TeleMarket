import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { countries as countryList } from "countries-list";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let databaseId = "(default)";
if (fs.existsSync(firebaseConfigPath)) {
  const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
  if (config.firestoreDatabaseId) {
    databaseId = config.firestoreDatabaseId;
  }
}

if (!admin.apps.length) {
  let credential = admin.credential.applicationDefault();
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(sa);
      console.log("Firebase Admin initialized with Service Account config.");
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
    }
  }

  admin.initializeApp({
    credential,
    projectId: "gen-lang-client-0153398594",
  });
}
const db = getFirestore(admin.app(), databaseId);



const TG_LION_API_KEY = process.env.TG_LION_API_KEY || "kg5yi86f4lzhje3bsa";
const TG_LION_ID = process.env.TG_LION_ID || "6168111530";
const TG_LION_BASE = "https://TG-Lion.net";

process.on("unhandledRejection", (reason, promise) => {
  console.error("[PROCESS ERROR] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.error("[PROCESS ERROR] Uncaught Exception:", err, "origin:", origin);
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;


  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/proxy/countries", async (req, res) => {
    try {
      const url = `${TG_LION_BASE}?action=available_countries&apiKey=${TG_LION_API_KEY}&YourID=${TG_LION_ID}`;
      let data: any;
      try {
        const response = await fetch(url);
        data = await response.json();
      } catch (e) {
        data = { status: "error" };
      }

      if (data.status === "error" || data.cod === 401 || !data.countries || Object.keys(data.countries).length === 0) {
        return res.status(502).json({ error: "Failed to fetch countries from provider." });
      }

      const defaultDialCodes: Record<string, string> = {
        uzbekistan: "+998",
        bangladesh: "+880",
        "saudi arabia": "+966",
        usa: "+1",
        "united states": "+1",
        brazil: "+55",
        indonesia: "+62",
        russia: "+7",
        india: "+91",
        china: "+86",
        uk: "+44",
        "united kingdom": "+44",
        pakistan: "+92",
        nigeria: "+234",
        egypt: "+20",
        vietnam: "+84",
        turkey: "+90",
        philippines: "+63",
        thailand: "+66",
        germany: "+49",
        france: "+33",
        italy: "+39",
        spain: "+34",
        ukraine: "+380",
        poland: "+48",
        argentina: "+54",
        colombia: "+57",
        mexico: "+52",
        canada: "+1",
        malaysia: "+60",
        "south africa": "+27",
        kenya: "+254",
        morocco: "+212",
        kazakhstan: "+7",
        myanmar: "+95",
        nepal: "+977",
        "sri lanka": "+94",
        cambodia: "+855",
        senegal: "+221",
        ethiopia: "+251",
        ghana: "+233",
        iran: "+98",
        iraq: "+964",
        syria: "+963",
        algeria: "+213",
        peru: "+51",
        chile: "+56",
        venezuela: "+58",
        romania: "+40",
        netherlands: "+31",
        belgium: "+32",
        sweden: "+46",
        portugal: "+351",
        australia: "+61",
        japan: "+81",
        "south korea": "+82",
        taiwan: "+886",
      };

      if (data.status === "ok" && data.countries) {
        const formatted = Object.values(data.countries).map((c: any) => {
          const rawNameLower = (c.name || "").toLowerCase().trim();
          const cleanNameLower = rawNameLower.replace(/[^\w\s-]/g, "").trim();
          let mappedCode = defaultDialCodes[cleanNameLower];
          let iso2Code = "";

          if (!mappedCode) {
            const entry = Object.entries(countryList).find(
              ([iso, libC]) => libC.name.toLowerCase() === cleanNameLower,
            );
            if (entry) {
              const [iso, foundLib] = entry;
              iso2Code = iso;
              if (foundLib.phone && foundLib.phone.length > 0) {
                mappedCode = `+${foundLib.phone[0]}`;
              } else {
                mappedCode = `+${c.code_Num || c.code}`;
              }
            } else {
              mappedCode = `+${c.code_Num || c.code}`;
            }
          } else {
            // Find iso for default ones if possible
            const entry = Object.entries(countryList).find(
              ([iso, libC]) =>
                libC.name.toLowerCase() ===
                (cleanNameLower === "usa" || cleanNameLower === "uk"
                  ? cleanNameLower === "usa"
                    ? "united states"
                    : "united kingdom"
                  : cleanNameLower),
            );
            if (entry) iso2Code = entry[0];
          }

          let flagEmoji = "🌍";
          if (iso2Code) {
            const codePoint = (char: string) => 127397 + char.charCodeAt(0);
            flagEmoji = String.fromCodePoint(
              codePoint(iso2Code.toUpperCase()[0]),
              codePoint(iso2Code.toUpperCase()[1]),
            );
          }

          return {
            id: c.code, // Keep the TG Lion internal country ID for purchasing
            country: cleanNameLower.replace(/\b\w/g, (l) => l.toUpperCase()), // Prettify name
            code: mappedCode,
            flag: flagEmoji,
            stock: c.qty,
            basePrice: parseFloat(c.price),
          };
        });
        res.json(formatted);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching TG-Lion countries:", error);
      res.status(500).json({ error: "Failed to fetch from TG-Lion" });
    }
  });

  app.post("/api/proxy/buy", async (req, res) => {
    const { country_code } = req.body;
    try {
      const url = `${TG_LION_BASE}?action=getNumber&apiKey=${TG_LION_API_KEY}&YourID=${TG_LION_ID}&country_code=${country_code}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error buying number:", error);
      res.status(500).json({ error: "Failed to buy number" });
    }
  });

  app.post("/api/proxy/code", async (req, res) => {
    const { number } = req.body;
    try {
      const url = `${TG_LION_BASE}?action=getCode&apiKey=${TG_LION_API_KEY}&YourID=${TG_LION_ID}&number=${encodeURIComponent(number)}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error getting code:", error);
      res.status(500).json({ error: "Failed to get code" });
    }
  });

  app.get("/api/proxy/balance", async (req, res) => {
    try {
      const url = `${TG_LION_BASE}?action=get_balance&apiKey=${TG_LION_API_KEY}&YourID=${TG_LION_ID}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // --- SMM Sun Proxy Routes ---
  const SMM_API_URL = "https://smmgen.com/api/v2";
  const SMM_API_KEY = "076622ae1547776678e14a4c4e6586cc";

  let smmServicesCache: any = null;
  let smmServicesCacheTime: number = 0;

  app.post("/api/proxy/smm/services", async (req, res) => {
    try {
      const now = Date.now();
      // Cache for 15 minutes (900,000 ms)
      if (smmServicesCache && (now - smmServicesCacheTime) < 900000) {
        return res.json(smmServicesCache);
      }

      const p = new URLSearchParams();
      p.append("key", SMM_API_KEY);
      p.append("action", "services");

      let data;
      try {
        const response = await fetch(SMM_API_URL, {
          method: "POST",
          body: p,
          signal: AbortSignal.timeout(5000)
        });
        const text = await response.text();
        data = JSON.parse(text);
      } catch (err) {
        console.error("SMM API request failed or returned invalid JSON.");
        return res.status(502).json({ error: "Failed to fetch SMM services" });
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // Update cache
        smmServicesCache = data;
        smmServicesCacheTime = now;
      } else {
        data = smmServicesCache || [];
      }
      
      res.json(data);
    } catch (error) {
      console.error("SMM Services Error:", error);
      res.json(smmServicesCache || []);
    }
  });

  app.post("/api/proxy/smm/add", async (req, res) => {
    try {
      const p = new URLSearchParams();
      p.append("key", SMM_API_KEY);
      p.append("action", "add");
      for (const [k, v] of Object.entries(req.body)) {
        if (v !== undefined && v !== null) {
          p.append(k, String(v));
        }
      }

      const response = await fetch(SMM_API_URL, {
        method: "POST",
        body: p,
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("SMM Add Error: API returned invalid JSON:", text.substring(0, 150));
        return res.status(500).json({ error: "Failed to place order. API issue." });
      }
      res.json(data);
    } catch (error) {
      console.error("SMM Add Error:", error);
      res.status(500).json({ error: "Failed to place order." });
    }
  });

  app.post("/api/proxy/smm/status", async (req, res) => {
    try {
      const p = new URLSearchParams();
      p.append("key", SMM_API_KEY);
      p.append("action", "status");
      if (req.body.order) p.append("order", String(req.body.order));
      if (req.body.orders) p.append("orders", String(req.body.orders));

      const response = await fetch(SMM_API_URL, {
        method: "POST",
        body: p,
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("SMM Status Error: API returned invalid JSON:", text.substring(0, 150));
        return res.status(500).json({ error: "Failed to fetch order status. API issue." });
      }
      res.json(data);
    } catch (error) {
      console.error("SMM Status Error:", error);
      res.status(500).json({ error: "Failed to fetch order status." });
    }
  });

  app.post("/api/admin/smm/generate-desc", async (req, res) => {
    try {
      const { serviceName, categoryName } = req.body;

      if (!serviceName) {
        return res.status(400).json({ error: "Service name is required." });
      }

      // 1. Try to use Gemini AI if the API Key is available
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });

          const prompt = `You are an expert SMM panel marketer and copywriter.
Generate a highly professional, compelling, and concise marketing description for a social media marketing (SMM) service.
Service Category: ${categoryName || "Social Media"}
Service Name: ${serviceName}

Guidelines:
- Explain what this service does clearly and professionally (e.g., safe execution, speed, organic appearance, high retention, etc.).
- Highlight key benefits or specifications using clean, readable bullet points or short paragraphs.
- Format it nicely with simple HTML tags (like <b>, <ul>, <li>, <p>) so it renders beautifully in the app.
- Keep it concise (2-4 bullet points or short paragraphs maximum).
- Do not mention pricing, service IDs, or specific SMM provider names.
- Output ONLY the description HTML. Do not include markdown code blocks like \`\`\`html or any intro/outro remarks.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
          });

          let description = response.text || "";
          description = description.replace(/```html/gi, "").replace(/```/g, "").trim();

          if (description) {
            return res.json({ description });
          }
        } catch (aiError) {
          console.error("Gemini SMM API Error, using professional fallback generator:", aiError);
        }
      }

      // 2. High-quality Dynamic Fallback Generator (Rule-based Copywriting)
      console.log("Using professional fallback description generator for:", serviceName);
      
      const lowerService = serviceName.toLowerCase();
      const lowerCategory = (categoryName || "").toLowerCase();
      
      let startText = "0-2 hours (Instant Start)";
      let speedText = "3K-10K/Day stable delivery";
      let qualityText = "High-Quality real-looking accounts";
      let dropText = "Non-Drop / Lifetime Refill Guarantee";
      let keyBenefits = [
        "Increases your social proof and brand credibility instantly.",
        "100% safe and compliant with platform terms of service.",
        "Organic look with standard delivery speed to prevent flags."
      ];

      // Smart customization based on keywords
      if (lowerService.includes("follower") || lowerCategory.includes("follower")) {
        qualityText = "Real-looking active accounts with profile pictures and posts.";
        dropText = "Low-drop with 30-day auto-refill protection.";
        keyBenefits = [
          "Improves organic reach and attracts real profile engagement.",
          "Perfect for personal brands, influencers, and businesses.",
          "Secure execution requiring only public profile link."
        ];
      } else if (lowerService.includes("like") || lowerCategory.includes("like")) {
        qualityText = "High-quality fast-delivery likes from real profiles.";
        dropText = "Permanent high-retention likes.";
        keyBenefits = [
          "Boosts post exposure on feed algorithm instantly.",
          "Encourages natural engagement and organic interactions.",
          "Quick and completely safe delivery."
        ];
      } else if (lowerService.includes("view") || lowerCategory.includes("view") || lowerService.includes("watch")) {
        startText = "Instant start within 15 minutes";
        speedText = "Super fast 50K-100K/Day speed";
        qualityText = "High-retention video views with watch-time.";
        keyBenefits = [
          "Optimizes your video for the platform recommendation algorithm.",
          "Safe for monetization and advertisement-enabled accounts.",
          "Helps viral potential and trending placements."
        ];
      } else if (lowerService.includes("member") || lowerCategory.includes("member") || lowerService.includes("subscriber")) {
        qualityText = "Premium safe members with natural join pattern.";
        dropText = "Non-drop or stable high retention.";
        keyBenefits = [
          "Perfect for building strong community credibility.",
          "Assures new visitors that your community is active and trusted.",
          "No administrative details or special access needed."
        ];
      } else if (lowerService.includes("comment") || lowerCategory.includes("comment")) {
        qualityText = "Realistic and contextually positive comments.";
        keyBenefits = [
          "Sparks user discussions and builds highly active threads.",
          "Fully customizable or realistic general comments.",
          "Improves community feedback and customer trust."
        ];
      }

      // Formulate a beautiful HTML description
      const generatedFallback = `
<p><b>⚡ Premium ${categoryName || "Social Media"} Service</b></p>
<p>Enhance your online presence with our top-tier, secure delivery system tailored specifically for <b>${serviceName}</b>.</p>
<ul>
  <li><b>Start Time:</b> ${startText}</li>
  <li><b>Delivery Speed:</b> ${speedText}</li>
  <li><b>Quality:</b> ${qualityText}</li>
  <li><b>Stability:</b> ${dropText}</li>
</ul>
<p><b>Key Benefits:</b></p>
<ul>
  ${keyBenefits.map(benefit => `<li>${benefit}</li>`).join("\n  ")}
</ul>
<p><small>*No password required. Please ensure your account is public during delivery.</small></p>
      `.trim();

      res.json({ description: generatedFallback });

    } catch (error: any) {
      console.error("Description Generate Main Error:", error);
      res.status(500).json({ error: "Failed to generate description." });
    }
  });
  // ----------------------------

  app.post("/api/proxy/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ reply: "I'm offline right now because my AI brain (API Key) is not connected!" });
      }
      
      // We will lazy-initialize Gemini
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const { message, history } = req.body;
      
      const systemInstruction = `You are the official Customer Support Bot for Telemarket. 
Your job is to assist users in any language they speak.
Telemarket is a platform where users can securely buy and sell Telegram accounts.
To top up balance: Users can click the '$' or 'FUNDS' button in the dashboard, select bKash, Nagad, Binance, or Crypto, and follow the instructions.
To buy an account: Users can click 'My Codes' (Live Buy) or 'BUY' nav to view available stock and purchase.
To sell an account: Currently under maintenance ("Coming Soon"). But later users can sync their seller API.
To withdraw earnings: Users can click 'CASH OUT' in Dashboard or Profile to request a withdrawal (Min $1 USD). Allowed methods are bKash, Nagad, Binance, BSC-USDT.
If they need further help, tell them to open a support ticket or visit the Telegram channel.
Be very polite, helpful, concise, and respond in the language the user speaks. Use emojis moderately.`;

      // Convert history to Gemini format if needed, but for simplicity we just generateContent with full context
      const conversation = history.map((m: any) => `${m.role === 'user' ? 'Customer' : 'Bot'}: ${m.text}`).join('\n');
      const prompt = `${systemInstruction}\n\nConversation history:\n${conversation}\n\nCustomer: ${message}\nBot:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      if (error?.message?.includes("API key not valid") || error?.status === 400 || error?.status === 403) {
        return res.status(500).json({ reply: "My AI brain requires a valid API key. Please configure your API key in the platform Settings > Secrets panel!" });
      }
      res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later or open a support ticket." });
    }
  });

  // Payment API Keys
  
  // Telegram Bot Webhook Integration
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const { message } = req.body;
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

      if (!TELEGRAM_BOT_TOKEN) {
        return res.status(200).send("OK");
      }

      if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text;

        if (text === "/start" || text.startsWith("/start")) {
          const parts = text.split(" ");
          const refCode = parts.length > 1 ? parts[1] : "";
          const finalAppUrl = refCode ? `${APP_URL}?ref=${refCode}` : APP_URL;

          const welcomeText = "🛒 *Welcome to TeleMarket Official Bot!* 🌟\n\n" +
            "Buy premium Telegram accounts with instant delivery.\n\n" +
            "🌐 *Access Anywhere:*\n" +
            "You can seamlessly use our platform from anywhere you want!\n" +
            "• Telegram Bot: @TeleMarket_official_bot\n" +
            "• Web Browser: https://telemarket-rldz.onrender.com/\n\n" +
            "🚀 *Features:*\n" +
            "• Auto delivery in seconds\n" +
            "• Crypto, bKash & Nagad support\n" +
            "• 100% Secure & Private\n\n" +
            "👇 Tap below to launch the App and start trading now!";
          
          const imageUrl = "https://images.unsplash.com/photo-1620325867502-221afb5fbc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: imageUrl,
              caption: welcomeText,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "🚀 Open TeleMarket", web_app: { url: finalAppUrl } }
                  ],
                  [
                    { text: "👨‍💻 Support HelpLine", url: "https://wa.me/8801644627304" }
                  ]
                ]
              }
            })
          });
        }
      }
      res.status(200).send("OK");
    } catch (e) {
      console.error("Telegram webhook error:", e);
      res.status(200).send("OK"); 
    }
  });

  app.get("/api/telegram/set-webhook", async (req, res) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN missing in server environment variables" });
    
    // Auto-detect public URL
    const publicUrl = APP_URL.replace("http://localhost:3000", req.protocol + "://" + req.get("host"));
    const webhookUrl = `${publicUrl}/api/telegram/webhook`;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const data = await response.json();
      res.json({ webhookUrl, ...data });
    } catch (e) {
      res.status(500).json({ error: "Failed to set webhook" });
    }
  });

  // System webhooks and APIs
  app.post("/api/payment/topup", async (req, res) => {
    const { amountUSD, method, uid, pendingTxId } = req.body;
    console.log(
      `Processing topup of $${amountUSD} via ${method} for uid ${uid} (pendingTxId: ${pendingTxId})`,
    );

    const TOPUP_RATE = 129;

    let finalPayAmount: string;
    let paymentCurrency: string;

    const APP_URL = process.env.APP_URL || `http://localhost:3000`;
    let baseUrl = req.body.baseUrl || req.headers.origin;
    if (!baseUrl || !baseUrl.startsWith("http") || baseUrl.includes("localhost")) {
      baseUrl = APP_URL.replace("http://localhost:3000", req.protocol + "://" + req.get("host"));
    }
    // Hard fallback just in case the proxy returns localhost for host
    if (baseUrl.includes("localhost") && APP_URL && !APP_URL.includes("localhost")) {
      baseUrl = APP_URL;
    }

    const returnUrl = `${baseUrl}/?payment=success&txId=${pendingTxId || ""}`;
    const cancelUrl = `${baseUrl}/?payment=cancel&txId=${pendingTxId || ""}`;
    const webhookUrl = `${baseUrl}/api/payment/webhook`;

    console.log(`Generated URLs for Paymently: return=${returnUrl}, webhook=${webhookUrl}`);

    let PAYMENTLY_API_KEY = "5wXlbXNzfcw8arZYxb8HVMcnVAvIhXQAgvHeQHtm";
    let CRYPTOMUS_MERCHANT_ID = "75246d3d-3d5f-4385-810c-b1eb90ed88e4";
    let CRYPTOMUS_PAYMENT_KEY = "ZCKZ98YaRN3RzJ6dQDb3R0ctNeGsyQOziO2fhinpL97fHW4Olc8m076pUWMKzz8WdfVJAYJbRzDli7hISJxw5p26hXuycqaVuYLKE7fvXgB1QKZTCntUeT3rACOD0BWI";

    // Allow client to pass active keys in case of backend Firestore permission issues
    if (req.body.paymentlyApiKey) PAYMENTLY_API_KEY = req.body.paymentlyApiKey;
    if (req.body.cryptomusMerchantId) CRYPTOMUS_MERCHANT_ID = req.body.cryptomusMerchantId;
    if (req.body.cryptomusPaymentKey) CRYPTOMUS_PAYMENT_KEY = req.body.cryptomusPaymentKey;

    try {
      const keysDoc = await db.collection("settings").doc("api_keys").get();
      if (keysDoc.exists) {
        const data = keysDoc.data();
        if (data?.paymentlyApiKey) PAYMENTLY_API_KEY = data.paymentlyApiKey;
        if (data?.cryptomusMerchantId) CRYPTOMUS_MERCHANT_ID = data.cryptomusMerchantId;
        if (data?.cryptomusPaymentKey) CRYPTOMUS_PAYMENT_KEY = data.cryptomusPaymentKey;
        console.log("Dynamically loaded active API Keys from Firestore (topup)");
      }
    } catch (err) {
      console.log("Proceeding with default or client-provided API keys (topup)");
    }

    if (method === "bkash" || method === "nagad" || method === "binance") {
      // Paymently logic
      if (method === "binance") {
        const getUsdFee = (amt: number) => {
          if (amt < 5) return 0.1 + amt * 0.02;
          if (amt < 10) return 0.08 + amt * 0.018;
          return 0.05 + amt * 0.015;
        };
        const usdFee = getUsdFee(amountUSD);
        finalPayAmount = (amountUSD + usdFee).toFixed(2);
        paymentCurrency = "USD";
      } else {
        const getBdtFee = (amt: number) => {
          if (amt < 500) return 10 + amt * 0.02;
          if (amt < 1000) return 8 + amt * 0.018;
          return 5 + amt * 0.015;
        };
        const baseBdt = amountUSD * TOPUP_RATE;
        const bdtFee = getBdtFee(baseBdt);
        finalPayAmount = (baseBdt + bdtFee).toFixed(2);
        paymentCurrency = "BDT";
      }

      let data = null;
      let checkoutError = null;
      const checkoutDomains = ["https://uday.paymently.io", "https://uday.paymently.icu"];
      
      for (const domain of checkoutDomains) {
         try {
           console.log(`Attempting Paymently checkout on ${domain}...`);
           const response = await fetch(
             `${domain}/api/checkout-v2`,
             {
               method: "POST",
               headers: {
                 "Content-Type": "application/json",
                 "RT-UDDOKTAPAY-API-KEY": PAYMENTLY_API_KEY,
               },
               body: JSON.stringify({
                 full_name: "Telemarket User",
                 email: "customer@telemarket.com",
                 amount: finalPayAmount,
                 currency: paymentCurrency,
                 metadata: {
                   user_id: uid,
                   amount_usd: amountUSD,
                   type: "topup",
                   pendingTxId: pendingTxId || "",
                 },
                 redirect_url: returnUrl,
                 cancel_url: cancelUrl,
                 webhook_url: webhookUrl,
               }),
             },
           );
           
           if (response.ok) {
             const resJson = await response.json();
             if (resJson.status && resJson.payment_url) {
                data = resJson;
                break;
             } else {
                checkoutError = resJson.message || "Invalid status/payment_url response";
             }
           } else {
             checkoutError = `HTTP ${response.status}`;
           }
         } catch (error: any) {
           console.error(`Checkout failed on ${domain}:`, error.message);
           checkoutError = error.message;
         }
      }

      if (data && data.payment_url) {
        res.json({ 
          success: true, 
          payment_url: data.payment_url,
          invoice_id: data.invoice_id || data.id || data.payment_id || null
        });
      } else {
        console.warn("All Paymently checkout attempts failed.", checkoutError);
        res.status(400).json({ success: false, message: "Payment gateway error: " + (checkoutError || "Unknown error") });
      }
    } else if (method === "crypto") {
      // Direct Cryptomus Logic
      const getUsdFee = (amt: number) => {
        if (amt < 5) return 0.1 + amt * 0.02;
        if (amt < 10) return 0.08 + amt * 0.018;
        return 0.05 + amt * 0.015;
      };
      const usdFee = getUsdFee(amountUSD);
      finalPayAmount = (amountUSD + usdFee).toFixed(2);

      try {
        if (
          !CRYPTOMUS_MERCHANT_ID ||
          CRYPTOMUS_MERCHANT_ID === "YOUR_MERCHANT_ID"
        ) {
          console.warn("Cryptomus keys are not configured.");
          res.status(400).json({ success: false, message: "Cryptomus gateway not configured." });
          return;
        }

        // Standard Cryptomus implementation - using node crypto for hash
        const payload = {
          amount: finalPayAmount,
          currency: "USD",
          order_id: pendingTxId || `topup_${Date.now()}_${uid}`,
          url_return: returnUrl,
          url_callback: webhookUrl,
          is_payment_multiple: false,
        };

        const payloadStr = JSON.stringify(payload);
        const base64Payload = Buffer.from(payloadStr).toString("base64");
        const sign = crypto
          .createHash("md5")
          .update(base64Payload + CRYPTOMUS_PAYMENT_KEY)
          .digest("hex");

        const response = await fetch("https://api.cryptomus.com/v1/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            merchant: CRYPTOMUS_MERCHANT_ID,
            sign: sign,
          },
          body: payloadStr,
        });
        const data = await response.json();
        if (data.state === 0 && data.result?.url) {
          res.json({ success: true, payment_url: data.result.url });
        } else {
          console.warn("Failed to initiate Cryptomus payment.", data.message || "");
          res.status(400).json({ success: false, message: "Cryptomus error: " + (data.message || "") });
        }
      } catch (error: any) {
        console.error("Cryptomus System error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error connecting to Cryptomus" });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "Unknown payment method" });
    }
  });

  app.post("/api/payment/binance/check", async (req, res) => {
    const { orderId, amount, uid, email, numericId } = req.body;
    try {
      let apiKey = "ra2ZyraxFzBuQiGfYqs08VSyjbOgVkVbyi3Ll3OrHsakgm4tllv1r27J9p7EYz6T";
      let apiSecret = "DXwtIzuN4rBI9JkoWFZWSsDU9Woo8lIYEs8SdN6Olf0UVUpmxweUxlVPR0DuQTRw";
      
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(queryString)
        .digest("hex");

      const response = await fetch(`https://api.binance.com/sapi/v1/pay/transactions?${queryString}&signature=${signature}`, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      });

      const data = await response.json();
      console.log("Binance Pay Query response code:", data.code);

      let verified = false;
      let matchedTxId = "";
      if (data && data.code === '000000' && data.data) {
        const tx = data.data.find((t: any) => (t.orderId === orderId || t.fundTransferId === orderId) && t.status === "SUCCESS");
        if (tx) {
           const txAmount = parseFloat(tx.amount);
           if (txAmount >= amount * 0.95) { 
              verified = true;
              matchedTxId = tx.orderId || tx.fundTransferId || orderId;
           }
        }
      }

      if (!verified) {
         const spotQuery = `timestamp=${timestamp}`;
         const spotSig = crypto.createHmac("sha256", apiSecret).update(spotQuery).digest("hex");
         const spotRes = await fetch(`https://api.binance.com/sapi/v1/capital/deposit/hisrec?${spotQuery}&signature=${spotSig}`, {
           headers: { "X-MBX-APIKEY": apiKey }
         });
         const spotData = await spotRes.json();
         if (Array.isArray(spotData)) {
             const matchedSpot = spotData.find((d: any) => d.txId === orderId && d.status === 1);
             if (matchedSpot && parseFloat(matchedSpot.amount) >= amount * 0.95) {
                verified = true;
                matchedTxId = matchedSpot.txId || orderId;
             }
         }
      }

      if (verified && uid) {
         const userRef = db.collection("users").doc(uid);
         const userDoc = await userRef.get();
         if (userDoc.exists) {
             try {
                 await db.runTransaction(async (transaction) => {
                     // Check existing Tx INSIDE transaction to lock
                     const existingTx = await transaction.get(
                         db.collection("transactions")
                         .where("details.orderId", "==", matchedTxId)
                         .where("status", "==", "paid")
                     );
                     if (!existingTx.empty) {
                        throw new Error("AlreadyProcessed");
                     }

                     transaction.update(userRef, {
                          balanceUSD: admin.firestore.FieldValue.increment(amount),
                          total_deposited: admin.firestore.FieldValue.increment(amount),
                          last_update: Date.now()
                     });

                     // Save transaction
                     const newTxRef = db.collection("transactions").doc();
                     transaction.set(newTxRef, {
                          userId: uid,
                          userEmail: email || "",
                          userNumericId: numericId || "",
                          type: "topup",
                          txType: "Credit",
                          amountUSD: amount,
                          status: "paid",
                          details: { method: 'binance_manual', orderId: matchedTxId, totalSent: amount },
                          createdAt: Date.now(),
                          paidAt: Date.now()
                     });

                     const referrerId = userDoc.data()?.referredBy;
                     if (referrerId) {
                         const referrerRef = db.collection("users").doc(referrerId);
                         const referrerDoc = await transaction.get(referrerRef);
                         if (referrerDoc.exists) {
                             const bonusAmount = amount * 0.01;
                             transaction.update(referrerRef, {
                                 balanceUSD: admin.firestore.FieldValue.increment(bonusAmount),
                                 total_deposited: admin.firestore.FieldValue.increment(bonusAmount),
                                 referralEarnings: admin.firestore.FieldValue.increment(bonusAmount),
                                 last_update: Date.now()
                             });
                             const refTxRef = db.collection("transactions").doc();
                             transaction.set(refTxRef, {
                                 userId: referrerId,
                                 type: "referral_bonus",
                                 txType: "Credit",
                                 amountUSD: bonusAmount,
                                 status: "paid",
                                 details: { fromUserId: uid },
                                 createdAt: Date.now()
                             });
                         }
                     }
                 });
                 return res.json({ success: true, message: "Order verified and balance updated." });
             } catch (e: any) {
                 if (e.message === "AlreadyProcessed") {
                    return res.json({ success: true, message: "Order verified and already processed." });
                 }
                 throw e;
             }
         } else {
             return res.json({ success: false, message: "User not found for processing deposit." });
         }
      }

      res.json({ success: false, message: "Transaction not found or mismatched amount." });
    } catch (e) {
      console.error(e);
      res.json({ success: false, message: "API Error" });
    }
  });

  app.get("/api/ping", (req, res) => {
    res.send("pong");
  });

  app.get("/api/admin/env", (req, res) => {
    res.json({ 
       hasSA: !!process.env.FIREBASE_SERVICE_ACCOUNT,
       projectId: "gen-lang-client-0153398594"
    });
  });



  const fixBalancesHandler = async (req: any, res: any) => {
    try {
      console.log("Recalculating all user balances started...");
      const usersSnap = await db.collection("users").get();
      let fixedCount = 0;
      const details: any[] = [];

      for (const udoc of usersSnap.docs) {
        const userId = udoc.id;
        const userData = udoc.data();
        const currentBalance = Number(userData.balanceUSD) || 0;

        // Fetch transactions for this user
        const txsSnap = await db.collection("transactions").where("userId", "==", userId).get();
        
        let calculatedBalance = 0;
        let total_deposited = 0;
        let total_spent = 0;
        let referralEarnings = 0;

        txsSnap.forEach(txDoc => {
           const tx = txDoc.data();
           const amount = Number(tx.amountUSD) || 0;
           
           const isTopUpPaid = tx.type === 'topup' && (tx.status === 'paid' || tx.status === 'completed' || tx.status === 'success' || tx.status === 'OK' || tx.status === 'COMPLETED');
           const isDepositPaid = tx.type === 'deposit' && (tx.status === 'paid' || tx.status === 'completed' || tx.status === 'success');
           const isReferralPaid = tx.type === 'referral_bonus' && (tx.status === 'paid' || tx.status === 'completed');
           
           if (isTopUpPaid || isDepositPaid) {
              calculatedBalance += amount;
              total_deposited += amount;
           }
           if (isReferralPaid) {
              calculatedBalance += amount;
              referralEarnings += amount;
           }

           const isPurchase = tx.type === 'purchase' || tx.type === 'p2p_buy' || tx.type === 'buy';
           const isWithdraw = tx.type === 'withdraw' && tx.status !== 'rejected';
           const isChildPanel = tx.type === 'child_panel';

           if (isPurchase || isWithdraw || isChildPanel) {
              calculatedBalance -= amount;
              total_spent += amount;
           }
        });

        // Safe threshold for expected balance
        const expectedBalance = calculatedBalance < 0 ? 0 : calculatedBalance;

        // Check if there is any mismatch in balanceUSD, total_deposited, total_spent, or referralEarnings
        const currentDeposited = Number(userData.total_deposited) || 0;
        const currentSpent = Number(userData.total_spent) || 0;
        const currentReferrals = Number(userData.referralEarnings) || 0;

        const needsFix = 
          Math.abs(currentBalance - expectedBalance) > 0.0001 ||
          Math.abs(currentDeposited - total_deposited) > 0.0001 ||
          Math.abs(currentSpent - total_spent) > 0.0001 ||
          Math.abs(currentReferrals - referralEarnings) > 0.0001 ||
          isNaN(userData.balanceUSD) ||
          typeof userData.balanceUSD !== "number";

        if (needsFix) {
          console.log(`Fixing balance for ${userData.email || userId}: calculated ${expectedBalance} (was ${currentBalance})`);
          await db.collection("users").doc(userId).update({
              balanceUSD: expectedBalance,
              total_deposited,
              total_spent,
              referralEarnings,
              last_update: Date.now()
          });
          fixedCount++;
          details.push({
            userId,
            email: userData.email || "N/A",
            oldBalance: currentBalance,
            newBalance: expectedBalance,
            total_deposited,
            total_spent,
            referralEarnings
          });
        }
      }

      console.log(`Recalculation finished. Fixed ${fixedCount} balances.`);
      res.json({
        success: true,
        message: `Successfully recalculated balances for ${usersSnap.size} users. Fixed ${fixedCount} users.`,
        fixedCount,
        details
      });
    } catch (err: any) {
      console.error("Error in recalcBalances:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };

  app.get("/api/admin/recalcBalances", fixBalancesHandler);
  app.get("/api/admin/fixBalances", fixBalancesHandler);

  app.get("/api/admin/fixTx", async (req, res) => {
    return res.status(403).json({ error: "Access Denied" });
  });

  // In-memory & Local Disk store for verified webhooks since backend lacks Firestore IAM permissions by default.
  const verifiedTransactions = new Set<string>();
  const VERIFIED_TX_FILE = path.join(process.cwd(), "verified_txs.json");
  if (fs.existsSync(VERIFIED_TX_FILE)) {
      try {
          const arr = JSON.parse(fs.readFileSync(VERIFIED_TX_FILE, "utf-8"));
          if (Array.isArray(arr)) {
              arr.forEach(id => verifiedTransactions.add(id));
          }
      } catch(e) {}
  }
  const saveVerifiedTransactions = () => {
      try {
          fs.writeFileSync(VERIFIED_TX_FILE, JSON.stringify(Array.from(verifiedTransactions)));
      } catch(e) {}
  };

  app.post("/api/payment/webhook", async (req, res) => {
    // Webhook from Paymently or Cryptomus
    const { status, transaction_id, invoice_id, order_id, merchant, uuid } = req.body;

    let uid, amountUSD, paymentId, gateway, pendingTxId;

    let meta = req.body.metadata;
    if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch(e) {}
    }

    if ((status === "COMPLETED" || status === "completed") && meta && meta.user_id) {
       uid = meta.user_id;
       amountUSD = Number(meta.amount_usd);
       paymentId = transaction_id || invoice_id || "unknown";
       gateway = "paymently";
       pendingTxId = meta.pendingTxId;
    } else if (order_id && req.body.status && merchant) {
       // Cryptomus
       if (req.body.status !== "paid" && req.body.status !== "paid_over") {
          return res.status(200).send("Ignored");
       }
       pendingTxId = order_id;
       paymentId = uuid || "unknown";
       gateway = "cryptomus";
    } else {
       return res.status(200).send("OK"); // Ignored
    }

    try {
      console.log(`Webhook received: paymentId: ${paymentId}, pendingTxId: ${pendingTxId}, amount: ${amountUSD}`);

      if (pendingTxId) {
         verifiedTransactions.add(pendingTxId);
         saveVerifiedTransactions();
         console.log(`Transaction ${pendingTxId} marked as verified in memory & disk.`);
      }

      // If backend HAS service account permissions, ALSO try to process it directly!
      try {
          const txRef = db.collection("transactions").doc(pendingTxId);
          const txDoc = await txRef.get();
          if (txDoc.exists && txDoc.data()?.status === "pending") {
               const data = txDoc.data()!;
               await db.runTransaction(async (transaction) => {
                    const userRef = db.collection("users").doc(data.userId);
                    const userDoc = await transaction.get(userRef);
                    if (userDoc.exists) {
                       transaction.update(txRef, { status: "paid", paidAt: Date.now() });
                       transaction.update(userRef, {
                            balanceUSD: admin.firestore.FieldValue.increment(data.amountUSD),
                            total_deposited: admin.firestore.FieldValue.increment(data.amountUSD),
                            last_update: Date.now()
                       });
                       
                       const referrerId = userDoc.data()?.referredBy;
                       if (referrerId) {
                           const referrerRef = db.collection("users").doc(referrerId);
                           const referrerDoc = await transaction.get(referrerRef);
                           if (referrerDoc.exists) {
                               const bonusAmount = data.amountUSD * 0.01;
                               transaction.update(referrerRef, {
                                   balanceUSD: admin.firestore.FieldValue.increment(bonusAmount),
                                   total_deposited: admin.firestore.FieldValue.increment(bonusAmount),
                                   referralEarnings: admin.firestore.FieldValue.increment(bonusAmount),
                                   last_update: Date.now()
                               });
                               const refTxRef = db.collection("transactions").doc();
                               transaction.set(refTxRef, {
                                   userId: referrerId,
                                   type: "referral_bonus",
                                   txType: "Credit",
                                   amountUSD: bonusAmount,
                                   status: "paid",
                                   details: { fromUserId: data.userId },
                                   createdAt: Date.now(),
                               });
                           }
                       }
                    }
               });
               console.log(`Backend directly fulfilled tx ${pendingTxId} using Firestore IAM.`);
          }
      } catch (iamError) {
          // Normal. This means backend lacks IAM, so frontend must poll `/api/payment/verify` to do it.
      }

    } catch (e) {
      console.error("Webhook processing error:", e);
    }

    res.status(200).send("OK");
  });

  app.get("/api/payment/verify", async (req, res) => {
    try {
      const { txId, invoice_id } = req.query;
      
      if (typeof txId === 'string' && verifiedTransactions.has(txId)) {
          return res.json({ paid: true });
      }

      let PAYMENTLY_API_KEY = "5wXlbXNzfcw8arZYxb8HVMcnVAvIhXQAgvHeQHtm";
      let CRYPTOMUS_MERCHANT_ID = "75246d3d-3d5f-4385-810c-b1eb90ed88e4";
      let CRYPTOMUS_PAYMENT_KEY = "ZCKZ98YaRN3RzJ6dQDb3R0ctNeGsyQOziO2fhinpL97fHW4Olc8m076pUWMKzz8WdfVJAYJbRzDli7hISJxw5p26hXuycqaVuYLKE7fvXgB1QKZTCntUeT3rACOD0BWI";

      // Handle client-supplied secrets in case backend Firestore cannot read them
      if (req.query.paymentlyApiKey && typeof req.query.paymentlyApiKey === "string") {
        PAYMENTLY_API_KEY = req.query.paymentlyApiKey;
      }
      if (req.query.cryptomusMerchantId && typeof req.query.cryptomusMerchantId === "string") {
        CRYPTOMUS_MERCHANT_ID = req.query.cryptomusMerchantId;
      }
      if (req.query.cryptomusPaymentKey && typeof req.query.cryptomusPaymentKey === "string") {
        CRYPTOMUS_PAYMENT_KEY = req.query.cryptomusPaymentKey;
      }

      // Attempt backend db load if available
      try {
        const keysDoc = await db.collection("settings").doc("api_keys").get();
        if (keysDoc.exists) {
          const data = keysDoc.data();
          if (data?.paymentlyApiKey) PAYMENTLY_API_KEY = data.paymentlyApiKey;
          if (data?.cryptomusMerchantId) CRYPTOMUS_MERCHANT_ID = data.cryptomusMerchantId;
          if (data?.cryptomusPaymentKey) CRYPTOMUS_PAYMENT_KEY = data.cryptomusPaymentKey;
        }
      } catch (e) {
        // Quiet fallback
      }
      
      // 1. Actively verify via Cryptomus if txId is provided (matching Cryptomus's order_id)
      if (typeof txId === 'string' && txId) {
         try {
           const payload = { order_id: txId };
           const payloadStr = JSON.stringify(payload);
           const base64Payload = Buffer.from(payloadStr).toString("base64");
           const sign = crypto
             .createHash("md5")
             .update(base64Payload + CRYPTOMUS_PAYMENT_KEY)
             .digest("hex");

           const controller = new AbortController();
           const timeoutId = setTimeout(() => controller.abort(), 12000);

           const verifyRes = await fetch("https://api.cryptomus.com/v1/payment/info", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                merchant: CRYPTOMUS_MERCHANT_ID,
                sign: sign
              },
              body: payloadStr,
              signal: controller.signal
           });
           clearTimeout(timeoutId);
           
           if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              if (verifyData.state === 0 && (verifyData.result?.status === "paid" || verifyData.result?.status === "paid_over" || verifyData.result?.status === "completed" || verifyData.result?.status === "paid_over_usd")) {
                 console.log(`Cryptomus active verification succeeded for order ${txId}`);
                 verifiedTransactions.add(txId);
                 saveVerifiedTransactions();
                 return res.json({ paid: true });
              }
           }
         } catch (e) {
           console.error("Cryptomus active verification failed:", e);
         }
      }
      
      // 2. Actively verify via Paymently if invoice_id is provided
      if (typeof invoice_id === 'string' && invoice_id) {
         try {
           // Query only active uday.paymently.io (as .icu has no DNS)
           const verifyDomains = ["https://uday.paymently.io"];
           let verified = false;

           for (const domain of verifyDomains) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                const verifyRes = await fetch(`${domain}/api/verify-payment`, {
                   method: "POST",
                   headers: {
                     "Content-Type": "application/json",
                     "RT-UDDOKTAPAY-API-KEY": PAYMENTLY_API_KEY,
                   },
                   body: JSON.stringify({ invoice_id }),
                   signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (verifyRes.ok) {
                   const verifyData = await verifyRes.json();
                   console.log(`Paymently active verification response on ${domain}:`, JSON.stringify(verifyData));
                   if (
                     verifyData.status === "COMPLETED" || 
                     verifyData.status === "completed" || 
                     verifyData.status === true || 
                     (verifyData.data && (verifyData.data.status === "COMPLETED" || verifyData.data.status === "completed"))
                   ) {
                      verified = true;
                      console.log(`Verified successfully via Paymently on ${domain} for invoice_id ${invoice_id}`);
                      break;
                   }
                } else {
                   console.warn(`Verify response failed on ${domain}: ${verifyRes.status}`);
                }
              } catch (err: any) {
                console.error(`Active verification details on ${domain} failed:`, err.message || err);
              }
           }

           if (verified) {
              if (typeof txId === 'string' && txId) {
                 verifiedTransactions.add(txId);
                 saveVerifiedTransactions();
              }
              return res.json({ paid: true });
           }
         } catch (e) {
           console.error("Paymently active verification system level failed:", e);
         }
      }
      
      return res.json({ paid: false });
    } catch (routeError: any) {
      console.error("Error in /api/payment/verify route handler:", routeError);
      return res.status(500).json({ error: routeError?.message || String(routeError), paid: false });
    }
  });

  app.post("/api/payment/withdraw", (req, res) => {
    const { amountUSD, address } = req.body;
    console.log(`Processing withdraw of $${amountUSD} to ${address}`);
    res.json({
      success: true,
      message: "Withdraw request submitted successfully",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
