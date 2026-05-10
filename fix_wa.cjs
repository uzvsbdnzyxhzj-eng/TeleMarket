const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/8801905646095/g, '8801644627304');
fs.writeFileSync('src/App.tsx', c);
