const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace("+${topupMethod === 'binance' ? '0.00' : getUsdFee(Number(topupInputUsd)).toFixed(2)}", "+${getUsdFee(Number(topupInputUsd)).toFixed(2)}");
c = c.replace("{(Number(topupInputUsd) + (topupMethod === 'binance' ? 0 : getUsdFee(Number(topupInputUsd)))).toFixed(2)}", "{(Number(topupInputUsd) + getUsdFee(Number(topupInputUsd))).toFixed(2)}");
c = c.replace("amountUSD: binanceTransferAmount,", "amountUSD: binanceTransferAmount + getUsdFee(binanceTransferAmount),");

fs.writeFileSync('src/App.tsx', c);
