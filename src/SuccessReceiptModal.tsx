import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Copy, Check, MessageSquare, X, DollarSign, Tag, Info, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface SuccessReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  receipt: {
    txId?: string;
    title: string;
    category: string;
    priceUSD: number;
    details: Record<string, any>;
  } | null;
}

export default function SuccessReceiptModal({ isOpen, onClose, lang, receipt }: SuccessReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const handleCopy = () => {
    const detailsString = Object.entries(receipt.details)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");

    const textToCopy = `🧾 ORDER RECEIPT\n-----------------------\n📂 Item: ${receipt.title}\n🏷️ Category: ${receipt.category}\n💰 Price: $${receipt.priceUSD.toFixed(2)} USD\n${receipt.txId ? `🧾 Transaction ID: ${receipt.txId}\n` : ""}\nDETAILS:\n${detailsString}\n-----------------------\nThank you for choosing us!`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(lang === "bn" ? "রিসিপ্ট কপি করা হয়েছে!" : "Receipt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate pre-filled WhatsApp message for support/instant delivery
  const detailsStringMsg = Object.entries(receipt.details)
    .map(([key, val]) => `• ${key}: ${val}`)
    .join("\n");

  const waMsg = `আসসালামু আলাইকুম, আমি এই মাত্র আপনার ওয়েবসাইট থেকে ব্যালেন্স দিয়ে এই প্রোডাক্টটি কিনেছি:\n\n📂 প্রোডাক্ট: ${receipt.title}\n💰 মূল্য: $${receipt.priceUSD.toFixed(2)} USD\n${receipt.txId ? `🧾 ট্রানজেকশন আইডি: ${receipt.txId}\n` : ""}\nডিটেইলস:\n${detailsStringMsg}\n\nদয়া করে আমার সার্ভিসটি দ্রুত প্রসেস/ডেলিভারি করে দিন। ধন্যবাদ!`;
  const waUrl = `https://wa.me/8801644627304?text=${encodeURIComponent(waMsg)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10 flex flex-col"
          >
            {/* Success Confetti/Glance Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-center text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="inline-flex items-center justify-center bg-white text-emerald-500 p-3.5 rounded-full shadow-lg shadow-emerald-950/20 mb-3"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>

              <h3 className="text-xl font-black tracking-tight font-sans">
                {lang === "bn" ? "অর্ডার সম্পন্ন হয়েছে!" : "Order Placed Successfully!"}
              </h3>
              <p className="text-white/85 text-xs font-semibold mt-1">
                {lang === "bn" ? "আপনার ব্যালেন্স থেকে মূল্য কেটে নেওয়া হয়েছে।" : "Amount deducted from your account wallet balance."}
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Product Title and Category */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{receipt.category}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight font-sans">
                  {receipt.title}
                </h4>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {lang === "bn" ? "মূল্য (USD)" : "Amount Paid"}
                  </span>
                  <span className="text-lg font-black text-emerald-600 flex items-center">
                    <DollarSign className="w-4.5 h-4.5 -mr-0.5" />
                    {receipt.priceUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Specifications Table */}
              <div className="space-y-2.5">
                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  {lang === "bn" ? "অর্ডারের বিবরণ" : "Order Specifications"}
                </h5>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {receipt.txId && (
                    <div className="flex items-center justify-between px-4 py-3 text-xs">
                      <span className="text-slate-500 font-semibold dark:text-slate-400">Transaction ID</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white select-all bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                        {receipt.txId}
                      </span>
                    </div>
                  )}

                  {Object.entries(receipt.details).map(([key, val]) => {
                    if (key === "Instructions") return null; // Rendered separately for rich UI
                    return (
                      <div key={key} className="flex items-start justify-between px-4 py-3 text-xs gap-4">
                        <span className="text-slate-500 font-semibold dark:text-slate-400 shrink-0">{key}</span>
                        <span className="font-bold text-slate-800 dark:text-white text-right break-all">
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Banner if available */}
              {receipt.details.Instructions && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex gap-3 text-left">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h6 className="text-xs font-extrabold text-blue-800 dark:text-blue-300">
                      {lang === "bn" ? "পরবর্তী করনীয় ও নির্দেশাবলি" : "Next Steps & Instructions"}
                    </h6>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400/90 leading-relaxed font-semibold">
                      {receipt.details.Instructions}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
              {/* WhatsApp Activation Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-2xl font-black text-xs transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer border-b-2 border-emerald-800"
              >
                <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
                <span>
                  {lang === "bn" 
                    ? "হোয়াটসঅ্যাপে আমাদের জানান (দ্রুত অ্যাক্টিভেশন)" 
                    : "Send details to WhatsApp (Fast Activation)"}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </a>

              {/* Copy Receipt / Close Secondary actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{lang === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" />
                      <span>{lang === "bn" ? "রিসিপ্ট কপি করুন" : "Copy Receipt"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs transition text-center cursor-pointer"
                >
                  {lang === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
