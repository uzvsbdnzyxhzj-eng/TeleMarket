const fs = require('fs');
let c = fs.readFileSync('src/AdvertisementBanner.tsx', 'utf8');
c = c.replace('dragElastic={0.2}', 'dragElastic={0.8}');
fs.writeFileSync('src/AdvertisementBanner.tsx', c);
