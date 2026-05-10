const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// handleBuy check
code = code.replace(
  'const handleBuy = async (country: CountryData, finalPrice: number) => {',
  'const handleBuy = async (country: CountryData, finalPrice: number) => {\n    if (!currentUser) return requireAuth();'
);

// Sell account clicks to requireAuth
code = code.replaceAll(
  'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("sell"); }}',
  'onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("sell"); })}'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for Buy and Sell');
