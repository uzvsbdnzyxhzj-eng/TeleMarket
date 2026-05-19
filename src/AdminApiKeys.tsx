import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "react-hot-toast";

export default function AdminApiKeys() {
  const [keys, setKeys] = useState({
    paymentlyApiKey: "",
    cryptomusMerchantId: "",
    cryptomusPaymentKey: "",
    binanceApiKey: "",
    binanceSecretKey: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const docRef = doc(db, "settings", "api_keys");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setKeys({
            paymentlyApiKey: data.paymentlyApiKey || "",
            cryptomusMerchantId: data.cryptomusMerchantId || "",
            cryptomusPaymentKey: data.cryptomusPaymentKey || "",
            binanceApiKey: data.binanceApiKey || "",
            binanceSecretKey: data.binanceSecretKey || "",
          });
        }
      } catch (err) {
        console.error("Error fetching API keys", err);
      }
    };
    fetchKeys();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "settings", "api_keys");
      await setDoc(docRef, keys, { merge: true });
      toast.success("API keys saved successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save API keys");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800">Payment API Keys</h3>
        <p className="text-xs text-gray-500 mt-1">Configure your payment gateways here.</p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paymently API Key (bKash/Nagad)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={keys.paymentlyApiKey}
            onChange={(e) => setKeys({ ...keys, paymentlyApiKey: e.target.value })}
            placeholder="e.g. tmK3Qhnqo3..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cryptomus Merchant ID
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={keys.cryptomusMerchantId}
            onChange={(e) => setKeys({ ...keys, cryptomusMerchantId: e.target.value })}
            placeholder="e.g. 5d5a..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cryptomus Payment Key
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={keys.cryptomusPaymentKey}
            onChange={(e) => setKeys({ ...keys, cryptomusPaymentKey: e.target.value })}
            placeholder="e.g. 8f6b..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Binance API Key
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={keys.binanceApiKey}
            onChange={(e) => setKeys({ ...keys, binanceApiKey: e.target.value })}
            placeholder="Binance API Key"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Binance Secret Key
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={keys.binanceSecretKey}
            onChange={(e) => setKeys({ ...keys, binanceSecretKey: e.target.value })}
            placeholder="Binance Secret Key"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Save API Keys"}
        </button>
      </div>
    </div>
  );
}
