const fs = require('fs');

// 1. Remove Monetag from index.html
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(/<script src='\/\/libtl\.com\/sdk\.js' data-zone='10972224' data-sdk='show_10972224'><\/script>/g, '');
html = html.replace(/<script src="https:\/\/quge5\.com\/88\/tag\.min\.js" data-zone="236849" async data-cfasync="false"><\/script>/g, '');

html = html.replace(/window\.triggerAdClick = function\(\) \{[\s\S]*?\};\n/, `window.adClickCount = 0;
        window.triggerAdClick = function() {
           try {
              if (window.adClickCount === undefined) window.adClickCount = 0;
              window.adClickCount++;
              if (window.adClickCount >= 15) {
                window.adClickCount = 0;
                if (window.show_10972224) { window.show_10972224().catch(()=>{}); }
              }
           } catch(e) {}
        };\n`);

// Remove "<!-- Global Monetag Scripts -->" if it exists empty
html = html.replace(/<!-- Global Monetag Scripts -->\s*\n*\s*<script>\s*window\.adClickCount/, '<script>\n        window.adClickCount');

fs.writeFileSync('index.html', html);

// 2. Add dynamic Monetag loader in App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

const monetagEffect = `
  // Dynamic Monetag loading (only when logged in)
  useEffect(() => {
    if (!currentUser) return; // Do not load on login/register pages
    
    if (!document.getElementById('monetag-popunder')) {
       const script1 = document.createElement('script');
       script1.id = 'monetag-popunder';
       script1.src = '//libtl.com/sdk.js';
       script1.setAttribute('data-zone', '10972224');
       script1.setAttribute('data-sdk', 'show_10972224');
       document.head.appendChild(script1);
    }
    
    if (!document.getElementById('monetag-tag')) {
       const script2 = document.createElement('script');
       script2.id = 'monetag-tag';
       script2.src = 'https://quge5.com/88/tag.min.js';
       script2.setAttribute('data-zone', '236849');
       script2.async = true;
       script2.setAttribute('data-cfasync', 'false');
       document.head.appendChild(script2);
    }
  }, [currentUser]);
`;

// Insert it somewhere inside App component, for instance after `const [currentView, setCurrentView] = useState...`
if (!appCode.includes('monetag-popunder')) {
  appCode = appCode.replace('const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);', 'const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n' + monetagEffect);
  fs.writeFileSync('src/App.tsx', appCode);
}

console.log("Fixed Monetag Logic");
