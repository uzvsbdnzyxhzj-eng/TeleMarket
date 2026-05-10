const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace('  sendEmailVerification,\n', '');

fs.writeFileSync('src/App.tsx', code);
console.log('Removed sendEmailVerification import from App.tsx');
