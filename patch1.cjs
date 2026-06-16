const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /async function sendEmailNotification[\s\S]*?(?=app\.get\("\/api\/payment\/verify")/g;

fs.writeFileSync('debug_template.txt', code.match(regex) ? "FOUND" : "NOT FOUND");
