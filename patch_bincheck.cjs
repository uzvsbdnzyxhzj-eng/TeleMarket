const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/return res\.json\(\{ success: true, message: "Order verified and balance updated\." \}\);/, 'if (email) {\nawait sendEmailNotification(email.toString(), "Deposit Verified", "topup_success", { amount: Number(amount).toFixed(2), method: "Binance Auto" });\n}\nreturn res.json({ success: true, message: "Order verified and balance updated." });');

fs.writeFileSync('server.ts', code);
console.log("Replaced with regex");
