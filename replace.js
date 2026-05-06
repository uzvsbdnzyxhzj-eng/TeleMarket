import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/onClick=\{\(\)\s*=>\s*\{\s*setTopupModal\(true\);\s*\}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); }}');
content = content.replace(/onClick=\{\(\)\s*=>\s*setTopupModal\(true\)\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); }}');
content = content.replace(/onClick=\{\(\)\s*=>\s*\{\s*setTopupModal\(true\);\s*setIsMobileMenuOpen\(false\);\s*\}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); setIsMobileMenuOpen(false); }}');

content = content.replace(/onClick=\{\(\)\s*=>\s*setCurrentView\("buy"\)\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("buy"); }}');

content = content.replace(/onClick=\{\(\)\s*=>\s*setCurrentView\("sell"\)\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("sell"); }}');

fs.writeFileSync('src/App.tsx', content);
console.log("Done ES module replace");
