import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// target strings to REPLACE WITH original (without triggerAdClick)
content = content.replace(/\n\s*\(window as any\)\.triggerAdClick\?\.\(\);\s*\n\s*setBuyErrorId\(null\);/, '\n    setBuyErrorId(null);');
content = content.replace(/onClick=\{async \(\) \=\> \{\s*\(window as any\)\.triggerAdClick\?\.\(\);\s*if \(\!currentUser\) return alert\("Please login first\."\);/g, 'onClick={async () => {\n                if (!currentUser) return alert("Please login first.");');
content = content.replace(/onClick=\{\(\) \=\> \{\s*\(window as any\)\.triggerAdClick\?\.\(\);\s*setTopupError\(""\);\s*const enteredBDT/g, 'onClick={() => {\n                      setTopupError("");\n                      const enteredBDT');
content = content.replace(/onClick=\{\(\) \=\> \{\s*\(window as any\)\.triggerAdClick\?\.\(\);\s*setTopupError\(""\);\s*const enteredUSD/g, 'onClick={() => {\n                      setTopupError("");\n                      const enteredUSD');
content = content.replace(/onClick=\{async \(\) \=\> \{\s*\(window as any\)\.triggerAdClick\?\.\(\);\s*setWithdrawError\(""\);\s*const amountObj/g, 'onClick={async () => {\n                setWithdrawError("");\n                const amountObj');

// add to setWithdrawModal(true)
content = content.replace(/onClick=\{\(\) \=\> setWithdrawModal\(true\)\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setWithdrawModal(true); }}');

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed ad click trackers");
