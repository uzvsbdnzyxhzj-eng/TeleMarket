const fs = require('fs');

let content = fs.readFileSync('src/Login.tsx', 'utf8');

content = content.replace(/#5123D8/gi, '#16a34a');
content = content.replace(/#431bb5/gi, '#15803d');
content = content.replace(/#8A5CF5/gi, '#22c55e');
content = content.replace(/#EAE4FB/gi, '#dcfce7');
content = content.replace(/F0E6FF/gi, 'F0FDF4');
content = content.replace(/100,50,200/gi, '22,163,74');
content = content.replace(/purple-200/gi, 'green-200');
content = content.replace(/Purple Backing Shape/gi, 'Green Backing Shape');

fs.writeFileSync('src/Login.tsx', content);
