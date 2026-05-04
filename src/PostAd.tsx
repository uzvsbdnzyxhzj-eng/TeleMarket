import React, { useState } from "react";
import { motion } from "motion/react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { ArrowLeft, CheckCircle, ChevronRight, Image as ImageIcon, Link as LinkIcon, DollarSign } from "lucide-react";

interface PostAdProps {
  balanceUSD: number;
  onNavigate: (view: any) => void;
  uid: string;
}

const PLANS = [
  { months: 1, price: 30, discountText: "10% OFF", finalPrice: 27 },
  { months: 4, price: 120, discountText: "25% OFF", finalPrice: 78 },
  { months: 8, price: 240, discountText: "35% OFF", finalPrice: 132 },
  { months: 12, price: 360, discountText: "50% OFF", finalPrice: 180 },
];

export default function PostAd({ balanceUSD, onNavigate, uid }: PostAdProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<number>(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [is18PlusConfirmed, setIs18PlusConfirmed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setUploadError("Image is too large. Please upload an image smaller than 500KB.");
        return;
      }
      setUploadError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Enforce 1200x400
          if (img.width !== 1200 || img.height !== 400) {
            setUploadError("Image must be exactly 1200x400 pixels.");
            setImageUrl("");
            return;
          }
          setImageUrl(reader.result as string);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const plan = PLANS.find(p => p.months === selectedPlan)!;

  const handlePostAd = async () => {
    if (!imageUrl) {
      alert("Please upload your ad image.");
      return;
    }
    if (!linkUrl) {
      alert("Please provide a target link URL.");
      return;
    }
    if (!is18PlusConfirmed) {
      alert("Please confirm that your ad does not contain 18+ or explicit content.");
      return;
    }
    
    setIsPublishing(true);
    try {
      if (balanceUSD < plan.finalPrice) {
        alert("Insufficient balance! Please top up your account to post this ad.");
        onNavigate("profile");
        setIsPublishing(false);
        return;
      }

      // 1. Deduct balance from user
      const newBalance = balanceUSD - plan.finalPrice;
      await updateDoc(doc(db, "users", uid), {
        balanceUSD: newBalance,
        total_spent: increment(plan.finalPrice),
        last_update: Date.now()
      });

      // 2. Add transaction record
      const txId = Date.now().toString() + "-" + Math.random().toString(36).substring(7);
      await setDoc(doc(db, "transactions", txId), {
        userId: uid,
        type: "buy", // using buy for purchases
        txType: "Debit",
        amountUSD: plan.finalPrice,
        status: "OK",
        description: `Ad Banner - ${plan.months} Month(s)`,
        createdAt: Date.now()
      });

      // 3. Create the ad document
      const adId = "ad-" + Date.now().toString() + "-" + Math.random().toString(36).substring(7);
      const now = Date.now();
      const expiresAt = now + (plan.months * 30 * 24 * 60 * 60 * 1000); // approx months

      await setDoc(doc(db, "ads", adId), {
        userId: uid,
        imageUrl,
        linkUrl,
        planMonths: plan.months,
        price: plan.finalPrice,
        createdAt: now,
        expiresAt: expiresAt,
        isActive: true,
      });

      alert("Ad posted successfully!");
      onNavigate("profile");
    } catch (e: any) {
      alert("Error posting ad: " + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto p-4 sm:p-6 mb-20"
    >
      <button
        onClick={() => onNavigate("dashboard")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-100 border border-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 tracking-tight">Create Your Ad Campaign</h2>

        {/* Step 1: Creative */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md">1</span> 
            Ad Creative
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image (Max 500KB)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ad-image-upload"
                />
                <label 
                  htmlFor="ad-image-upload"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-indigo-200 rounded-2xl cursor-pointer bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 group-hover:shadow-inner"
                >
                  <ImageIcon className="w-10 h-10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm text-gray-600 font-medium text-center px-4">Click to browse or drag image<br/><span className="text-xs text-gray-400 mt-1 block">(Mandatory size: exactly 1200x400 pixels)</span></span>
                </label>
              </div>
              {uploadError && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded-lg border border-red-100">{uploadError}</p>}
            </div>

            <div className="flex flex-col justify-end">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="pl-11 w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-indigo-300"
                />
              </div>
            </div>
          </div>
          
          {imageUrl && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-8 pl-11"
            >
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Ad Preview</p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-black p-2 shadow-xl shadow-black/10 flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="w-[1200px] max-w-full h-auto object-contain rounded-xl" />
              </div>
            </motion.div>
          )}

          <div className="mt-6 pl-11 flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <input 
              type="checkbox" 
              id="adult-content-warning"
              checked={is18PlusConfirmed}
              onChange={(e) => setIs18PlusConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer accent-red-600"
            />
            <label htmlFor="adult-content-warning" className="text-sm text-red-900 cursor-pointer">
              <span className="font-extrabold uppercase tracking-wider text-red-700 mr-1">Strict Rules:</span> I confirm that this advertisement does NOT contain any 18+, adult, or illegal content. I understand that violation will result in a permanent ban and loss of funds.
            </label>
          </div>
        </div>

        {/* Step 2: Duration & Pricing */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md">2</span> 
            Duration & Plan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pl-11">
            {PLANS.map((p) => (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={p.months}
                onClick={() => setSelectedPlan(p.months)}
                className={`relative cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 ${selectedPlan === p.months ? 'border-indigo-600 bg-indigo-50/80 shadow-xl shadow-indigo-200/50' : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-lg'}`}
              >
                {selectedPlan === p.months && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="absolute top-4 right-4 text-indigo-600 z-10"
                  >
                    <CheckCircle className="w-6 h-6 fill-current text-white" />
                  </motion.div>
                )}
                {p.discountText && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md transform rotate-3">
                    {p.discountText}
                  </div>
                )}
                <div className="text-center relative z-0">
                  <p className="font-extrabold text-gray-800 text-lg sm:text-xl mb-1">{p.months} {p.months === 1 ? 'Month' : 'Months'}</p>
                  
                  <div className="flex flex-col items-center justify-center gap-1 mt-3">
                    {p.discountText ? (
                      <span className="text-gray-400 line-through text-sm font-medium">${p.price}</span>
                    ) : ( <span className="h-5"></span> )}
                    <span className={`text-3xl font-black ${selectedPlan === p.months ? 'text-indigo-700' : 'text-indigo-600'}`}>${p.finalPrice}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary & Checkout */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 ml-0 sm:ml-11">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-200 pb-6">
            <div className="w-full sm:w-auto text-center sm:text-left p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex-1">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-2"><DollarSign className="w-4 h-4" /> Your Balance</p>
              <p className={`text-2xl font-black ${balanceUSD < plan.finalPrice ? 'text-red-500' : 'text-green-600'}`}>
                ${balanceUSD.toFixed(2)}
              </p>
            </div>
            <div className="w-full sm:w-auto text-center sm:text-right p-4 bg-indigo-600 text-white rounded-xl shadow-md flex-1">
              <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1 opacity-90">Total Cost</p>
              <p className="text-3xl font-black">${plan.finalPrice}</p>
            </div>
          </div>
          
          <button
            onClick={handlePostAd}
            disabled={isPublishing || !imageUrl || !linkUrl}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-xl
              ${(isPublishing || !imageUrl || !linkUrl) ? 'opacity-50 cursor-not-allowed hidden shadow-none' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right hover:scale-[1.01]'}
            `}
            style={{ display: (!imageUrl || !linkUrl) ? 'none' : 'flex' }}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : "Pay & Post Ad Now"} 
            {!isPublishing && <ChevronRight className="w-5 h-5 ml-1" />}
          </button>
          
          {(!imageUrl || !linkUrl) && (
            <button className="w-full py-4 rounded-xl font-bold text-lg text-gray-500 bg-gray-200/50 border border-gray-300 border-dashed cursor-not-allowed">
              Fill Ad Details to Proceed
            </button>
          )}

          {balanceUSD < plan.finalPrice && imageUrl && linkUrl && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-red-500 font-bold mt-5 text-sm p-3 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Insufficient balance. You will be redirected to top up.
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
