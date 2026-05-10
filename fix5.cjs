const fs = require('fs');

let str1 = fs.readFileSync('src/SocialServices.tsx', 'utf8');
str1 = str1.replace(/socialMarkupPercent: number;\\n  smmMarkupData\?: Record<string, any>;/g, 'socialMarkupPercent: number;\n  smmMarkupData?: Record<string, any>;');
fs.writeFileSync('src/SocialServices.tsx', str1);
