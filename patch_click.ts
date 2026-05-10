import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/onClick=\{\(\) => setCurrentView\("([^"]+)"\)\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("$1"); }}');
content = content.replace(/onClick=\{\(\) => requireAuth\(\(\) => setCurrentView\("([^"]+)"\)\)\}/g, 'onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("$1"); })}');

content = content.replace(/onClick=\{\(\) => \{ setCurrentView\("([^"]+)"\); \}\}/g, 'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("$1"); }}');
content = content.replace(/onClick=\{\(\) => \{ requireAuth\(\(\) => \{ setCurrentView\("([^"]+)"\); \} \)\}\}/g, 'onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("$1"); }) }}');
content = content.replace(/onClick=\{\(\) => \{ requireAuth\(\(\) => \{ setCurrentView\("([^"]+)"\); \}\) \}\}/g, 'onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("$1"); }) }}');

fs.writeFileSync('src/App.tsx', content);
