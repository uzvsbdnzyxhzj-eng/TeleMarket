const fs = require('fs');
fetch('https://telegram.org/js/telegram-web-app.js')
  .then(r => r.text())
  .then(t => {
    fs.writeFileSync('tg_sdk.js', t);
    const lines = t.split('\n');
    lines.forEach((line, i) => { if (line.includes('CloudStorage')) console.log(i, line); });
  });
