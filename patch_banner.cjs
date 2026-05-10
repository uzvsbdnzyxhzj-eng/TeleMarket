const fs = require('fs');
let c = fs.readFileSync('src/AdvertisementBanner.tsx', 'utf8');

c = c.replace('3000', '5000'); // the auto slide time

const oldPromo = `<h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-black italic tracking-wider mb-2 drop-shadow-md">
                        PROMOTE YOUR BRAND WITH US
                      </h2>
                      <p className="text-white/95 text-sm md:text-xl lg:text-2xl font-bold max-w-2xl mx-auto mb-4 md:mb-6 drop-shadow-sm">
                        Advertise Your Shop, Website, or Anything Else on Our Platform.
                      </p>
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-sm md:text-lg px-6 md:px-10 py-2.5 md:py-4 rounded-full shadow-xl shadow-orange-500/40 transform group-hover:-translate-y-1 group-hover:shadow-orange-500/60 transition-all duration-300 border border-orange-400">
                        Click Here to Post Your Ad
                      </div>`;

const newPromo = `<h2 className="text-yellow-300 text-2xl md:text-4xl lg:text-5xl font-black italic tracking-wider mb-1 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2">
                        🔥 SPECIAL OFFER 🔥
                      </h2>
                      <div className="bg-red-600/90 border-2 border-yellow-400 text-white px-4 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.6)] mb-2 md:mb-4">
                        <span className="font-extrabold text-lg md:text-2xl tracking-widest text-yellow-300 drop-shadow-md">UP TO 120% OFF! 🎉</span>
                      </div>
                      <p className="text-white/95 text-xs md:text-lg lg:text-xl font-bold max-w-2xl mx-auto mb-3 md:mb-5 drop-shadow-sm leading-tight md:leading-normal">
                        Boost your business & get insane discounts on Advertising! 🚀<br className="hidden md:block"/> Hurry up, this is a <span className="text-yellow-300 underline decoration-red-500 decoration-2">LIMITED TIME EVENT!</span> ⏰
                      </p>
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-black text-sm md:text-xl px-6 md:px-10 py-2 md:py-4 rounded-full shadow-[0_0_20px_rgba(255,165,0,0.6)] transform group-hover:scale-105 transition-all duration-300 border-2 border-yellow-300">
                         👉 CLICK HERE TO CLAIM 👈
                      </div>`;

c = c.replace(oldPromo, newPromo);

fs.writeFileSync('src/AdvertisementBanner.tsx', c);
console.log('Patched banner');
