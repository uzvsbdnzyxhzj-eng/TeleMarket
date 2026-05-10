const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/if \(!document\.getElementById\('monetag-tag'\)\) \{[\s\S]*?script2\.setAttribute\('data-cfasync', 'false'\);\s*document\.head\.appendChild\(script2\);\s*\}/, '');
code = code.replace(/if \(!document\.getElementById\('monetag-tag-10973886'\)\) \{[\s\S]*?script3\.setAttribute\('data-zone', '10973886'\);\s*document\.head\.appendChild\(script3\);\s*\}/, '');
fs.writeFileSync('src/App.tsx', code);
