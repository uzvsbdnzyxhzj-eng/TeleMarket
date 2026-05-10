const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace top navigation buttons
code = code.replace(/<button onClick=\{\(\) => setCurrentView\("dashboard"\)\} className=\{`flex items-center/g, 
  '<button onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("dashboard"); }} className={`flex items-center');

code = code.replace(/<button onClick=\{\(\) => \{ setCurrentView\("buy"\); \}\} className=\{`flex items-center/g, 
  '<button onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("buy"); }} className={`flex items-center');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => \{ setCurrentView\("sell"\); \}\)\} className=\{`flex items-center/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("sell"); })} className={`flex items-center');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => setCurrentView\("records"\)\)\} className=\{`flex items-center/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("records"); })} className={`flex items-center');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => setCurrentView\("profile"\)\)\} className=\{`flex items-center/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("profile"); })} className={`flex items-center');


// Also replace the mobile bottom nav
code = code.replace(/<button onClick=\{\(\) => setCurrentView\("dashboard"\)\} className=\{`flex flex-col/g, 
  '<button onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("dashboard"); }} className={`flex flex-col');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => setCurrentView\("records"\)\)\} className=\{`flex flex-col/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("records"); })} className={`flex flex-col');

code = code.replace(/<button onClick=\{\(\) => \{ setCurrentView\("buy"\); \}\} className=\{`flex flex-col/g, 
  '<button onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("buy"); }} className={`flex flex-col');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => setCurrentView\("profile"\)\)\} className=\{`flex flex-col/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("profile"); })} className={`flex flex-col');

// Replace mobile topup bottom nav
code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => \{ setTopupModal\(true\); setIsMobileMenuOpen\(false\); \}\)\} className=\{`flex flex-col/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setTopupModal(true); setIsMobileMenuOpen(false); })} className={`flex flex-col');


fs.writeFileSync('src/App.tsx', code);
