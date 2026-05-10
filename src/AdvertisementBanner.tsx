import React, { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { motion, AnimatePresence } from "motion/react";

interface Banner {
  imageUrl: string;
  linkUrl: string;
  isInternal?: boolean;
}

export default function AdvertisementBanner({ onPostAdClick }: { onPostAdClick?: () => void }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let adminBanners: Banner[] = [];
    let userAds: Banner[] = [];

    const unsubAdmin = onSnapshot(doc(db, "settings", "banner"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isActive) {
           adminBanners = data.banners || [];
           if (adminBanners.length === 0 && data.imageUrl) {
             adminBanners = [{ imageUrl: data.imageUrl, linkUrl: data.linkUrl || "" }];
           }
        } else {
           adminBanners = [];
        }
        updateBanners();
      }
    });

    const unsubAds = onSnapshot(query(collection(db, "ads"), where("isActive", "==", true)), (querySnapshot) => {
      userAds = [];
      const now = Date.now();
      querySnapshot.forEach((docSnap) => {
        const ad = docSnap.data();
        if (ad.expiresAt > now) {
          userAds.push({ imageUrl: ad.imageUrl, linkUrl: ad.linkUrl });
        }
      });
      updateBanners();
    });

    function updateBanners() {
      const internalBanner: Banner = {
        imageUrl: "internal_promo",
        linkUrl: "",
        isInternal: true
      };
      setBanners([...userAds, ...adminBanners, internalBanner]);
    }

    return () => {
      unsubAdmin();
      unsubAds();
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const safeIndex = currentIndex >= banners.length ? 0 : currentIndex;
  const currentBanner = banners[safeIndex];

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="w-full relative overflow-hidden"
      >
        <div className="relative w-full shadow-lg border-b border-gray-200 bg-black">
          <AnimatePresence mode="wait">
            <motion.a 
              key={safeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              drag={banners.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -30) {
                  setCurrentIndex((prev) => (prev + 1) % banners.length);
                } else if (offset.x > 30) {
                  setCurrentIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1);
                }
              }}
              href={currentBanner.isInternal ? "#" : (currentBanner.linkUrl || "#")} 
              target={(!currentBanner.isInternal && currentBanner.linkUrl) ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block w-full"
              onClick={(e) => {
                if (currentBanner.isInternal) {
                  e.preventDefault();
                  if (onPostAdClick) onPostAdClick();
                } else if (!currentBanner.linkUrl) {
                  e.preventDefault();
                }
              }}
            >
              <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-black overflow-hidden relative group rounded-xl shadow-sm border border-gray-100">
                {currentBanner.imageUrl === "internal_promo" ? (
                  <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex flex-col items-center justify-center p-4 text-center transition duration-300 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
                      <h2 className="text-yellow-300 text-2xl md:text-4xl lg:text-5xl font-black italic tracking-wider mb-1 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2">
                        🔥 SPECIAL OFFER 🔥
                      </h2>
                      <div className="bg-red-600/90 border-2 border-yellow-400 text-white px-4 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.6)] mb-2 md:mb-4">
                        <span className="font-extrabold text-lg md:text-2xl tracking-widest text-yellow-300 drop-shadow-md">UP TO 79% OFF! 🎉</span>
                      </div>
                      <p className="text-white/95 text-xs md:text-lg lg:text-xl font-bold max-w-2xl mx-auto mb-3 md:mb-5 drop-shadow-sm leading-tight md:leading-normal">
                        Boost your business & get insane discounts on Advertising! 🚀<br className="hidden md:block"/> Hurry up, this is a <span className="text-yellow-300 underline decoration-red-500 decoration-2">LIMITED TIME EVENT!</span> ⏰
                      </p>
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-black text-sm md:text-xl px-6 md:px-10 py-2 md:py-4 rounded-full shadow-[0_0_20px_rgba(255,165,0,0.6)] transform group-hover:scale-105 transition-all duration-300 border-2 border-yellow-300">
                         👉 CLICK HERE TO CLAIM 👈
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={currentBanner.imageUrl} 
                      alt={`Advertisement ${safeIndex + 1}`} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {currentBanner.isInternal && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">Click to Post Your Ad</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.a>
          </AnimatePresence>

          {banners.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === safeIndex ? 'bg-indigo-600 scale-125 shadow' : 'bg-white/80 hover:bg-white border border-gray-300/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
