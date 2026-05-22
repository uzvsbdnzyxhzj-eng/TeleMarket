import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { ArrowLeft, Menu, X, Check, Search, PlusCircle, LayoutDashboard, List, ShoppingCart, Tag, Facebook, Youtube, Instagram, Twitter, Music, PlaySquare, Headphones, MessageCircle, Send, Cloud, Globe, Linkedin, Twitch, Loader2 } from "lucide-react";

interface SocialServicesProps {
  currentUser: any;
  onNavigate: (view: any) => void;
  balanceUSD: number;
  socialMarkupPercent: number;
  smmMarkupData?: Record<string, any>;
  smmCategoryGroupName?: string;
}

export default function SocialServices({ currentUser, onNavigate, balanceUSD, socialMarkupPercent = 25, smmMarkupData = {}, smmCategoryGroupName = "social" }: SocialServicesProps) {
  const [activeTab, setActiveTab] = useState("new-order");
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchCategory, setSearchCategory] = useState("");
  
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [errors, setErrors] = useState<{link?: string, quantity?: string, general?: string}>({});

  const getCategoryIcon = (categoryName: string) => {
     if (!categoryName) return <Tag className="text-gray-400 w-5 h-5 shrink-0" />;
     const lower = categoryName.toLowerCase();
     if (lower.includes("youtube")) return <Youtube className="text-red-500 w-5 h-5 shrink-0" />;
     if (lower.includes("facebook")) return <Facebook className="text-[#1877F2] w-5 h-5 shrink-0" />;
     if (lower.includes("instagram")) return <Instagram className="text-pink-500 w-5 h-5 shrink-0" />;
     if (lower.includes("twitter") || lower.includes(" x ")) return <Twitter className="text-gray-800 w-5 h-5 shrink-0" />;
     if (lower.includes("spotify")) return <Headphones className="text-[#1DB954] w-5 h-5 shrink-0" />;
     if (lower.includes("tiktok")) return <PlaySquare className="text-gray-800 w-5 h-5 shrink-0" />;
     if (lower.includes("linkedin")) return <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="LinkedIn" />;
     if (lower.includes("telegram")) return <Send className="text-[#2AABEE] w-5 h-5 shrink-0" />;
     if (lower.includes("discord")) return <MessageCircle className="text-[#5865F2] w-5 h-5 shrink-0" />;
     if (lower.includes("soundcloud")) return <Cloud className="text-[#FF5500] w-5 h-5 shrink-0" />;
     if (lower.includes("twitch")) return <Twitch className="text-[#9146FF] w-5 h-5 shrink-0" />;
     if (lower.includes("website")) return <span className="text-xl leading-none">🌍</span>;
     if (lower.includes("shopee")) return <img src="https://www.google.com/s2/favicons?domain=shopee.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Shopee" />;
     if (lower.includes("lazada")) return <img src="https://www.google.com/s2/favicons?domain=lazada.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Lazada" />;
     if (lower.includes("yandex")) return <img src="https://www.google.com/s2/favicons?domain=yandex.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Yandex" />;
     if (lower.includes("reverbnation")) return <img src="https://www.google.com/s2/favicons?domain=reverbnation.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Reverbnation" />;
     
     if (lower.includes("mobile legend")) return <img src="https://www.google.com/s2/favicons?domain=mobilelegends.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Mobile Legends" />;
     if (lower.includes("freefire")) return <img src="https://www.google.com/s2/favicons?domain=ff.garena.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Free Fire" />;
     
     if (lower.includes("kwai")) return <img src="https://www.google.com/s2/favicons?domain=kwai.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Kwai" />;
     if (lower.includes("likee")) return <img src="https://www.google.com/s2/favicons?domain=likee.video&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Likee" />;
     if (lower.includes("lemon 8") || lower.includes("lemon8")) return <img src="https://www.google.com/s2/favicons?domain=lemon8-app.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Lemon 8" />;
     if (lower.includes("coub")) return <img src="https://www.google.com/s2/favicons?domain=coub.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="Coub" />;
     
     if (lower.includes("mobile")) return <PlaySquare className="text-blue-500 w-5 h-5 shrink-0" />;
     if (lower.includes("pubg")) return <span className="text-xl leading-none">🪖</span>;
     if (lower.includes("kick")) return <span className="text-green-500 font-black italic text-lg leading-none shrink-0">K</span>;
     if (lower.includes("whatsapp")) return <MessageCircle className="text-green-500 w-5 h-5 shrink-0" />;
     if (lower.includes("threads")) return <span className="text-gray-900 font-bold text-base leading-none shrink-0">@</span>;
     if (lower.includes("snapchat")) return <span className="text-xl leading-none shrink-0">👻</span>;
     if (lower.includes("pinterest")) return <span className="text-xl leading-none shrink-0">📌</span>;
     if (lower.includes("reddit")) return <span className="text-orange-500 font-bold text-xl leading-none shrink-0">🤖</span>;
     if (lower.includes("vk")) return <img src="https://www.google.com/s2/favicons?domain=vk.com&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="VK" />;
     if (lower.includes("ok.ru") || lower.includes("ok ")) return <img src="https://www.google.com/s2/favicons?domain=ok.ru&sz=128" className="w-5 h-5 rounded-md shrink-0" alt="OK.ru" />;
     if (lower.includes("tumblr")) return <span className="text-indigo-800 font-bold text-xl leading-none shrink-0">t</span>;
     
     if (lower.includes("indian")) return <span className="text-xl leading-none">🇮🇳</span>;
     if (lower.includes("bangladesh") || lower.includes("bd")) return <span className="text-xl leading-none">🇧🇩</span>;
     if (lower.includes("pakistan")) return <span className="text-xl leading-none">🇵🇰</span>;
     if (lower.includes("brazil")) return <span className="text-xl leading-none">🇧🇷</span>;
     if (lower.includes("usa") || lower.includes("united states") || lower.includes("us ")) return <span className="text-xl leading-none">🇺🇸</span>;
     if (lower.includes("indonesia")) return <span className="text-xl leading-none">🇮🇩</span>;
     if (lower.includes("nigeria")) return <span className="text-xl leading-none">🇳🇬</span>;
     if (lower.includes("egypt")) return <span className="text-xl leading-none">🇪🇬</span>;
     if (lower.includes("russia")) return <span className="text-xl leading-none">🇷🇺</span>;
     if (lower.includes("arab")) return <span className="text-xl leading-none">🇦🇪</span>;
     if (lower.includes("uk ") || lower.includes("united kingdom")) return <span className="text-xl leading-none">🇬🇧</span>;
     if (lower.includes("turkey") || lower.includes("turkish")) return <span className="text-xl leading-none">🇹🇷</span>;
  
     return <Tag className="text-gray-400 w-5 h-5 shrink-0" />;
  };

  useEffect(() => {
    fetchServices();
  }, [socialMarkupPercent, smmMarkupData]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/proxy/smm/services", { method: "POST" });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Apply dynamic markup
        const markupData = data.map(s => {
            let finalRate = parseFloat(s.rate);
            const override = smmMarkupData[s.service];
            
            if (override && override.type === 'fixed') {
                finalRate = finalRate + override.profit;
            } else {
                const defaultProfit = finalRate * socialMarkupPercent / 100;
                const profit = defaultProfit > 0.10 ? defaultProfit : 0.10;
                finalRate = finalRate + profit;
            }
            
            return {
                ...s,
                rate: finalRate.toFixed(4),
                originalRate: s.rate
            };
        });
        setServices(markupData);
        
        const cats = Array.from(new Set(markupData.map((s: any) => s.category)));
        setCategories(cats as string[]);
        if (cats.length > 0) {
           setSelectedCategory(cats[0] as string);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSocialFilter = (platform: string) => {
    setSearchCategory(platform);
    const lowercasePlatform = platform.toLowerCase();
    const firstMatch = categories.find(c => {
       const lowerC = c.toLowerCase();
       if (lowercasePlatform === "twitter" && lowerC.includes("x (")) return true;
       if (lowercasePlatform === "mobile" && lowerC.includes("mobile legends")) return true;
       return lowerC.includes(lowercasePlatform);
    });
    if (firstMatch) {
      setSelectedCategory(firstMatch);
      setShowCategoryDropdown(false);
    }
  };

  useEffect(() => {
    let newCategory = "Youtube";
    if (smmCategoryGroupName === "games") newCategory = "Freefire";
    else if (smmCategoryGroupName === "streaming") newCategory = "Spotify";
    else if (smmCategoryGroupName === "regional") newCategory = "Kwai";
    else if (smmCategoryGroupName === "ecommerce") newCategory = "Website";
    
    setSearchCategory(newCategory);
    if (categories.length > 0) {
       handleSocialFilter(newCategory);
    }
  }, [smmCategoryGroupName, categories.length]);

  const currentServices = services.filter(s => s.category === selectedCategory);
  const filteredCategories = categories.filter(c => {
    const lowerC = c.toLowerCase();
    const search = searchCategory.toLowerCase();
    if (search === 'twitter' && lowerC.includes('x (')) return true;
    if (search === 'mobile' && lowerC.includes('mobile legends')) return true;
    return lowerC.includes(search);
  });
  
  const isGameCategory = (cat: string) => /free\s*fire|pubg|mobile\s*legends/i.test(cat || '');

  useEffect(() => {
     if (currentServices.length > 0 && (!selectedService || selectedService.category !== selectedCategory)) {
         setSelectedService(currentServices[0]);
     }
  }, [selectedCategory, currentServices]);

  const charge = selectedService && quantity && !isNaN(Number(quantity))
    ? (isGameCategory(selectedService.category) ? (Number(quantity) * parseFloat(selectedService.rate)) : ((Number(quantity) / 1000) * parseFloat(selectedService.rate))).toFixed(4)
    : "0";

  const handlePlaceOrder = async () => {
     setErrors({});
     let newErrors: {link?: string, quantity?: string, general?: string} = {};
     let hasError = false;

     if (!selectedService) {
         toast.error("Please select a service first.");
         return;
     }
     if (!link.trim()) {
         newErrors.link = "Link is required.";
         hasError = true;
     }
     if (!quantity) {
         newErrors.quantity = "Quantity is required.";
         hasError = true;
     } else if (Number(quantity) < Number(selectedService.min) || Number(quantity) > Number(selectedService.max)) {
        newErrors.quantity = `Quantity must be between ${selectedService.min} and ${selectedService.max}.`;
        hasError = true;
     }

     if (hasError) {
         setErrors(newErrors);
         toast.error("Please fix the errors before placing the order.");
         return;
     }
     
     if (balanceUSD < Number(charge)) {
         toast.error("Insufficient balance to place this order.");
         return;
     }

     const loadingToast = toast.loading("Processing order...");

     try {
       const res = await fetch("/api/proxy/smm/add", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               service: selectedService.service,
               link: link.trim(),
               quantity: Number(quantity)
           })
       });

       const data = await res.json();
       
       if (data.error) {
           toast.dismiss(loadingToast);
           toast.error(`SMM Error: ${data.error}`);
           return;
       }

       if (data.order) {
           // Success! Record transaction & deduct balance
           await Promise.all([
               addDoc(collection(db, "transactions"), {
                   type: "smm_order",
                   userId: currentUser?.uid,
                   userEmail: currentUser?.email,
                   providerOrderId: data.order,
                   serviceId: selectedService.service,
                   serviceName: selectedService.name,
                   category: selectedService.category,
                   link: link.trim(),
                   quantity: Number(quantity),
                   amountUSD: Number(charge),
                   status: "pending",
                   createdAt: Date.now()
               }),
               updateDoc(doc(db, "users", currentUser?.uid || ""), {
                   balanceUSD: increment(-Number(charge)),
                   total_spent: increment(Number(charge)),
                   last_update: Date.now()
               })
           ]);

           toast.dismiss(loadingToast);
           toast.success(`Order placed successfully! ID: ${data.order}`);
           setLink("");
           setQuantity("");
           setActiveTab("orders");
       } else {
           toast.dismiss(loadingToast);
           toast.error("An unknown error occurred. Order ID not received.");
       }
     } catch (err: any) {
         toast.dismiss(loadingToast);
         toast.error("Network or internal error while placing order.");
     }
  };

  const navItems = [
    { id: "new-order", label: "New order", icon: PlusCircle },
    { id: "services", label: "Services", icon: List },
    { id: "orders", label: "My Orders", icon: ShoppingCart },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-transparent flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white text-gray-800 p-4 flex justify-between items-center shadow-sm z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
           <button onClick={() => onNavigate("dashboard")} className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-2">
             <div className="bg-[#2AABEE] text-white p-1 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.02-1.92 1.25-5.41 3.63-.51.35-.97.53-1.39.52-.46-.01-1.33-.26-1.97-.47-.79-.26-1.42-.4-1.37-.85.03-.23.36-.47.98-.71 3.86-1.68 6.43-2.79 7.71-3.32 3.67-1.51 4.43-1.78 4.93-1.79.11 0 .36.03.49.13.11.08.14.2.16.28.01.07.03.22.02.39z"/>
               </svg>
             </div>
             <h1 className="font-extrabold text-xl text-[#2AABEE] tracking-tight">{selectedCategory || "Social Panel"}</h1>
           </div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} transform md:translate-x-0 transition-transform duration-300 absolute md:relative z-30 w-64 h-full bg-white shadow-xl flex flex-col border-r border-gray-100`}>
         <div className="p-6 bg-white border-b border-gray-100 hidden md:block">
            <button onClick={() => onNavigate("dashboard")} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> Back to App
            </button>
            <div className="flex items-center gap-2">
               <div className="bg-[#2AABEE] text-white p-1.5 rounded-lg shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.02-1.92 1.25-5.41 3.63-.51.35-.97.53-1.39.52-.46-.01-1.33-.26-1.97-.47-.79-.26-1.42-.4-1.37-.85.03-.23.36-.47.98-.71 3.86-1.68 6.43-2.79 7.71-3.32 3.67-1.51 4.43-1.78 4.93-1.79.11 0 .36.03.49.13.11.08.14.2.16.28.01.07.03.22.02.39z"/>
                 </svg>
               </div>
               <h1 className="font-extrabold text-2xl text-[#2AABEE] tracking-tight">{selectedCategory || "Social Panel"}</h1>
            </div>
         </div>
         
         <div className="p-4 border-b border-gray-100 bg-[#f8fbff] flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : "U"}
             </div>
             <div>
                <div className="font-bold text-gray-800 truncate text-sm">
                   {currentUser?.displayName || currentUser?.email?.split('@')[0] || "User"}
                </div>
                <div className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-0.5 border border-blue-100">
                   Balance: ${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}
                </div>
             </div>
         </div>

         <div className="p-4 flex-1">
            <div className="space-y-1.5">
               {navItems.map(item => (
                 <button 
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === item.id ? "bg-[#2AABEE] text-white shadow-md shadow-blue-500/20" : "text-gray-600 hover:bg-gray-50 hover:text-[#2AABEE]"}`}
                 >
                   <item.icon className="w-5 h-5" />
                   {item.label}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 relative scroll-smooth">
         {/* Overlay for mobile sidebar */}
         {menuOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 md:hidden" onClick={() => setMenuOpen(false)} />}
         
         {activeTab === "new-order" && (
            <div className="max-w-2xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
               
               {/* Fund Card */}
               <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
                  <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-2 gap-3 pb-2">
                        {(() => {
                           let buttonsToRender: any[] = [];
                           if (smmCategoryGroupName === "games") {
                               buttonsToRender = [
                                  { label: "Free Fire", key: "Freefire", icon: <img src="https://www.google.com/s2/favicons?domain=ff.garena.com&sz=128" className="w-5 h-5 rounded-md" alt="Free Fire" /> },
                                  { label: "PUBG Mobile", key: "PUBG", icon: <span className="text-xl leading-none">🪖</span> },
                                  { label: "Mobile Legends", key: "Mobile", icon: <img src="https://www.google.com/s2/favicons?domain=mobilelegends.com&sz=128" className="w-5 h-5 rounded-md" alt="Mobile Legends" /> },
                               ];
                           } else if (smmCategoryGroupName === "streaming") {
                               buttonsToRender = [
                                  { label: "Twitch", key: "Twitch", icon: <Twitch className="text-[#9146FF] w-5 h-5" /> },
                                  { label: "Kick", key: "Kick", icon: <span className="text-green-500 font-black italic text-lg leading-none">K</span> },
                                  { label: "Spotify", key: "Spotify", icon: <span className="text-[#1DB954] text-xl leading-none">🎧</span> },
                                  { label: "SoundCloud", key: "SoundCloud", icon: <Cloud className="text-[#FF5500] w-5 h-5" /> },
                                  { label: "Audiomack", key: "Audiomack", icon: <span className="text-yellow-500 text-xl leading-none">🎶</span> },
                                  { label: "Deezer", key: "Deezer", icon: <span className="text-purple-500 text-xl leading-none">🎵</span> },
                                  { label: "Tidal", key: "Tidal", icon: <span className="text-black text-xl leading-none">🌊</span> },
                                  { label: "Vimeo", key: "Vimeo", icon: <span className="text-[#1AB7EA] font-bold text-xl leading-none">v</span> },
                               ];
                           } else if (smmCategoryGroupName === "regional") {
                               buttonsToRender = [
                                  { label: "Kwai", key: "Kwai", icon: <img src="https://www.google.com/s2/favicons?domain=kwai.com&sz=128" className="w-5 h-5 rounded-md" alt="Kwai" /> },
                                  { label: "Likee", key: "Likee", icon: <img src="https://www.google.com/s2/favicons?domain=likee.video&sz=128" className="w-5 h-5 rounded-md" alt="Likee" /> },
                                  { label: "VK", key: "VK", icon: <img src="https://www.google.com/s2/favicons?domain=vk.com&sz=128" className="w-5 h-5 rounded-md" alt="VK" /> },
                                  { label: "OK.ru", key: "OK.ru", icon: <img src="https://www.google.com/s2/favicons?domain=ok.ru&sz=128" className="w-5 h-5 rounded-md" alt="OK.ru" /> },
                                  { label: "Lemon 8", key: "Lemon", icon: <img src="https://www.google.com/s2/favicons?domain=lemon8-app.com&sz=128" className="w-5 h-5 rounded-md" alt="Lemon 8" /> },
                                  { label: "Coub", key: "Coub", icon: <img src="https://www.google.com/s2/favicons?domain=coub.com&sz=128" className="w-5 h-5 rounded-md" alt="Coub" /> },
                               ];
                           } else if (smmCategoryGroupName === "ecommerce") {
                               buttonsToRender = [
                                  { label: "Shopee", key: "Shopee", icon: <img src="https://www.google.com/s2/favicons?domain=shopee.com&sz=128" className="w-5 h-5 rounded-md" alt="Shopee" /> },
                                  { label: "Lazada", key: "Lazada", icon: <img src="https://www.google.com/s2/favicons?domain=lazada.com&sz=128" className="w-5 h-5 rounded-md" alt="Lazada" /> },
                                  { label: "Google", key: "Google", icon: <Search className="text-blue-500 w-5 h-5" /> },
                                  { label: "Website Traffic", key: "Website", icon: <span className="text-xl leading-none">🌍</span> },
                                  { label: "Yandex", key: "Yandex", icon: <img src="https://www.google.com/s2/favicons?domain=yandex.com&sz=128" className="w-5 h-5 rounded-md" alt="Yandex" /> },
                                  { label: "Reverbnation", key: "Reverbnation", icon: <img src="https://www.google.com/s2/favicons?domain=reverbnation.com&sz=128" className="w-5 h-5 rounded-md" alt="Reverbnation" /> },
                               ];
                           } else {
                               buttonsToRender = [
                                  { label: "Facebook", key: "Facebook", icon: <Facebook className="text-[#1877F2] w-5 h-5" /> },
                                  { label: "Instagram", key: "Instagram", icon: <Instagram className="text-pink-500 w-5 h-5" /> },
                                  { label: "TikTok", key: "Tiktok", icon: <span className="text-xl leading-none">🎵</span> },
                                  { label: "YouTube", key: "Youtube", icon: <Youtube className="text-red-500 w-5 h-5" /> },
                                  { label: "X (Twitter)", key: "Twitter", icon: <span className="text-gray-900 font-bold text-lg leading-none">X</span> },
                                  { label: "Telegram", key: "Telegram", icon: <Send className="text-[#2AABEE] w-5 h-5" /> },
                                  { label: "WhatsApp", key: "Whatsapp", icon: <MessageCircle className="text-green-500 w-5 h-5" /> },
                                  { label: "Threads", key: "Threads", icon: <span className="text-gray-900 font-bold text-lg leading-none">@</span> },
                                  { label: "Snapchat", key: "Snapchat", icon: <span className="text-xl leading-none">👻</span> },
                                  { label: "Pinterest", key: "Pinterest", icon: <span className="text-xl leading-none">📌</span> },
                                  { label: "LinkedIn", key: "Linkedin", icon: <img src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128" className="w-5 h-5 rounded-md" alt="LinkedIn" /> },
                                  { label: "Discord", key: "Discord", icon: <span className="text-[#5865F2] font-bold text-xl leading-none">👾</span> },
                                  { label: "Reddit", key: "Reddit", icon: <span className="text-orange-500 font-bold text-xl leading-none">🤖</span> },
                                  { label: "Tumblr", key: "Tumblr", icon: <span className="text-indigo-800 font-bold text-xl leading-none">t</span> },
                                  { label: "Quora", key: "Quora", icon: <span className="text-red-700 font-bold text-lg leading-none">Q</span> },
                               ];
                           }
                           
                           return buttonsToRender.map(btn => (
                               <SocialBtn 
                                  key={btn.key} 
                                  icon={btn.icon} 
                                  label={btn.label} 
                                  onClick={() => handleSocialFilter(btn.key)} 
                                  active={searchCategory.toLowerCase() === btn.key.toLowerCase()} 
                               />
                           ));
                        })()}
                      </div>
                  </div>
               </div>

               {/* Order Form Card */}
               <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="p-4 sm:p-6 space-y-5">
                      <div className="flex gap-2 mb-2">
                         <button className="flex-1 bg-[#2AABEE] text-white py-2.5 rounded-full font-medium text-[15px] shadow-sm">
                            New Order
                         </button>
                      </div>

                      <div>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                               <Search className="h-5 w-5 text-gray-800 stroke-[2.5]" />
                            </div>
                            <input
                              type="text"
                              value={searchCategory}
                              onChange={(e) => setSearchCategory(e.target.value)}
                              placeholder="Search"
                              className="w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl pl-11 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                            />
                         </div>
                      </div>

                      <div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Category</label>
                         <div 
                            className={`w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium ${services.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex justify-between items-center`}
                            onClick={() => {
                               if (services.length > 0) {
                                  setShowCategoryDropdown(!showCategoryDropdown);
                                  setShowServiceDropdown(false);
                               }
                            }}
                         >
                            <div className="truncate text-sm pr-4 flex items-center gap-2">
                               {services.length === 0 ? (
                                   <div className="flex items-center gap-2 text-gray-500 font-normal">
                                      <Loader2 className="w-4 h-4 animate-spin" /> Loading services...
                                   </div>
                               ) : selectedCategory ? (
                                   <>
                                       {getCategoryIcon(selectedCategory)}
                                       <span className="truncate leading-snug">{selectedCategory}</span>
                                   </>
                               ) : "Select a category"}
                            </div>
                            <svg className={`shrink-0 w-4 h-4 text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showCategoryDropdown && services.length > 0 && (
                             <div className="absolute z-40 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-[350px] overflow-y-auto">
                                 {filteredCategories.length > 0 ? filteredCategories.map(c => (
                                     <div 
                                        key={c} 
                                        onClick={() => {
                                            setSelectedCategory(c);
                                            setShowCategoryDropdown(false);
                                        }}
                                        className={`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-[#ffffff] flex items-center gap-3 transition ${selectedCategory === c ? 'bg-[#f0f0f0]' : ''}`}
                                     >
                                         {getCategoryIcon(c)}
                                         <span className="text-sm font-medium text-gray-800 leading-snug">{c}</span>
                                     </div>
                                 )) : (
                                     <div className="p-4 text-sm text-gray-500 text-center">No categories found</div>
                                 )}
                             </div>
                         )}
                      </div>

                      <div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Service</label>
                         <div 
                            className={`w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium ${services.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex justify-between items-center`}
                            onClick={() => {
                                if (services.length > 0) {
                                    setShowServiceDropdown(!showServiceDropdown)
                                }
                            }}
                         >
                            <div className="truncate text-sm pr-4">
                               {services.length === 0 ? (
                                   <span className="text-gray-500 font-normal">Loading services...</span>
                               ) : selectedService ? (
                                   <span className="flex items-center gap-2 truncate">
                                       <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">{selectedService.service}</span>
                                       <span className="truncate">- {selectedService.name} [ ${selectedService.rate} per {isGameCategory(selectedService.category) ? '1' : '1000'} ]</span>
                                   </span>
                               ) : "Select a service"}
                            </div>
                            <svg className={`shrink-0 w-4 h-4 text-gray-500 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showServiceDropdown && (
                             <div className="absolute z-40 w-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                                 {currentServices.map(s => (
                                     <div 
                                        key={s.service} 
                                        onClick={() => {
                                            setSelectedService(s);
                                            setShowServiceDropdown(false);
                                        }}
                                        className={`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-[#ffffff] flex flex-col gap-1 transition ${selectedService?.service === s.service ? 'bg-[#f0f0f0]' : ''}`}
                                     >
                                         <div className="flex items-start gap-2">
                                             <span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 shrink-0">{s.service}</span>
                                             <span className="text-sm font-medium text-gray-800 leading-snug">{s.name} - ${s.rate} per {isGameCategory(s.category) ? '1' : '1000'}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Link</label>
                          <input 
                             type="text" 
                             value={link}
                             onChange={(e) => { setLink(e.target.value); setErrors(p => ({...p, link: undefined})); }}
                              className={`w-full bg-[#ffffff] border ${errors.link ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400`}
                           />
                           {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Quantity</label>
                          <input 
                             type="number"
                             value={quantity}
                             onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({...p, quantity: undefined})); }}
                              className={`w-full bg-[#ffffff] border ${errors.quantity ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400`}
                           />
                           {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                          <div className="text-gray-700 text-sm mt-3 font-medium pl-1">
                             Min: {selectedService?.min || 50} - Max: {selectedService?.max || 500000}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Charge</label>
                          <input 
                             type="text"
                             value={`${charge}`}
                             readOnly
                             className="w-full bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-500 font-medium outline-none cursor-not-allowed"
                           />
                      </div>

                      <div className="pt-2">
                        <button 
                             onClick={handlePlaceOrder}
                             className="w-full bg-[#2AABEE] hover:bg-[#1e99d8] text-white py-3.5 rounded-[14px] font-medium text-[16px] shadow-sm transition active:scale-[0.98]"
                          >
                             Submit
                        </button>
                      </div>
                  </div>
               </div>
               
               {/* Service Details Card */}
               {selectedService && (
                   <div className="bg-[#f0f9ff] border border-blue-100 rounded-[20px] shadow-sm overflow-hidden mt-6">
                       <div className="bg-[#f0f9ff] p-4 border-b border-blue-100">
                           <h3 className="font-bold text-gray-900">Service Details</h3>
                       </div>
                       <div className="bg-white p-5 space-y-4">
                           <div className="flex justify-between border-b border-gray-100 pb-3 border-dashed">
                               <span className="font-bold text-gray-800 text-sm">Charge</span>
                               <span className="text-blue-600 font-medium">${charge}</span>
                           </div>
                           <div className="flex items-center justify-between border-b border-gray-100 pb-3 border-dashed">
                               <span className="font-bold text-gray-800 text-sm">Category</span>
                               <span className="text-gray-600 font-medium text-xs bg-gray-100 py-1 px-2 rounded-lg">{selectedService.category}</span>
                           </div>
                           {(selectedService.desc || selectedService.description) && (
                               <div className="pt-2">
                                  <span className="font-bold text-gray-800 text-sm block mb-2">Description</span>
                                  <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed description-container custom-scrollbar max-h-[300px] overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: selectedService.desc || selectedService.description }} />
                               </div>
                           )}
                       </div>
                   </div>
               )}
            </div>
         )}

         {activeTab === "services" && (
            <div className="max-w-5xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-bold text-gray-800 mb-6">Services</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-[#ffffff] border-b border-[#e2e8f0] font-bold text-gray-700">
                           <tr>
                              <th className="px-4 py-4">ID</th>
                              <th className="px-4 py-4">Service</th>
                              <th className="px-4 py-4 whitespace-nowrap">Rate / 1000</th>
                              <th className="px-4 py-4 text-right">Min / Max</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                           {services.map(s => (
                              <tr key={s.service} className="hover:bg-[#ffffff] transition-colors">
                                 <td className="px-4 py-3.5"><span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">{s.service}</span></td>
                                 <td className="px-4 py-3.5 font-medium text-gray-700">{s.name}</td>
                                 <td className="px-4 py-3.5 font-mono text-[#2AABEE] font-bold">${s.rate}</td>
                                 <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-right">{s.min} / {s.max}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === "orders" && (
            <div className="max-w-4xl mx-auto origin-top animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
               <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                     <ShoppingCart className="w-8 h-8 text-gray-300 font-normal" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No orders yet</h3>
                  <p className="text-gray-500 max-w-sm">You haven't placed any social panel orders. When you do, they will appear here.</p>
               </div>
            </div>
         )}
         
      </div>
    </div>
  );
}

function SocialBtn({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {
   return (
      <button 
         onClick={onClick}
         className={`${active ? 'bg-gray-800 ring-2 ring-[#2AABEE]' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-lg py-2.5 px-3 flex items-center gap-3 transition shadow-sm border-b-2 border-transparent hover:border-black overflow-hidden`}
      >
         <div className="bg-white rounded-full p-1.5 shrink-0 flex items-center justify-center shadow-sm">
            {icon}
         </div>
         <span className="font-medium text-[15px] truncate text-left">{label}</span>
      </button>
   );
}

