import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { motion, AnimatePresence } from "motion/react";

export default function AdvertisementBanner() {
  const [banner, setBanner] = useState({ imageUrl: "", linkUrl: "", isActive: false });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "banner"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBanner({
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          isActive: data.isActive || false,
        });
      }
    }, (error) => console.error("banner onSnapshot error", error));
    return () => unsub();
  }, []);

  if (!banner.isActive || !banner.imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="w-full bg-gray-100 relative overflow-hidden"
      >
        <a 
          href={banner.linkUrl || "#"} 
          target={banner.linkUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="block w-full"
          onClick={(e) => {
            if (!banner.linkUrl) e.preventDefault();
          }}
        >
          <img 
            src={banner.imageUrl} 
            alt="Advertisement" 
            className="w-full h-auto min-h-[100px] max-h-[500px] object-cover sm:object-cover bg-transparent mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
