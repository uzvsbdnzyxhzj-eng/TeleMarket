import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { Clock, Plus, MonitorPlay, AlertTriangle } from "lucide-react";

export default function MyAdsProfile({ currentUser, onNavigate }: { currentUser: any, onNavigate: (v: string) => void }) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [extendingAd, setExtendingAd] = useState<string | null>(null);
  const [extendPlanFor, setExtendPlanFor] = useState<{ [adId: string]: number }>({});

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, "ads"), where("userId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleExtend = async (ad: any) => {
      const plans = [
        { months: 1, price: 27 },
        { months: 4, price: 78 },
        { months: 8, price: 132 },
        { months: 12, price: 180 },
      ];
    
    const selectedMonths = extendPlanFor[ad.id] || ad.planMonths || 1;
    const plan = plans.find(p => p.months === selectedMonths) || plans[0];
    
    if (confirm(`Do you want to extend this ad for another ${plan.months} month(s) for $$plan.price?`)) {
      if (currentUser.balanceUSD < plan.price) {
        alert("Insufficient balance! Please top up to extend.");
        onNavigate("profile");
        return;
      }

      setExtendingAd(ad.id);
      try {
        await updateDoc(doc(db, "users", currentUser.uid), { 
          balanceUSD: increment(-plan.price),
          total_spent: increment(plan.price),
          last_update: Date.now()
        });

        const txId = Date.now().toString() + "-" + Math.random().toString(36).substring(7);
        await setDoc(doc(db, "transactions", txId), {
          userId: currentUser.uid,
          type: "buy",
          amountUSD: plan.price,
          status: "OK",
          description: `Ad Extension - ${plan.months} Month(s)`,
          createdAt: Date.now()
        });

        // Ensure we add duration to either now (if expired) or the current expiration
        const baseTime = ad.expiresAt > Date.now() ? ad.expiresAt : Date.now();
        const newExpiresAt = baseTime + (plan.months * 30 * 24 * 60 * 60 * 1000);
        await updateDoc(doc(db, "ads", ad.id), {
          expiresAt: newExpiresAt,
          isActive: true,
          planMonths: plan.months,  // update plan length
          price: plan.price
        });

        alert("Ad extended successfully!");
      } catch (e: any) {
        alert("Error extending ad: " + e.message);
      } finally {
        setExtendingAd(null);
      }
    }
  };

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 mb-6">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-indigo-500" /> My Advertisements
        </h3>
        <button onClick={() => onNavigate("post-ad")} className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-md font-bold hover:bg-indigo-100 transition shadow-sm flex items-center gap-1">
          <Plus className="w-3 h-3" /> New Campaign
        </button>
      </div>

      {ads.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <MonitorPlay className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium mb-1">No active advertisements</p>
          <p className="text-sm text-gray-400 mb-4">You haven't posted any advertisements yet.</p>
          <button onClick={() => onNavigate("post-ad")} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Advertisement
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {ads.map((ad: any) => {
          const remainingMs = ad.expiresAt - Date.now();
          const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
          const remainingMonths = Math.floor(remainingDays / 30);
          const isExpired = remainingMs <= 0;
          const isExpiringSoon = !isExpired && remainingDays <= 7;

          let displayTime = "";
          if (isExpired) displayTime = "Expired";
          else if (remainingMonths >= 1) displayTime = `${remainingMonths} month${remainingMonths > 1 ? 's' : ''} left`;
          else displayTime = `${remainingDays} day${remainingDays > 1 ? 's' : ''} left`;

          return (
            <div key={ad.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:bg-gray-50/50 transition">
              <div className="w-full sm:w-48 h-24 bg-black rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-inner">
                <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between h-full py-1">
                <div>
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline mb-1 truncate block max-w-[250px] md:max-w-xs text-sm">
                    {ad.linkUrl}
                  </a>
                  <p className="text-xs text-gray-500">Plan: {ad.planMonths} Month(s)</p>
                </div>
                
                <div className="mt-3 flex items-center justify-between sm:justify-start sm:gap-4">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : 'text-emerald-600'}`}>
                    <Clock className="w-4 h-4" />
                    {displayTime}
                  </div>

                  {(isExpiringSoon || isExpired) && (
                    <div className="flex items-center gap-2">
                      <select 
                        value={extendPlanFor[ad.id] || ad.planMonths || 1}
                        onChange={(e) => setExtendPlanFor({...extendPlanFor, [ad.id]: Number(e.target.value)})}
                        className="text-xs border border-gray-300 rounded-md px-2 py-1 outline-none"
                      >
                        <option value={1}>1 Month ($27)</option>
                        <option value={4}>4 Months ($78)</option>
                        <option value={8}>8 Months ($132)</option>
                        <option value={12}>12 Months ($180)</option>
                      </select>
                      <button
                        onClick={() => handleExtend(ad)}
                        disabled={extendingAd === ad.id}
                        className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                      >
                        {extendingAd === ad.id ? "Working..." : "Renew"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {isExpired && (
                <div className="absolute top-4 right-4 sm:static sm:mr-2 text-red-500 bg-red-50 p-2 rounded-full hidden">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </motion.div>
  );
}
