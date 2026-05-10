const fs = require('fs');
let str = fs.readFileSync('src/App.tsx', 'utf8');

str = str.replace('const [socialMarkupPercent, setSocialMarkupPercent] = useState(25);\\n  const [smmMarkupData, setSmmMarkupData] = useState<Record<string, any>>({});', 'const [socialMarkupPercent, setSocialMarkupPercent] = useState(25);\n  const [smmMarkupData, setSmmMarkupData] = useState<Record<string, any>>({});');

fs.writeFileSync('src/App.tsx', str);
