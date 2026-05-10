const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\/\* if \(\!currentUser\.emailVerified\) \{.*?\n  \} \*\//s;
code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
console.log('Removed commented out email verification code from App.tsx');
