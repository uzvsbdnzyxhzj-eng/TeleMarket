const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace local currency state with hook
code = code.replace(
  /const \[lang, setLang\] = useState<Language>\("en"\);\n  const \[currency, setCurrency\] = useState\("USD"\);\n  const exchangeRates: Record<string, number> = \{ USD: 1, BDT: 120, INR: 83, EUR: 0.92, GBP: 0.79, PKR: 280, NGN: 1500, KES: 130 \};\n  const currencySymbols: Record<string, string> = \{ USD: "\$", BDT: "৳", INR: "₹", EUR: "€", GBP: "£", PKR: "Rs", NGN: "₦", KES: "KSh" \};\n  const formatCurrency = \(amount: number\) => \{\n    const converted = amount \* exchangeRates\[currency\];\n    const formatted = converted > 0 && converted < 0.01 \? converted\.toFixed\(4\) : converted\.toFixed\(2\);\n    return \`\$\{currencySymbols\[currency\]\}\$\{formatted\}\`;\n  \};\n/,
  `const [lang, setLang] = useState<Language>("en");\n  const { currency, setCurrency, formatCurrency, exchangeRates, currencySymbols } = useCurrency();\n`
);

code = code.replace(
  `import { TelemarketLogo } from "./App";`, 
  `import { TelemarketLogo } from "./App";\nimport { useCurrency } from "./CurrencyContext";`
);

if (!code.includes("import { useCurrency }")) {
  code = code.replace(
    /import React, \{ /, 
    `import { useCurrency } from "./CurrencyContext";\nimport React, { `
  );
}

fs.writeFileSync('src/App.tsx', code);
