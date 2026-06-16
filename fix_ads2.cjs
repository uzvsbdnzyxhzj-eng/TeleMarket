const fs = require('fs');

let code = fs.readFileSync('src/PostAd.tsx', 'utf8');
code = code.replace(/\{formatCurrency\(\{p\.price\}\)\}/g, '{formatCurrency(p.price)}');
code = code.replace(/\{formatCurrency\(\{p\.finalPrice\}\)\}/g, '{formatCurrency(p.finalPrice)}');

fs.writeFileSync('src/PostAd.tsx', code);
