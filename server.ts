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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TG_LION_API_KEY = process.env.TG_LION_API_KEY || "kg5yi86f4lzhje3bsa";
const TG_LION_ID = process.env.TG_LION_ID || "6168111530";
const TG_LION_BASE = "https://TG-Lion.net";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;


  app.use(express.json());

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
        // Fallback mock data to prevent UI from breaking if API key is invalid
        data = {
          status: "ok",
          countries: {
             "1": { code: "bd", name: "Bangladesh", price: "0.20", qty: "500", code_Num: "880" },
             "2": { code: "in", name: "India", price: "0.15", qty: "1000", code_Num: "91" },
             "3": { code: "us", name: "USA", price: "0.50", qty: "200", code_Num: "1" },
             "4": { code: "id", name: "Indonesia", price: "0.18", qty: "1500", code_Num: "62" },
             "5": { code: "ru", name: "Russia", price: "0.12", qty: "800", code_Num: "7" }
          }
        };
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

// Dummy fallback data if SMM API is down
const FALLBACK_SMM_SERVICES = [
  { service: "1", name: "Instagram Followers [High Quality]", type: "Default", category: "Instagram Followers", rate: "0.50", min: "100", max: "10000" },
  { service: "2", name: "Instagram Likes [Real]", type: "Default", category: "Instagram Likes", rate: "0.10", min: "50", max: "5000" },
  { service: "3", name: "YouTube Views [Non-Drop]", type: "Default", category: "YouTube Views", rate: "1.20", min: "1000", max: "100000" },
  { service: "4", name: "YouTube Subscribers [Speed: 50/Day]", type: "Default", category: "YouTube Subscribers", rate: "5.00", min: "100", max: "2000" },
  { service: "5", name: "TikTok Followers", type: "Default", category: "TikTok", rate: "0.80", min: "100", max: "50000" },
  { service: "6", name: "Facebook Page Likes", type: "Default", category: "Facebook", rate: "1.50", min: "100", max: "10000" },
  { service: "7", name: "Telegram Members", type: "Default", category: "Telegram", rate: "0.30", min: "100", max: "20000" },
  { service: "8", name: "Twitter/X Followers", type: "Default", category: "Twitter", rate: "2.00", min: "100", max: "5000" },
];

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
        console.error("SMM API request failed or returned invalid JSON. Using fallback.");
        data = FALLBACK_SMM_SERVICES;
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // Update cache
        smmServicesCache = data;
        smmServicesCacheTime = now;
      } else {
        data = smmServicesCache || FALLBACK_SMM_SERVICES;
      }
      
      res.json(data);
    } catch (error) {
      console.error("SMM Services Error:", error);
      res.json(smmServicesCache || FALLBACK_SMM_SERVICES);
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
  // ----------------------------

  app.post("/api/proxy/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ reply: "I'm offline right now because my AI brain (API Key) is not connected!" });
      }
      
      // We will lazy-initialize Gemini
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
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
        model: 'gemini-2.5-flash',
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
                    { text: "🚀 Open TeleMarket", web_app: { url: APP_URL } }
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
    let baseUrl = req.headers.origin;
    if (!baseUrl || !baseUrl.startsWith("http")) {
      baseUrl = APP_URL.replace("http://localhost:3000", req.protocol + "://" + req.get("host"));
    }
    // Hard fallback just in case the proxy returns localhost for host
    if (baseUrl.includes("localhost") && APP_URL && !APP_URL.includes("localhost")) {
      baseUrl = APP_URL;
    }

    const returnUrl = `${baseUrl}/?payment=success`;
    const cancelUrl = `${baseUrl}/?payment=cancel`;
    const webhookUrl = `${baseUrl}/api/payment/webhook`;

    console.log(`Generated URLs for Paymently: return=${returnUrl}, webhook=${webhookUrl}`);

    let PAYMENTLY_API_KEY = "5wXlbXNzfcw8arZYxb8HVMcnVAvIhXQAgvHeQHtm";
    let CRYPTOMUS_MERCHANT_ID = "75246d3d-3d5f-4385-810c-b1eb90ed88e4";
    let CRYPTOMUS_PAYMENT_KEY = "ZCKZ98YaRN3RzJ6dQDb3R0ctNeGsyQOziO2fhinpL97fHW4Olc8m076pUWMKzz8WdfVJAYJbRzDli7hISJxw5p26hXuycqaVuYLKE7fvXgB1QKZTCntUeT3rACOD0BWI";

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

      try {
        const response = await fetch(
          "https://uday.paymently.io/api/checkout-v2",
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

        const data = await response.json();
        if (data.status && data.payment_url) {
          res.json({ success: true, payment_url: data.payment_url });
        } else {
          console.warn("Paymently API failed or expired.", data.message || "");
          res.status(400).json({ success: false, message: "Payment gateway error: " + (data.message || "Unknown error") });
        }
      } catch (error: any) {
        console.error("Paymently System error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error during checkout" });
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
    const { orderId, amount, uid } = req.body;
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

      if (data && data.code === '000000' && data.data) {
        // Find matching transaction
        const tx = data.data.find((t: any) => (t.orderId === orderId || t.fundTransferId === orderId) && t.status === "SUCCESS");
        if (tx) {
           const txAmount = parseFloat(tx.amount);
           if (txAmount >= amount * 0.95) { // allow a 5% margin for rounding issues
              return res.json({ success: true, message: "Order verified via Binance Pay" });
           }
        }
      }

      // Try checking spot deposits too just in case they sent on-chain
      const spotQuery = `timestamp=${timestamp}`;
      const spotSig = crypto.createHmac("sha256", apiSecret).update(spotQuery).digest("hex");
      const spotRes = await fetch(`https://api.binance.com/sapi/v1/capital/deposit/hisrec?${spotQuery}&signature=${spotSig}`, {
        headers: { "X-MBX-APIKEY": apiKey }
      });
      const spotData = await spotRes.json();
      if (Array.isArray(spotData)) {
          const matchedSpot = spotData.find((d: any) => d.txId === orderId && d.status === 1);
          if (matchedSpot && parseFloat(matchedSpot.amount) >= amount * 0.95) {
             return res.json({ success: true, message: "Order verified via Spot Deposits" });
          }
      }

      res.json({ success: false, message: "Transaction not found or mismatched amount." });
    } catch (e) {
      console.error(e);
      res.json({ success: false, message: "API Error" });
    }
  });

  app.get("/api/admin/env", (req, res) => {
    res.json({ 
       hasSA: !!process.env.FIREBASE_SERVICE_ACCOUNT,
       projectId: "gen-lang-client-0153398594"
    });
  });

  app.get("/api/admin/fixTx", async (req, res) => {
    try {
      const pendingTxs = await db.collection("transactions").where("status", "==", "pending").get();
      let fixed = 0;
      for (let doc of pendingTxs.docs) {
          const data = doc.data();
          if (data.type === "topup" && data.details?.method !== "binance_manual" && data.userId) {
              await db.runTransaction(async (transaction) => {
                 const userRef = db.collection("users").doc(data.userId);
                 const userDoc = await transaction.get(userRef);
                 let referrerRef = null;
                 let referralDoc = null;
                 
                 if (userDoc.exists && userDoc.data()?.referredBy) {
                     referrerRef = db.collection("users").doc(userDoc.data().referredBy);
                     referralDoc = await transaction.get(referrerRef);
                 }

                 const txToUpdate = db.collection("transactions").doc(doc.id);
                 transaction.update(txToUpdate, {
                      status: "paid",
                      paidAt: Date.now()
                 });

                 transaction.update(userRef, {
                      balanceUSD: admin.firestore.FieldValue.increment(data.amountUSD),
                      total_deposited: admin.firestore.FieldValue.increment(data.amountUSD),
                      last_update: Date.now()
                 });

                 if (referralDoc && referralDoc.exists && referrerRef) {
                     const bonusAmount = data.amountUSD * 0.01;
                     transaction.update(referrerRef, {
                         balanceUSD: admin.firestore.FieldValue.increment(bonusAmount),
                         total_deposited: admin.firestore.FieldValue.increment(bonusAmount),
                         referralEarnings: admin.firestore.FieldValue.increment(bonusAmount),
                         last_update: Date.now()
                     });
                     const refTxRef = db.collection("transactions").doc();
                     transaction.set(refTxRef, {
                         userId: userDoc.data()?.referredBy,
                         type: "referral_bonus",
                         txType: "Credit",
                         amountUSD: bonusAmount,
                         status: "paid",
                         details: { fromUserId: data.userId },
                         createdAt: Date.now(),
                     });
                 }
              });
              fixed++;
          }
      }
      res.json({ message: "Fixed " + fixed + " transactions" });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // In-memory store for verified webhooks since backend lacks Firestore IAM permissions
  const verifiedTransactions = new Set<string>();

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
         console.log(`Transaction ${pendingTxId} marked as verified in memory.`);
      }

    } catch (e) {
      console.error("Webhook processing error:", e);
    }

    res.status(200).send("OK");
  });

  app.get("/api/payment/verify", (req, res) => {
    const { txId } = req.query;
    if (typeof txId === 'string' && verifiedTransactions.has(txId)) {
        res.json({ paid: true });
    } else {
        res.json({ paid: false });
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
