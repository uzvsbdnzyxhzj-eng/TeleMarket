const fs = require('fs');

let str1 = fs.readFileSync('src/AdminSMMPricing.tsx', 'utf8');
str1 = str1.replace(/\\`/g, '`');
str1 = str1.replace(/\\\$/g, '$');
fs.writeFileSync('src/AdminSMMPricing.tsx', str1);
