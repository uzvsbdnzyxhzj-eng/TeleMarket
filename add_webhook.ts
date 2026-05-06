import fs from 'fs';

let serverTs = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `
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
          const welcomeText = "👋 *Welcome to TeleMarket!*\\n\\n" +
            "We are your secure platform to buy and sell Telegram accounts seamlessly.\\n\\n" +
            "🔹 *Buy Accounts*: Instant delivery via our automated system.\\n" +
            "🔹 *Add Funds*: Support for Crypto, bKash, and Nagad.\\n" +
            "🔹 *Earn*: Use your referral link to earn commissions!\\n\\n" +
            "🚀 Click the button below to launch the TeleMarket Mini App and start trading instantly! 👇";
          
          const imageUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
          
          await fetch(\`https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendPhoto\`, {
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
    const webhookUrl = \`\${publicUrl}/api/telegram/webhook\`;
    
    try {
      const response = await fetch(\`https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/setWebhook?url=\${encodeURIComponent(webhookUrl)}\`);
      const data = await response.json();
      res.json({ webhookUrl, ...data });
    } catch (e) {
      res.status(500).json({ error: "Failed to set webhook" });
    }
  });
`;

serverTs = serverTs.replace('const PAYMENTLY_API_KEY = process.env.PAYMENTLY_API_KEY || "tmK3Qhnqo38AvMetmNAXv3cVvQR2P0weO9OqJqDg";', webhookCode + '\n  const PAYMENTLY_API_KEY = process.env.PAYMENTLY_API_KEY || "tmK3Qhnqo38AvMetmNAXv3cVvQR2P0weO9OqJqDg";');

fs.writeFileSync('server.ts', serverTs);
console.log('Added Telegram Webhook logic');
