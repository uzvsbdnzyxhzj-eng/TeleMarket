async function run() {
  const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change triggerAdClick from 5 to 3
code = code.replace(/if \(clickCount >= 5\)/, 'if (clickCount >= 3)');

// 2. Remove `(window as any).triggerAdClick?.(); ` from everywhere
code = code.replace(/\(window as any\)\.triggerAdClick\?\.\(\);\s*/g, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
}
run();

