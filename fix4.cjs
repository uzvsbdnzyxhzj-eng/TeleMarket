const fs = require('fs');
let str = fs.readFileSync('src/App.tsx', 'utf8');

str = str.replace(/}, \[\]\);\\n\\n  \/\/ Load global markup/g, '}, []);\n\n  // Load global markup');

fs.writeFileSync('src/App.tsx', str);
