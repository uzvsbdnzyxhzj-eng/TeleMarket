const fs = require('fs');

let code = fs.readFileSync('src/AdminSMMPricing.tsx', 'utf8');

if (!code.includes("useCurrency")) {
  code = code.replace(
    /import \{ db \} from "\.\/firebase";/,
    `import { db } from "./firebase";\nimport { useCurrency } from "./CurrencyContext";`
  );
  code = code.replace(
    /export default function AdminSMMPricing\(\{ socialMarkupPercent \}: \{ socialMarkupPercent: number \}\) \{/,
    `export default function AdminSMMPricing({ socialMarkupPercent }: { socialMarkupPercent: number }) {\n  const { formatCurrency } = useCurrency();`
  );
}

code = code.replace(
    /text-gray-500">\$(\{base.toFixed\(4\)\})<\/td>/g,
    'text-gray-500">{formatCurrency(base)}</td>'
);

code = code.replace(
  />\+\$\{currentProfitStr\}<\/span>/g,
  '>+{formatCurrency(Number(currentProfitStr))}</span>'
);

code = code.replace(
  /<span className="absolute left-3 top-1\/2 -translate-y-1\/2 text-gray-400">\$<\/span>/,
  '<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">USD</span>'
);

code = code.replace(
  />\$\{sellPriceStr\}<\/span>/g,
  '>{formatCurrency(Number(sellPriceStr))}</span>'
);


fs.writeFileSync('src/AdminSMMPricing.tsx', code);
