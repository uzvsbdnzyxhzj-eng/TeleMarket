import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import toast from "react-hot-toast";
import { Image, Upload, Info } from "lucide-react";

export default function AdminDashboardButtons() {
  const [buttonConfig, setButtonConfig] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "dashboard_buttons"), (docSnap) => {
      if (docSnap.exists()) {
        setButtonConfig(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (key: string, value: string) => {
    setButtonConfig((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        imageUrl: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "dashboard_buttons"), buttonConfig, { merge: true });
      toast("Dashboard button images saved successfully!");
    } catch (err: any) {
      toast("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const BUTTONS = [
    { key: "social", label: "Social Media & Messaging Service" },
    { key: "games", label: "Games Service" },
    { key: "streaming", label: "Streaming, Audio & Video" },
    { key: "regional", label: "Regional & Short Video" },
    { key: "ecommerce", label: "Web Traffic & E-commerce" },
    { key: "buy_telegram", label: "Buy Telegram Account" },
    { key: "sell_telegram", label: "Sell Telegram Account" },
    { key: "topup", label: "FUNDS (Topup)" },
    { key: "withdraw", label: "CASH OUT (Withdraw)" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="flex items-center gap-3 p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
          <Image className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Dashboard Button Backgrounds</h2>
          <p className="text-sm text-gray-500">
            Add background images to the dashboard buttons. Recommended size: at least 400x200px (landscape).
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start mb-6 border border-blue-100">
           <Info className="w-5 h-5 shrink-0 text-blue-600" />
           <div>
              <strong>Pro Tip:</strong> 
              <br />Upload an image from your device or paste a direct image URL. Keep file sizes small (ideally under 500KB) for fast loading times. The image will cover the button background with a darkened overlay so text remains readable.
           </div>
        </div>

        <div className="space-y-4">
          {BUTTONS.map((btn) => (
            <div key={btn.key} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
              <label className="text-sm font-medium text-gray-700 sm:w-1/3 leading-tight">
                {btn.label}
              </label>
              <div className="flex-1 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition min-w-0"
                  value={buttonConfig[btn.key]?.imageUrl || ""}
                  onChange={(e) => handleChange(btn.key, e.target.value)}
                />
                <label className="cursor-pointer shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 1024 * 1024) {
                          toast("Image is too large. Limit is 1MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleChange(btn.key, reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>
              {buttonConfig[btn.key]?.imageUrl && (
                 <div className="w-12 h-8 rounded shrink-0 overflow-hidden bg-gray-100 hidden sm:block border border-gray-200">
                    <img src={buttonConfig[btn.key]?.imageUrl} alt="" className="w-full h-full object-cover" />
                 </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Save Images
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
