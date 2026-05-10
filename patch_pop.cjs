const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Monetag Popunder Ad Initialization
  useEffect(() => {
    let clickCount = 0;
    let targetClicks = 8; // trigger every 8 clicks as requested

    const triggerPop = (e: MouseEvent) => {`;

const replacement = `  // Monetag Popunder Ad Initialization
  useEffect(() => {
    if (!currentUser) return;
    let clickCount = 0;
    let targetClicks = 8; // trigger every 8 clicks as requested

    const triggerPop = (e: MouseEvent) => {`;

const targetDep = `    document.addEventListener("click", triggerPop);
    return () => document.removeEventListener("click", triggerPop);
  }, []);`;

const replacementDep = `    document.addEventListener("click", triggerPop);
    return () => document.removeEventListener("click", triggerPop);
  }, [currentUser]);`;

if (content.includes(target) && content.includes(targetDep)) {
    content = content.replace(target, replacement);
    content = content.replace(targetDep, replacementDep);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Patched successfully");
} else {
    console.log("Not matched");
}
