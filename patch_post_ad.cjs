const fs = require('fs');

let c = fs.readFileSync('src/PostAd.tsx', 'utf8');

const newPlans = `const PLANS = [
  { months: 1, price: 30, discountText: "SAVE 50%", finalPrice: 15 },
  { months: 4, price: 120, discountText: "SAVE 66%", finalPrice: 40 },
  { months: 8, price: 240, discountText: "SAVE 75%", finalPrice: 60 },
  { months: 12, price: 360, discountText: "SAVE 79%", finalPrice: 75 },
];`;

c = c.replace(/const PLANS = \[[^\]]*\];/, newPlans);
fs.writeFileSync('src/PostAd.tsx', c);
console.log('Patched');
