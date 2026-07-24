import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Globe, Search, Copy, Clock, Loader2, RefreshCw, 
  CheckCircle, XCircle, AlertCircle, ArrowLeft, History, 
  MessageSquare, Key, Sparkles, Hash
} from "lucide-react";
import toast from "react-hot-toast";
import { formatValueWithCurrency } from "./currencies";

interface VirtualNumbersProps {
  currentUser: any;
  onNavigate: (view: string) => void;
  balanceUSD: number;
  lang?: string;
  displayCurrency?: string;
}

const getServiceBrand = (code: string, name: string) => {
  const codeLower = code.toLowerCase();
  const nameLower = name.toLowerCase();

  let domain: string | undefined = undefined;

  if (codeLower === "wa" || nameLower.includes("whatsapp")) {
    return {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      activeBg: "bg-emerald-600 text-white border-emerald-600",
      icon: "💬",
      color: "#25D366",
      domain: "whatsapp.com"
    };
  }
  if (codeLower === "tg" || nameLower.includes("telegram")) {
    return {
      bg: "bg-sky-50 text-sky-600 border-sky-100",
      activeBg: "bg-sky-600 text-white border-sky-600",
      icon: "✈️",
      color: "#24A1DE",
      domain: "telegram.org"
    };
  }
  if (codeLower === "go" || nameLower.includes("google") || nameLower.includes("gmail")) {
    return {
      bg: "bg-red-50 text-red-600 border-red-100",
      activeBg: "bg-red-600 text-white border-red-600",
      icon: "📧",
      color: "#EA4335",
      domain: "google.com"
    };
  }
  if (codeLower === "fb" || nameLower.includes("facebook")) {
    return {
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      activeBg: "bg-blue-600 text-white border-blue-600",
      icon: "👥",
      color: "#1877F2",
      domain: "facebook.com"
    };
  }
  if (codeLower === "tl" || nameLower.includes("tiktok") || nameLower.includes("tik tok")) {
    return {
      bg: "bg-zinc-50 text-zinc-800 border-zinc-200",
      activeBg: "bg-zinc-900 text-white border-zinc-900",
      icon: "🎵",
      color: "#010101",
      domain: "tiktok.com"
    };
  }
  if (codeLower === "imo" || nameLower.includes("imo")) {
    return {
      bg: "bg-cyan-50 text-cyan-600 border-cyan-100",
      activeBg: "bg-cyan-600 text-white border-cyan-600",
      icon: "📞",
      color: "#00A2E8",
      domain: "imo.im"
    };
  }
  if (codeLower === "sc" || nameLower.includes("snapchat")) {
    return {
      bg: "bg-yellow-50 text-yellow-700 border-yellow-200",
      activeBg: "bg-yellow-500 text-slate-900 border-yellow-500",
      icon: "👻",
      color: "#FFFC00",
      domain: "snapchat.com"
    };
  }
  if (codeLower === "vi" || nameLower.includes("viber")) {
    return {
      bg: "bg-purple-50 text-purple-600 border-purple-100",
      activeBg: "bg-purple-600 text-white border-purple-600",
      icon: "💜",
      color: "#7360F2",
      domain: "viber.com"
    };
  }
  if (codeLower === "nf" || nameLower.includes("netflix")) {
    return {
      bg: "bg-red-50 text-red-700 border-red-100",
      activeBg: "bg-red-700 text-white border-red-700",
      icon: "🎬",
      color: "#E50914",
      domain: "netflix.com"
    };
  }
  if (codeLower === "mc" || nameLower.includes("microsoft")) {
    return {
      bg: "bg-blue-50 text-blue-500 border-blue-100",
      activeBg: "bg-blue-500 text-white border-blue-500",
      icon: "💻",
      color: "#00A4EF",
      domain: "microsoft.com"
    };
  }
  if (codeLower === "nk" || nameLower.includes("nike")) {
    return {
      bg: "bg-gray-50 text-gray-800 border-gray-200",
      activeBg: "bg-gray-800 text-white border-gray-800",
      icon: "✔️",
      color: "#000000",
      domain: "nike.com"
    };
  }
  if (codeLower === "am" || nameLower.includes("amazon")) {
    return {
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      activeBg: "bg-amber-600 text-white border-amber-600",
      icon: "📦",
      color: "#FF9900",
      domain: "amazon.com"
    };
  }
  if (codeLower === "ig" || nameLower.includes("instagram")) {
    return {
      bg: "bg-pink-50 text-pink-600 border-pink-100",
      activeBg: "bg-pink-600 text-white border-pink-600",
      icon: "📸",
      color: "#E1306C",
      domain: "instagram.com"
    };
  }
  if (codeLower === "tw" || nameLower.includes("twitter") || nameLower.includes(" x ")) {
    return {
      bg: "bg-slate-50 text-slate-800 border-slate-200",
      activeBg: "bg-slate-950 text-white border-slate-950",
      icon: "🐦",
      color: "#1DA1F2",
      domain: "x.com"
    };
  }
  if (codeLower === "ub" || nameLower.includes("uber")) {
    return {
      bg: "bg-gray-50 text-gray-800 border-gray-200",
      activeBg: "bg-gray-900 text-white border-gray-900",
      icon: "🚗",
      color: "#000000",
      domain: "uber.com"
    };
  }
  if (codeLower === "sp" || nameLower.includes("spotify")) {
    return {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      activeBg: "bg-emerald-600 text-white border-emerald-600",
      icon: "🎵",
      color: "#1DB954",
      domain: "spotify.com"
    };
  }

  // Dynamic guessing
  const cleanName = nameLower.replace(/[^a-z0-9]/g, "");
  if (cleanName.length > 2) {
    domain = `${cleanName}.com`;
  }

  // Fallback
  return {
    bg: "bg-slate-50 text-slate-600 border-slate-100",
    activeBg: "bg-slate-600 text-white border-slate-600",
    icon: "🔑",
    color: "#64748B",
    domain
  };
};

export default function VirtualNumbers({ 
  currentUser, 
  onNavigate, 
  balanceUSD, 
  lang = "en", 
  displayCurrency = "USD" 
}: VirtualNumbersProps) {
  const isBn = lang === "bn";

  // State managers
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [searchCountry, setSearchCountry] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [allCountryServices, setAllCountryServices] = useState<Record<string, any[]>>({});
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchService, setSearchService] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);

  const [activeTab, setActiveTab] = useState<"order" | "active" | "history">("order");
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Poll reference map to clear intervals when component unmounts or status completes
  const pollIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  const formatCurrency = (amountUSD: number) => {
    return formatValueWithCurrency(amountUSD, displayCurrency);
  };

  // Convert Telekos IDR to local USD price
  const convertIdrToUsd = (priceIDR: number) => {
    return Math.ceil((priceIDR / 12000) * 100) / 100;
  };

  const getSelectedServicePriceUSD = () => {
    if (!selectedService || !selectedCountry) return 0;
    const countryServices = allCountryServices[selectedCountry.id] || [];
    const serviceInstance = countryServices.find((s) => s.code === selectedService.code);
    if (!serviceInstance) return 0;

    return convertIdrToUsd(serviceInstance.price);
  };

  const getSelectedServiceStock = () => {
    if (!selectedService || !selectedCountry) return 0;
    const countryServices = allCountryServices[selectedCountry.id] || [];
    const serviceInstance = countryServices.find((s) => s.code === selectedService.code);
    if (!serviceInstance) return 0;

    return serviceInstance.stock;
  };

  const getCountriesForSelectedService = () => {
    if (!selectedService) return [];
    return countries
      .map((c) => {
        const countryServices = allCountryServices[c.id] || [];
        const serviceInstance = countryServices.find((s) => s.code === selectedService.code);
        return {
          ...c,
          servicePrice: serviceInstance ? convertIdrToUsd(serviceInstance.price) : 0,
          serviceStock: serviceInstance ? serviceInstance.stock : 0,
        };
      })
      .filter((c) => c.serviceStock > 0);
  };

  // Initial Fetch
  useEffect(() => {
    fetchGlobalData();
    if (currentUser) {
      fetchHistory();
    }
    return () => {
      // Clean up all status pollers
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, [currentUser]);

  const fetchGlobalData = async () => {
    setLoadingCountries(true);
    setLoadingServices(true);
    try {
      // 1. Fetch countries
      const res = await fetch("/api/telekos/countries");
      const data = await res.json();
      if (data.ok && data.countries) {
        const countryList = data.countries;
        setCountries(countryList);

        // 2. Fetch services for all countries in parallel
        const servicePromises = countryList.map(async (c: any) => {
          try {
            const sRes = await fetch(`/api/telekos/services?country=${c.id}`);
            const sData = await sRes.json();
            if (sData.ok && sData.services) {
              return { countryId: c.id, services: sData.services };
            }
          } catch (err) {
            console.error(`Failed to fetch services for country ${c.id}:`, err);
          }
          return { countryId: c.id, services: [] };
        });

        const results = await Promise.all(servicePromises);
        const serviceMap: Record<string, any[]> = {};
        const serviceAggregates: Record<string, { code: string; name: string; totalStock: number; minPrice: number }> = {};

        results.forEach((r) => {
          serviceMap[r.countryId] = r.services;
          r.services.forEach((s: any) => {
            const priceUSD = convertIdrToUsd(s.price);
            if (!serviceAggregates[s.code]) {
              serviceAggregates[s.code] = {
                code: s.code,
                name: s.name,
                totalStock: s.stock,
                minPrice: priceUSD,
              };
            } else {
              serviceAggregates[s.code].totalStock += s.stock;
              if (priceUSD < serviceAggregates[s.code].minPrice) {
                serviceAggregates[s.code].minPrice = priceUSD;
              }
            }
          });
        });

        setAllCountryServices(serviceMap);

        // Convert aggregates to a sorted array (by total stock desc)
        const sortedGlobalServices = Object.values(serviceAggregates).sort((a, b) => b.totalStock - a.totalStock);
        setGlobalServices(sortedGlobalServices);
      } else {
        toast.error(isBn ? "দেশ তালিকা লোড করতে ব্যর্থ হয়েছে" : "Failed to load countries");
      }
    } catch (e) {
      console.error(e);
      toast.error(isBn ? "সার্ভার সংযোগ ত্রুটি" : "Server connection error");
    } finally {
      setLoadingCountries(false);
      setLoadingServices(false);
    }
  };

  const fetchHistory = async () => {
    if (!currentUser?.uid) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/telekos/orders/${currentUser.uid}`);
      const data = await res.json();
      if (data.ok && data.orders) {
        const list = data.orders;
        // Separate active (waiting) orders vs finished orders
        const active = list.filter((o: any) => o.status === "waiting");
        const finished = list.filter((o: any) => o.status !== "waiting");
        setActiveOrders(active);
        setPastOrders(finished);

        // Auto-start pollers for any active waiting orders
        active.forEach((order: any) => {
          startPolling(order.activationId);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Start polling Telekos status API for a specific order
  const startPolling = (activationId: string) => {
    if (pollIntervals.current[activationId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telekos/status/${activationId}?uid=${currentUser.uid}`);
        const data = await res.json();

        if (data.ok) {
          if ((data.state === "ok" || data.state === "sukses") && data.otp) {
            toast.success(isBn ? `ওটিপি কোড এসেছে: ${data.otp}` : `OTP Code received: ${data.otp}`, { duration: 8000 });
            
            // Refresh state
            fetchHistory();
          } else if (data.state === "expired" || data.state === "cancel") {
            clearInterval(pollIntervals.current[activationId]);
            delete pollIntervals.current[activationId];
            
            toast.error(isBn ? "নাম্বারটির সময় শেষ হয়েছে বা বাতিল করা হয়েছে" : "Number expired or cancelled");
            
            // Refresh state
            fetchHistory();
          }
        }
      } catch (e) {
        console.error("Polling error for", activationId, e);
      }
    }, 5000);

    pollIntervals.current[activationId] = interval;
  };

  const requestRetryCode = async (activationId: string) => {
    try {
      const res = await fetch("/api/telekos/retry-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationId, uid: currentUser.uid })
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(data.message || (isBn ? "পরবর্তী ওটিপি অনুরোধ করা হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।" : "Next code requested. Please wait."));
        fetchHistory();
      } else {
        toast.error(data.message || (isBn ? "পরবর্তী কোড অনুরোধ করতে ব্যর্থ হয়েছে" : "Failed to request next code"));
      }
    } catch (e) {
      console.error(e);
      toast.error(isBn ? "যোগাযোগ ত্রুটি" : "Connection error");
    }
  };

  const finishOrder = async (activationId: string) => {
    try {
      const res = await fetch("/api/telekos/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationId, uid: currentUser.uid })
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(isBn ? "অর্ডারটি সফলভাবে সম্পন্ন করা হয়েছে!" : "Order finished successfully!");
        
        if (pollIntervals.current[activationId]) {
          clearInterval(pollIntervals.current[activationId]);
          delete pollIntervals.current[activationId];
        }

        fetchHistory();
      } else {
        toast.error(data.message || (isBn ? "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে" : "Failed to finish order"));
      }
    } catch (e) {
      console.error(e);
      toast.error(isBn ? "যোগাযোগ ত্রুটি" : "Connection error");
    }
  };

  const placeOrder = async () => {
    if (!currentUser) {
      toast.error(isBn ? "দয়া করে প্রথমে লগইন করুন" : "Please login first");
      return;
    }
    if (!selectedCountry || !selectedService) {
      toast.error(isBn ? "অনুগ্রহ করে দেশ ও সার্ভিস নির্বাচন করুন" : "Please select country and service");
      return;
    }

    const priceUSD = getSelectedServicePriceUSD();
    if (balanceUSD < priceUSD) {
      toast.error(isBn ? `পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজন ${formatCurrency(priceUSD)}` : `Insufficient balance. Requires ${formatCurrency(priceUSD)}`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/telekos/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService.code,
          country: selectedCountry.id,
          uid: currentUser.uid,
          userEmail: currentUser.email || ""
        })
      });
      const data = await res.json();

      if (data.ok && data.activationId) {
        toast.success(isBn ? "নাম্বার সফলভাবে কেনা হয়েছে!" : "Number successfully purchased!");
        setActiveTab("active");
        
        // Clear selection to reset order flow
        setSelectedService(null);
        setSelectedCountry(null);

        // Refresh local history and start polling
        await fetchHistory();
      } else {
        toast.error(data.message || (isBn ? "অর্ডার করতে ব্যর্থ হয়েছে" : "Failed to place order"));
      }
    } catch (e) {
      console.error(e);
      toast.error(isBn ? "অর্ডার করার সময় ত্রুটি ঘটেছে" : "Error placing order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const cancelOrder = async (activationId: string) => {
    const confirmCancel = window.confirm(
      isBn 
        ? "আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান? আপনার ব্যালেন্স সাথে সাথে ফেরত দেওয়া হবে।" 
        : "Are you sure you want to cancel this order? Your balance will be refunded immediately."
    );
    if (!confirmCancel) return;

    try {
      const res = await fetch("/api/telekos/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activationId,
          uid: currentUser.uid
        })
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(isBn ? "অর্ডারটি বাতিল করা হয়েছে এবং রিফান্ড করা হয়েছে!" : "Order cancelled and refunded successfully!");
        
        // Stop polling
        if (pollIntervals.current[activationId]) {
          clearInterval(pollIntervals.current[activationId]);
          delete pollIntervals.current[activationId];
        }

        fetchHistory();
      } else {
        toast.error(data.message || (isBn ? "বাতিল করতে ব্যর্থ হয়েছে" : "Failed to cancel order"));
      }
    } catch (e) {
      console.error(e);
      toast.error(isBn ? "যোগাযোগ ত্রুটি" : "Connection error");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isBn ? "কপি করা হয়েছে!" : "Copied to clipboard!");
  };

  // Filter lists
  const filteredGlobalServices = globalServices.filter((s: any) =>
    s.name.toLowerCase().includes(searchService.toLowerCase()) ||
    s.code.toLowerCase().includes(searchService.toLowerCase())
  );

  const filteredCountriesForService = getCountriesForSelectedService().filter((c: any) =>
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
    String(c.id).includes(searchCountry) ||
    c.iso.toLowerCase().includes(searchCountry.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-indigo-50 to-sky-100 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
      {/* Mobile Back Header */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-2 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> {isBn ? "ড্যাশবোর্ডে ফিরুন" : "Back to Dashboard"}
      </button>

      {/* Main Title Banner */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Hash className="w-6 h-6 text-blue-600" />
            {isBn ? "ভেরিফিকেশন ভার্চুয়াল নাম্বার" : "Virtual Number for Verification"}
          </h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {isBn 
              ? "WhatsApp, Telegram, Google, Facebook ইত্যাদির জন্য সাময়িক সচল ওটিপি নাম্বার কিনুন ইনস্ট্যান্টলি।" 
              : "Buy temporary SMS OTP verification numbers for WhatsApp, Telegram, Google, Facebook instantly."}
          </p>
        </div>
        <div className="hidden md:flex bg-blue-50 text-blue-700 px-4 py-2 rounded-lg items-center gap-2 font-medium border border-blue-100">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>{isBn ? "ইনস্ট্যান্ট অ্যাক্টিভেশন" : "Instant Activation"}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab("order")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "order" 
              ? "bg-[#2AABEE] text-white shadow-sm" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Phone className="w-4 h-4" />
          {isBn ? "অর্ডার করুন" : "Order Number"}
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === "active" 
              ? "bg-[#2AABEE] text-white shadow-sm" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          {isBn ? "সচল নাম্বার" : "Active Numbers"}
          {activeOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "history" 
              ? "bg-[#2AABEE] text-white shadow-sm" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <History className="w-4 h-4" />
          {isBn ? "ইতিহাস" : "Order History"}
        </button>
      </div>

      {/* ORDER TAB */}
      {activeTab === "order" && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-sm">
          {/* STEP HEADER */}
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {!selectedService 
                  ? (isBn ? "ধাপ ১: সার্ভিস নির্বাচন" : "Step 1: Select Service") 
                  : !selectedCountry 
                    ? (isBn ? "ধাপ ২: দেশ নির্বাচন" : "Step 2: Select Country") 
                    : (isBn ? "ধাপ ৩: অর্ডার সম্পন্ন করুন" : "Step 3: Complete Order")}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mt-2">
                {!selectedService 
                  ? (isBn ? "পছন্দসই সার্ভিস নির্বাচন করুন" : "Choose Your Verification Service") 
                  : !selectedCountry 
                    ? (isBn ? `${selectedService.name} এর জন্য দেশ নির্বাচন করুন` : `Select Country for ${selectedService.name}`) 
                    : (isBn ? "সার্ভার রুট ও অর্ডার নিশ্চিতকরণ" : "Select Routing & Confirm Order")}
              </h3>
            </div>
            
            {/* RESET / NAVIGATION CONTROLS */}
            <div className="flex gap-2">
              {selectedService && (
                <button
                  onClick={() => {
                    if (selectedCountry) {
                      setSelectedCountry(null);
                    } else {
                      setSelectedService(null);
                    }
                  }}
                  className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {isBn ? "পেছনে যান" : "Go Back"}
                </button>
              )}
            </div>
          </div>

          {/* STEP 1: SERVICE LISTING */}
          {!selectedService && (
            <div className="space-y-4">
              {/* Service Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  placeholder={isBn ? "সার্ভিস খুঁজুন (যেমন: WhatsApp, Telegram, Google)..." : "Search verification service (e.g., WhatsApp, Telegram)..."}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                />
              </div>

              {/* Grid representation */}
              {loadingServices ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <span className="text-sm font-bold">{isBn ? "সার্ভিস লোড হচ্ছে..." : "Loading global services catalog..."}</span>
                </div>
              ) : filteredGlobalServices.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold text-sm">
                  {isBn ? "কোনো সার্ভিস পাওয়া যায়নি" : "No matching services found"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredGlobalServices.map((s: any) => {
                    const brand = getServiceBrand(s.code, s.name);
                    return (
                      <button
                        key={s.code}
                        onClick={() => {
                          setSelectedService(s);
                          setSearchCountry(""); // clear country search
                        }}
                        className="group border rounded-2xl p-4 text-center transition-all duration-200 relative flex flex-col items-center justify-between h-[150px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 bg-white border-gray-150"
                      >
                        {/* Circle Icon Badge */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition border ${brand.bg} group-hover:scale-110 duration-200 relative overflow-hidden bg-white shrink-0`}>
                          {brand.domain ? (
                            <img 
                              src={`https://logo.clearbit.com/${brand.domain}`} 
                              alt={s.name} 
                              className="absolute inset-0 w-full h-full object-contain p-2 bg-white"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <span className="relative z-10">{brand.icon}</span>
                        </div>

                        {/* Name and Meta */}
                        <div className="mt-2 text-center w-full">
                          <div className="font-extrabold text-sm text-slate-800 line-clamp-1">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-extrabold mt-0.5 uppercase tracking-wider">
                            {isBn ? "স্টক:" : "Stock:"} {s.totalStock.toLocaleString()}
                          </div>
                        </div>

                        {/* Minimum Price Tag */}
                        <div className="mt-2 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all duration-200">
                          {isBn ? "শুরু" : "From"} {formatCurrency(s.minPrice)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COUNTRY LISTING */}
          {selectedService && !selectedCountry && (
            <div className="space-y-4">
              {/* Selected service summary widget */}
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white border border-gray-200">
                    {getServiceBrand(selectedService.code, selectedService.name).icon}
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wide">
                      {isBn ? "নির্বাচিত সার্ভিস" : "SELECTED SERVICE"}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                      {selectedService.name}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                    {isBn ? "মোট বিশ্বব্যাপী স্টক" : "TOTAL GLOBAL STOCK"}
                  </span>
                  <div className="font-black text-slate-800 text-sm">
                    {selectedService.totalStock?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Country Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-4.5 h-4.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  placeholder={isBn ? "দেশ খুঁজুন (যেমন: Indonesia, US, India)..." : "Search country (e.g., USA, Bangladesh, India)..."}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                />
              </div>

              {/* Countries Grid */}
              {filteredCountriesForService.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-bold text-sm">
                  {isBn ? "এই সার্ভিসের জন্য কোনো দেশ পাওয়া যায়নি" : "No countries supporting this service with stock"}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCountriesForService.map((c: any) => {
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCountry(c);
                        }}
                        className="w-full text-left p-3.5 rounded-xl border border-gray-150 hover:border-blue-400 bg-white hover:bg-blue-50/10 hover:shadow-sm transition duration-200 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 shadow-sm">
                            <img 
                              src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`} 
                              alt={c.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <span className="text-[10px] uppercase bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded font-black text-gray-500 shrink-0">
                            {c.iso}
                          </span>
                          <div className="text-left">
                            <div className="text-sm font-black text-slate-800 leading-tight">{c.name}</div>
                            <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                              {isBn ? "স্টক:" : "Stock:"} {c.serviceStock}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-blue-600">
                            {formatCurrency(c.servicePrice)}
                          </div>
                          <span className="text-[9px] font-extrabold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                            {isBn ? "সিলেক্ট করুন" : "Select"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DIRECT CHECKOUT */}
          {selectedService && selectedCountry && (() => {
            const priceUSD = getSelectedServicePriceUSD();
            const hasSufficientBalance = balanceUSD >= priceUSD;

            return (
              <div className="space-y-6">
                {/* Visual Summary of Choices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Widget */}
                  <div className="bg-slate-50 border border-gray-150 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white border border-gray-200 overflow-hidden relative shrink-0">
                      {getServiceBrand(selectedService.code, selectedService.name).domain ? (
                        <img 
                          src={`https://logo.clearbit.com/${getServiceBrand(selectedService.code, selectedService.name).domain}`} 
                          alt={selectedService.name} 
                          className="absolute inset-0 w-full h-full object-contain p-2 bg-white"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="relative z-10">{getServiceBrand(selectedService.code, selectedService.name).icon}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                        {isBn ? "নির্বাচিত সার্ভিস" : "SELECTED SERVICE"}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {selectedService.name}
                      </h4>
                    </div>
                  </div>

                  {/* Country Widget */}
                  <div className="bg-slate-50 border border-gray-150 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 overflow-hidden shrink-0 shadow-sm">
                      <img 
                        src={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png`} 
                        alt={selectedCountry.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                        {isBn ? "নির্বাচিত দেশ" : "SELECTED COUNTRY"}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {selectedCountry.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Balance Checkout Block */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      {isBn ? "বিলিং সামারি" : "BILLING SUMMARY"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-800">
                        {formatCurrency(priceUSD)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">
                      {isBn ? "আপনার বর্তমান ব্যালেন্স:" : "Your available balance:"}{" "}
                      <span className={`font-bold ${hasSufficientBalance ? "text-emerald-600" : "text-red-500"}`}>
                        {formatCurrency(balanceUSD)}
                      </span>
                    </div>
                  </div>

                  {!hasSufficientBalance ? (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 max-w-sm text-xs font-extrabold flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <div>{isBn ? "পর্যাপ্ত ব্যালেন্স নেই!" : "Insufficient Balance!"}</div>
                        <div className="text-[11px] font-bold text-red-500 mt-0.5 leading-normal">
                          {isBn 
                            ? "অর্ডার করতে দয়া করে আপনার একাউন্টে ব্যালেন্স যুক্ত করুন।" 
                            : "Please add funds to your account dashboard to proceed with this purchase."}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={placeOrder}
                      disabled={submittingOrder}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      {submittingOrder ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          {isBn ? "অর্ডার সম্পন্ন হচ্ছে..." : "Processing Order..."}
                        </>
                      ) : (
                        <>
                          <Key className="w-4.5 h-4.5" />
                          {isBn ? "ভেরিফিকেশন নাম্বার কিনুন" : "Buy Verification Number"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ACTIVE NUMBERS TAB */}
      {activeTab === "active" && (
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#2AABEE]" />
            {isBn ? "সচল ওটিপি নাম্বারসমূহ" : "Active OTP Verification Numbers"}
          </h3>

          {activeOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Phone className="w-12 h-12 mx-auto text-gray-300 mb-2.5" />
              <div className="font-bold text-sm text-gray-500 mb-1">
                {isBn ? "কোনো সচল ওটিপি নাম্বার নেই" : "No active verification numbers"}
              </div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {isBn 
                  ? "নতুন নাম্বার কিনলে ওটিপির জন্য অপেক্ষা করার প্যানেলটি এখানে দেখাবে।" 
                  : "Purchased numbers waiting for verification codes will show up here."}
              </p>
              <button
                onClick={() => setActiveTab("order")}
                className="mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-xs px-4 py-2.5 rounded-xl transition"
              >
                {isBn ? "নাম্বার কিনুন" : "Buy a Number"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeOrders.map((order: any) => {
                // Calculation of active time remaining (standard 20 minutes expiration)
                const elapsedSeconds = Math.floor((Date.now() - order.createdAt) / 1000);
                const remainingSeconds = Math.max(1200 - elapsedSeconds, 0);
                const min = Math.floor(remainingSeconds / 60);
                const sec = remainingSeconds % 60;
                const timeStr = `${min}:${sec < 10 ? "0" : ""}${sec}`;

                return (
                  <div 
                    key={order.activationId} 
                    className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/20 p-5 rounded-2xl relative flex flex-col justify-between overflow-hidden shadow-sm"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-red-50 text-red-600 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500 animate-spin" />
                      {timeStr}
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1 text-left mb-4">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                        {order.serviceName} • {order.countryName}{order.serverName ? ` • ${order.serverName}` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-800 tracking-tight">
                          {order.phone}
                        </span>
                        <button
                          onClick={() => handleCopy(order.phone)}
                          className="p-1 hover:bg-gray-100 text-gray-500 hover:text-blue-600 rounded transition"
                          title="Copy Number"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 font-semibold">
                        {isBn ? "আইডি:" : "ID:"} <span className="font-mono text-gray-500">{order.activationId}</span>
                      </div>
                    </div>

                    {/* Waiting Status / OTP display */}
                    <div className="bg-white p-4 rounded-xl border border-blue-50 text-center mb-4 flex flex-col items-center justify-center min-h-[90px]">
                      {order.otp ? (
                        <div className="space-y-2 w-full">
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold uppercase px-2 py-0.5 rounded tracking-wide">
                            {isBn ? "ওটিপি সফল!" : "OTP RECEIVED!"}
                          </span>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl font-black text-emerald-600 tracking-wider">
                              {order.otp}
                            </span>
                            <button
                              onClick={() => handleCopy(order.otp)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                              title="Copy OTP"
                            >
                              <Copy className="w-4.5 h-4.5" />
                            </button>
                          </div>

                          {/* Multiple OTP codes if available */}
                          {order.otpCodes && order.otpCodes.length > 1 && (
                            <div className="pt-2 border-t border-gray-100 space-y-1">
                              <div className="text-[10px] font-bold text-gray-400">
                                {isBn ? "সকল প্রাপ্ত কোড:" : "All Received Codes:"}
                              </div>
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {order.otpCodes.map((c: any, idx: number) => (
                                  <span key={idx} className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded font-bold text-slate-700">
                                    {c.code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">
                              {isBn ? "এসএমএস ওটিপির জন্য অপেক্ষা করছে..." : "Waiting for SMS OTP..."}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 max-w-xs leading-normal">
                            {isBn 
                              ? "আপনার কাঙ্ক্ষিত অ্যাপে নাম্বারটি সাবমিট করুন। ওটিপি স্বয়ংক্রিয়ভাবে লোড হবে।" 
                              : "Enter this phone number in your app. The OTP will automatically load here."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {order.otp ? (
                        <>
                          <button
                            onClick={() => requestRetryCode(order.activationId)}
                            className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                            title={isBn ? "পরবর্তী কোড বা ওটিপির জন্য অনুরোধ করুন" : "Request next code for this number"}
                          >
                            <RefreshCw className="w-4 h-4" />
                            {isBn ? "কোড আবার পাঠান" : "Request Next Code"}
                          </button>
                          <button
                            onClick={() => finishOrder(order.activationId)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isBn ? "সম্পন্ন করুন" : "Finish Order"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => cancelOrder(order.activationId)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          {isBn ? "বাতিল ও রিফান্ড" : "Cancel & Refund"}
                        </button>
                      )}
                      <button
                        onClick={fetchHistory}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition border border-gray-200"
                        title="Force Refresh"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              {isBn ? "ভার্চুয়াল নাম্বার ক্রয়ের ইতিহাস" : "Virtual Number Order History"}
            </h3>
            <button
              onClick={fetchHistory}
              className="p-2 hover:bg-gray-50 text-gray-500 rounded-lg transition border border-gray-200 flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isBn ? "রিফ্রেশ" : "Refresh"}
            </button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <span className="text-xs font-bold">{isBn ? "ইতিহাস লোড হচ্ছে..." : "Loading history..."}</span>
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <History className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <div className="font-bold text-sm text-gray-500">
                {isBn ? "কোনো ইতিহাস পাওয়া যায়নি" : "No order history found"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-4">{isBn ? "তারিখ" : "Date"}</th>
                    <th className="p-4">{isBn ? "আইডি/নাম্বার" : "ID / Phone"}</th>
                    <th className="p-4">{isBn ? "সার্ভিস/দেশ" : "Service / Country"}</th>
                    <th className="p-4 text-center">{isBn ? "মূল্য" : "Cost"}</th>
                    <th className="p-4 text-center">{isBn ? "ওটিপি" : "OTP"}</th>
                    <th className="p-4 text-center">{isBn ? "অবস্থা" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pastOrders.map((order: any) => {
                    const statusColors: Record<string, string> = {
                      completed: "bg-green-50 text-green-700",
                      expired: "bg-gray-50 text-gray-500",
                      cancelled: "bg-red-50 text-red-600",
                    };

                    const statusLabels: Record<string, string> = {
                      completed: isBn ? "সফল" : "Success",
                      expired: isBn ? "সময় শেষ" : "Expired",
                      cancelled: isBn ? "বাতিল" : "Cancelled",
                    };

                    return (
                      <tr key={order.activationId} className="hover:bg-slate-50/40 transition">
                        <td className="p-4">
                          <div className="text-gray-900 font-bold">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{order.phone}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{order.activationId}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800">
                            {order.serviceName}
                            {order.serverName && (
                              <span className="ml-1.5 text-[9px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-1 rounded-md">
                                {order.serverName.replace("Server ", "S")}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">{order.countryName}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-blue-600">
                          {formatCurrency(order.priceUSD)}
                        </td>
                        <td className="p-4 text-center">
                          {order.otp ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-black text-gray-900 tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                                {order.otp}
                              </span>
                              <button
                                onClick={() => handleCopy(order.otp)}
                                className="p-1 hover:bg-gray-100 text-gray-400 hover:text-blue-500 rounded"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 font-bold">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
