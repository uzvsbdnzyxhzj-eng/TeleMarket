const fs = require('fs');
let code = fs.readFileSync('src/Login.tsx', 'utf-8');

code = code.replace(', sendEmailVerification', '');
code = code.replace('sendEmailVerification, ', '');

fs.writeFileSync('src/Login.tsx', code);
console.log('Removed sendEmailVerification import from Login.tsx');
