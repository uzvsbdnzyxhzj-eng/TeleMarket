const fs = require('fs');

function revert(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Remove useCurrency imports
  code = code.replace(/import \{ useCurrency \} from "\.\/CurrencyContext";\n/g, '');
  code = code.replace(/import \{ useCurrency \} from "\.\/CurrencyContext";/, '');
  
  // Remove useCurrency hook call
  code = code.replace(/  const \{ currency, setCurrency, formatCurrency, exchangeRates, currencySymbols \} = useCurrency\(\);\n/g, '');
  code = code.replace(/  const \{ formatCurrency \} = useCurrency\(\);\n/g, '');

  // Revert formatCurrency(balanceUSD) in JSX
  code = code.replace(/\{formatCurrency\(balanceUSD\)\}/g, '${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}');
  
  // Revert other formatCurrency calls where Number() was used
  code = code.replace(/\{formatCurrency\(Number\(([^)]+)\)\)\}/g, '$$$1'); // e.g. ${charge} -> $charge (or similar)
  
  // Revert formatCurrency without Number
  code = code.replace(/\{formatCurrency\(([^)]+)\)\}/g, '$$$1'); 

  // Fix up specific issues that might arise with JSX string stuff
  // E.g. ${charge} inside standard span should be ${charge} or just ${charge}?
  // Wait, if it was `${charge}` it should be `${charge}` ... wait, React doesn't interpolate JSX text unless in `{}`
  // Let's look at `$<span ...>${charge}</span>` vs `<span ...>\${charge}</span>`

  fs.writeFileSync(file, code);
}

const files = [
  'src/App.tsx',
  'src/SocialServices.tsx',
  'src/ChildPanel.tsx',
  'src/MyAdsProfile.tsx',
  'src/PostAd.tsx',
  'src/AdminSMMPricing.tsx'
];

files.forEach(revert);

// Fix main.tsx
let mainCode = fs.readFileSync('src/main.tsx', 'utf8');
mainCode = mainCode.replace(/import \{ CurrencyProvider \} from '\.\/CurrencyContext\.tsx';\n/, '');
mainCode = mainCode.replace(/<CurrencyProvider>\n\s+(<App \/>)\n\s+<\/CurrencyProvider>/, '$1');
fs.writeFileSync('src/main.tsx', mainCode);
