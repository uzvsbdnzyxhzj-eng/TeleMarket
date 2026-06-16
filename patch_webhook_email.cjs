const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /console\.log\(`Backend directly fulfilled tx \$\{pendingTxId\} using Firestore IAM\.\`\);/;
const replacement = 'console.log(`Backend directly fulfilled tx ${pendingTxId} using Firestore IAM.`);\nif (data.userEmail) {\n    await sendEmailNotification(data.userEmail.toString(), "Deposit Verified", "topup_success", { amount: Number(data.amountUSD).toFixed(2), method: data.details?.method || data.method || "System" });\n}';

code = code.replace(targetRegex, replacement);

fs.writeFileSync('server.ts', code);
console.log("Replaced webhook topup success email");
