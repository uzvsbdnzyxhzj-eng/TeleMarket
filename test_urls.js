const https = require('https');

const urls = [
  'https://seeklogo.com/images/G/garena-free-fire-logo-5D5514E6DE-seeklogo.com.png',
  'https://seeklogo.com/images/M/mobile-legends-logo-301CACEB8A-seeklogo.com.png',
  'https://seeklogo.com/images/K/kwai-logo-42A9444B6D-seeklogo.com.png',
  'https://seeklogo.com/images/L/likee-logo-2ECC06C0C3-seeklogo.com.png',
  'https://seeklogo.com/images/L/lemon8-logo-483FF068F1-seeklogo.com.png',
  'https://seeklogo.com/images/C/coub-logo-7B3CA694BE-seeklogo.com.png',
  'https://seeklogo.com/images/L/lazada-logo-6ECBCA2E86-seeklogo.com.png',
  'https://seeklogo.com/images/Y/yandex-logo-51F0D421BE-seeklogo.com.png'
];

urls.forEach(urlStr => {
  const req = https.get(urlStr, (res) => {
    console.log(urlStr, res.statusCode);
  });
  req.on('error', (e) => {
    console.error(urlStr, e.message);
  });
});
