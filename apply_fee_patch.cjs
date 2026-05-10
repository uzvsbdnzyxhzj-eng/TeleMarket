const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/\\+\\d+\\{topupMethod === 'binance'.*?\\}/, "+${topupMethod === 'binance' ? '0.00' : getUsdFee(Number(topupInputUsd)).toFixed(2)}");

fs.writeFileSync('src/App.tsx', c);
console.log('Fixed fee display');
