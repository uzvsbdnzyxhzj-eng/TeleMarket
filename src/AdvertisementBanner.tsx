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
    }, 3000);
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
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  setCurrentIndex((prev) => (prev + 1) % banners.length);
                } else if (swipe > swipeConfidenceThreshold) {
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
                      <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-black italic tracking-wider mb-2 drop-shadow-md">
                        PROMOTE YOUR BRAND WITH US
                      </h2>
                      <p className="text-white/95 text-sm md:text-xl lg:text-2xl font-bold max-w-2xl mx-auto mb-4 md:mb-6 drop-shadow-sm">
                        Advertise Your Shop, Website, or Anything Else on Our Platform.
                      </p>
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-sm md:text-lg px-6 md:px-10 py-2.5 md:py-4 rounded-full shadow-xl shadow-orange-500/40 transform group-hover:-translate-y-1 group-hover:shadow-orange-500/60 transition-all duration-300 border border-orange-400">
                        Click Here to Post Your Ad
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
