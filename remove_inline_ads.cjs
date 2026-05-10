const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/\{ \(window as any\)\.triggerAdClick\?\.\(\);\s*/g, '{ ');
// Handle cases without brace opening if they exist
code = code.replace(/\(window as any\)\.triggerAdClick\?\.\(\);\s*/g, '');
fs.writeFileSync('src/App.tsx', code);
console.log('Removed inline triggerAdClick calls.');
