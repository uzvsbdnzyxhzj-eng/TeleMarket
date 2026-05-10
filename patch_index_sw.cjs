const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

const registerSw = `
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      }
    </script>
  </body>
`;

code = code.replace('</body>', registerSw);
fs.writeFileSync('index.html', code);
console.log('index.html patched for sw.js');
