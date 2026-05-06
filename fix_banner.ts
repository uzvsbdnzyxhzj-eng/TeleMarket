import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/<AdvertisementBanner onPostAdClick=\{\(\) \=\> setCurrentView\("post-ad"\)\} \/>/g, '<AdvertisementBanner onPostAdClick={() => requireAuth(() => setCurrentView("post-ad"))} />');
fs.writeFileSync('src/App.tsx', content);
console.log("done replace banner");
