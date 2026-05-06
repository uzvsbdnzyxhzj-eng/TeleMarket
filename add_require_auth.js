import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/onClick=\{\(\) \=\> \{ \(window as any\)\.triggerAdClick\?\.\(\); setCurrentView\("buy"\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); requireAuth(() => setCurrentView("buy")); }}');
content = content.replace(/onClick=\{\(\) \=\> \{ \(window as any\)\.triggerAdClick\?\.\(\); setCurrentView\("sell"\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); requireAuth(() => setCurrentView("sell")); }}');
content = content.replace(/onClick=\{\(\) \=\> \{ \(window as any\)\.triggerAdClick\?\.\(\); setTopupModal\(true\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); requireAuth(() => setTopupModal(true)); }}');
content = content.replace(/onClick=\{\(\) \=\> \{ \(window as any\)\.triggerAdClick\?\.\(\); setTopupModal\(true\); setIsMobileMenuOpen\(false\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); requireAuth(() => { setTopupModal(true); setIsMobileMenuOpen(false); }); }}');
content = content.replace(/onClick=\{\(\) \=\> \{ \(window as any\)\.triggerAdClick\?\.\(\); setWithdrawModal\(true\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); requireAuth(() => setWithdrawModal(true)); }}');

content = content.replace(/onClick=\{\(\) \=\> setCurrentView\("profile"\)\}/g, 'onClick={() => requireAuth(() => setCurrentView("profile"))}');
content = content.replace(/onClick=\{\(\) \=\> setCurrentView\("records"\)\}/g, 'onClick={() => requireAuth(() => setCurrentView("records"))}');
content = content.replace(/onClick=\{\(\) \=\> setCurrentView\("wallet-history"\)\}/g, 'onClick={() => requireAuth(() => setCurrentView("wallet-history"))}');

// inside Buy component
content = content.replace(/onClick=\{async \(\) \=\> \{\n                if \(\!currentUser\) return alert\("Please login first\."\);/g, 'onClick={async () => {\n                if (!currentUser) return requireAuth();');


fs.writeFileSync('src/App.tsx', content);
console.log("Done adding requireAuth");
