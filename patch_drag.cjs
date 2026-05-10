const fs = require('fs');
let c = fs.readFileSync('src/AdvertisementBanner.tsx', 'utf8');

const targetObj = `onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  setCurrentIndex((prev) => (prev + 1) % banners.length);
                } else if (swipe > swipeConfidenceThreshold) {
                  setCurrentIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1);
                }
              }}`;

const replaceObj = `onDragEnd={(e, { offset }) => {
                if (offset.x < -30) {
                  setCurrentIndex((prev) => (prev + 1) % banners.length);
                } else if (offset.x > 30) {
                  setCurrentIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1);
                }
              }}`;

c = c.replace(targetObj, replaceObj);
fs.writeFileSync('src/AdvertisementBanner.tsx', c);
console.log('Patched');
