import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/requireAuth\(\(\) => setCurrentView\("buy"\)\)/g, 'setCurrentView("buy")');
content = content.replace(/requireAuth\(\(\) => setCurrentView\("sell"\)\)/g, 'setCurrentView("sell")');
fs.writeFileSync('src/App.tsx', content);
console.log("done replace");
