const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<button onClick=\{\(\) => requireAuth\(\(\) => setTopupModal\(true\)\)\} className=\{`flex flex-col/g, 
  '<button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setTopupModal(true); })} className={`flex flex-col');

fs.writeFileSync('src/App.tsx', code);
