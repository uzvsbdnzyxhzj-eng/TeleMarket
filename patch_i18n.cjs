const fs = require('fs');

const file = fs.readFileSync('src/i18n.ts', 'utf8');

const newKeys = {
  recordsNav: 'Record buy/sell',
  recordsTitle: 'Transaction Ledger',
  buyTab: 'BUY',
  sellTab: 'SELL',
  colPhone: 'PHONE',
  colPrice: 'PRICE',
  colDate: 'DATE',
  colStatus: 'STATUS',
  statusWait: 'WAIT',
  statusOk: 'OK',
  statusFailed: 'FAILED',
  getCodeBtnRecord: 'Get Code'
};

const updated = file.replace(/([a-z]{2,zh}):\s*\{([\s\S]*?)\}/g, (match, lang, content) => {
  let toAdd = "";
  for (const [key, val] of Object.entries(newKeys)) {
    if (!content.includes(key + ':')) {
        toAdd += `, ${key}: '${val}'`;
    }
  }
  return `${lang}: {${content}${toAdd}}`;
});

fs.writeFileSync('src/i18n.ts', updated);
