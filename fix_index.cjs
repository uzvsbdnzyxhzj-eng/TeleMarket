const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(`        // Add Telegram Monetag Ad script
        const script = document.createElement('script');
        script.src = '//libtl.com/sdk.js';
        script.setAttribute('data-zone', '10972224');
        script.setAttribute('data-sdk', 'show_10972224');
        document.head.appendChild(script);

        // Map triggerAdClick to the new ad zone
        window.triggerAdClick = function() {
           try {
              if (window.show_10972224) { window.show_10972224().catch(()=>{}); }
           } catch(e) {}
        };`, '');

const globalScript = `
    <!-- Global Monetag Scripts -->
    <script src='//libtl.com/sdk.js' data-zone='10972224' data-sdk='show_10972224'></script>
    <script src="https://quge5.com/88/tag.min.js" data-zone="236849" async data-cfasync="false"></script>
    <script>
        window.triggerAdClick = function() {
           try {
              if (window.show_10972224) { window.show_10972224().catch(()=>{}); }
           } catch(e) {}
        };
    </script>
`;

html = html.replace(`    <script src='//libtl.com/sdk.js' data-zone='10972224' data-sdk='show_10972224'></script>
    <script src="https://quge5.com/88/tag.min.js" data-zone="236849" async data-cfasync="false"></script>`, globalScript);

fs.writeFileSync('index.html', html);
console.log("Fixed index.html monetag logic");
