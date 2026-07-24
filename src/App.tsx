import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { CountryData } from "./types";
import { t, Language } from "./i18n";
import { currenciesList, formatValueWithCurrency } from "./currencies";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  ShoppingCart,
  Store,
  PlusCircle,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Wallet,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Globe,
  LogOut,
  FileText,
  Bot,
  User,
  Clock,
  Timer,
  UserPlus,
  ShieldCheck,
  Headphones,
  Bitcoin,
  Coins,
  Mail,
  Users,
  Calendar,
  Heart,
  Plus,
  Trash2,
  Landmark,
  CircleDollarSign,
  Bookmark,
  Home,
  LayoutGrid,
  Phone,
  MessageCircle,
  Gamepad2,
  RefreshCw,
  Info,
  ArrowLeft,
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  Copy,
  MessageSquare,
  Ticket,
  Code,
  BookOpen,
  Wrench,
  Sparkles,
  Loader2,
  Hash
} from "lucide-react";
import { auth, db } from "./firebase";

function getTimeElapsedString(timestamp: number) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min run`; // wait
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ${diffMins % 60}m run`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days run`;
}

function getSubscriptionDaysAgo(timestamp: number) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours <= 0) {
      const mins = Math.floor(diffMs / (60 * 1000));
      return mins <= 1 ? "Just now" : `${mins} minutes ago`;
    }
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  }
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getSubscriptionRemainingText(expiresAt: number) {
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) {
    return { text: "Expired", isExpired: true, isCritical: false };
  }
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours <= 0) {
      const mins = Math.floor(diffMs / (60 * 1000));
      return { text: `${mins}m remaining`, isExpired: false, isCritical: true };
    }
    return { text: `${hours}h remaining`, isExpired: false, isCritical: true };
  }
  return { 
    text: `${days} day${days > 1 ? 's' : ''} remaining`, 
    isExpired: false, 
    isCritical: days <= 1 
  };
}

function isSubscriptionExpiringSoon(expiresAt: number) {
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return false;
  const hours = diffMs / (60 * 60 * 1000);
  return hours <= 24;
}
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import Login from "./Login";
import Landing from "./Landing";
import TopTicker from "./TopTicker";
import AdvertisementBanner from "./AdvertisementBanner";
import PostAd from "./PostAd";
import MyAdsProfile from "./MyAdsProfile";
import AdminUserManagement from "./AdminUserManagement";
import AdminSMMPricing from "./AdminSMMPricing";
import AdminDashboardButtons from "./AdminDashboardButtons";
import AdminApiKeys from "./AdminApiKeys";
import ChildPanel from "./ChildPanel";
import AdminChildPanel from "./AdminChildPanel";
import ApiView from "./ApiView";
import SupportTickets from "./SupportTickets";
import AdminTickets from "./AdminTickets";
import SocialServices from "./SocialServices";
import ChatBot from "./ChatBot";
import SuccessReceiptModal from "./SuccessReceiptModal";
import AdminDataOverview from "./AdminDataOverview";
import AdminOrdersManagement from "./AdminOrdersManagement";
import VirtualNumbers from "./VirtualNumbers";

export type View =
  | "buy"
  | "sell"
  | "dashboard"
  | "admin"
  | "records"
  | "profile"
  | "wallet-history"
  | "smm"
  | "tickets"
  | "post-ad"
  | "child-panel"
  | "api"
  | "courses"
  | "tools";

import {
  getFlag,
  requestNotificationPermission,
  sendNotification,
} from "./utils";

import { TelemarketLogo } from "./TelemarketLogo";

const TOPIC_OPTIONS = [
  "General",
  "Finance",
  "Gambling/Betting",
  "Crypto",
  "Gaming",
  "Technology",
  "Entertainment",
  "News",
  "Education",
  "Sports",
  "Music",
  "Movies",
];

const geminiCountriesList = [
  "Albania", "Algeria", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", 
  "Bahrain", "Bangladesh", "Belgium", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "Colombia", "Costa Rica", 
  "Croatia", "Cyprus", "Czech Republic", "Denmark", "Ecuador", "Egypt", "El Salvador", "Estonia", 
  "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", 
  "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", 
  "Israel", "Italy", "Ivory Coast", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Maldives", 
  "Malta", "Mexico", "Moldova", "Mongolia", "Montenegro", "Morocco", "Myanmar", "Namibia", 
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Nigeria", "North Macedonia", "Norway", 
  "Oman", "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Qatar", "Romania", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", 
  "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", 
  "Sweden", "Switzerland", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", 
  "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", 
  "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Zambia", "Zimbabwe"
].sort((a, b) => a.localeCompare(b));

const geminiCountryFlags: Record<string, string> = {
  "United States": "🇺🇸",
  "Canada": "🇨🇦",
  "United Kingdom": "🇬🇧",
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Ireland": "🇮🇪",
  "Luxembourg": "🇱🇺",
  "Iceland": "🇮🇸",
  "Poland": "🇵🇱",
  "Czech Republic": "🇨🇿",
  "Slovakia": "🇸🇰",
  "Hungary": "🇭🇺",
  "Romania": "🇷🇴",
  "Bulgaria": "🇧🇬",
  "Croatia": "🇭🇷",
  "Slovenia": "🇸🇮",
  "Serbia": "🇷🇸",
  "Bosnia and Herzegovina": "🇧🇦",
  "Albania": "🇦🇱",
  "Montenegro": "🇲🇪",
  "North Macedonia": "🇲🇰",
  "Greece": "🇬🇷",
  "Portugal": "🇵🇹",
  "Estonia": "🇪🇪",
  "Latvia": "🇱🇻",
  "Lithuania": "🇱🇹",
  "Malta": "🇲🇹",
  "Cyprus": "🇨🇾",
  "India": "🇮🇳",
  "Bangladesh": "🇧🇩",
  "Pakistan": "🇵🇰",
  "Nepal": "🇳🇵",
  "Sri Lanka": "🇱🇰",
  "Maldives": "🇲🇻",
  "Bhutan": "🇧🇹",
  "Indonesia": "🇮🇩",
  "Philippines": "🇵🇭",
  "Vietnam": "🇻🇳",
  "Thailand": "🇹🇭",
  "Malaysia": "🇲🇾",
  "Singapore": "🇸🇬",
  "Cambodia": "🇰🇭",
  "Laos": "🇱🇦",
  "Myanmar": "🇲🇲",
  "Mongolia": "🇲🇳",
  "South Korea": "🇰🇷",
  "Japan": "🇯🇵",
  "Hong Kong": "🇭🇰",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  "Qatar": "🇶🇦",
  "Kuwait": "🇰🇼",
  "Bahrain": "🇧🇭",
  "Oman": "🇴🇲",
  "Israel": "🇮🇱",
  "Jordan": "🇯🇴",
  "Lebanon": "🇱🇧",
  "Iraq": "🇮🇶",
  "Turkey": "🇹🇷",
  "Egypt": "🇪🇬",
  "Morocco": "🇲🇦",
  "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "Venezuela": "🇻🇪",
  "Uruguay": "🇺🇾",
  "Paraguay": "🇵🇾",
  "Bolivia": "🇧🇴",
  "Ecuador": "🇪🇨",
  "Mexico": "🇲🇽",
  "Costa Rica": "🇨🇷",
  "Panama": "🇵🇦",
  "Guatemala": "🇬🇹",
  "Honduras": "🇭🇳",
  "El Salvador": "🇸🇻",
  "Nicaragua": "🇳🇮",
  "South Africa": "🇿🇦",
  "Nigeria": "🇳🇬",
  "Kenya": "🇰🇪",
  "Ghana": "🇬🇭",
  "Ethiopia": "🇪🇹",
  "Tanzania": "🇹🇿",
  "Uganda": "🇺🇬",
  "Rwanda": "🇷🇼",
  "Zambia": "🇿🇲",
  "Zimbabwe": "🇿🇼",
  "Botswana": "🇧🇼",
  "Namibia": "🇳🇦",
  "Senegal": "🇸🇳",
  "Ivory Coast": "🇨🇮",
  "Cameroon": "🇨🇲",
  "Angola": "🇦🇴",
  "Sudan": "🇸🇩",
  "Somalia": "🇸🇴",
  "Georgia": "🇬🇪",
  "Armenia": "🇦🇲",
  "Azerbaijan": "🇦🇿",
  "Kazakhstan": "🇰🇿",
  "Uzbekistan": "🇺🇿",
  "Kyrgyzstan": "🇰🇬",
  "Tajikistan": "🇹🇯",
  "Turkmenistan": "🇹🇲",
  "Moldova": "🇲🇩",
  "Ukraine": "🇺🇦"
};

const geminiCountryPrices12M: Record<string, number> = {
  "United States": 12.99,
  "Canada": 12.99,
  "United Kingdom": 12.99,
  "Australia": 12.99,
  "New Zealand": 12.99,
  "Germany": 12.99,
  "France": 12.99,
  "Italy": 11.99,
  "Spain": 11.99,
  "Netherlands": 12.99,
  "Belgium": 11.99,
  "Sweden": 12.99,
  "Norway": 13.99,
  "Denmark": 13.99,
  "Finland": 12.99,
  "Switzerland": 14.99,
  "Austria": 11.99,
  "Ireland": 12.99,
  "Luxembourg": 13.99,
  "Iceland": 13.99,
  "Poland": 9.99,
  "Czech Republic": 9.99,
  "Slovakia": 9.99,
  "Hungary": 9.99,
  "Romania": 8.99,
  "Bulgaria": 7.99,
  "Croatia": 9.99,
  "Slovenia": 9.99,
  "Serbia": 8.99,
  "Bosnia and Herzegovina": 8.99,
  "Albania": 7.99,
  "Montenegro": 8.99,
  "North Macedonia": 7.99,
  "Greece": 9.99,
  "Portugal": 9.99,
  "Estonia": 9.99,
  "Latvia": 8.99,
  "Lithuania": 8.99,
  "Malta": 9.99,
  "Cyprus": 9.99,
  "India": 5.99,
  "Bangladesh": 4.99,
  "Pakistan": 4.99,
  "Nepal": 4.99,
  "Sri Lanka": 5.99,
  "Maldives": 5.99,
  "Bhutan": 4.99,
  "Indonesia": 5.99,
  "Philippines": 5.99,
  "Vietnam": 5.99,
  "Thailand": 6.99,
  "Malaysia": 7.99,
  "Singapore": 9.99,
  "Cambodia": 4.99,
  "Laos": 4.99,
  "Myanmar": 4.99,
  "Mongolia": 5.99,
  "South Korea": 12.99,
  "Japan": 12.99,
  "Hong Kong": 9.99,
  "United Arab Emirates": 9.99,
  "Saudi Arabia": 9.99,
  "Qatar": 9.99,
  "Kuwait": 9.99,
  "Bahrain": 9.99,
  "Oman": 9.99,
  "Israel": 9.99,
  "Jordan": 8.99,
  "Lebanon": 8.99,
  "Iraq": 8.99,
  "Turkey": 7.99,
  "Egypt": 7.99,
  "Morocco": 7.99,
  "Algeria": 7.99,
  "Tunisia": 7.99,
  "Brazil": 9.99,
  "Argentina": 9.99,
  "Chile": 9.99,
  "Colombia": 9.99,
  "Peru": 8.99,
  "Venezuela": 8.99,
  "Uruguay": 9.99,
  "Paraguay": 8.99,
  "Bolivia": 8.99,
  "Ecuador": 8.99,
  "Mexico": 9.99,
  "Costa Rica": 8.99,
  "Panama": 9.99,
  "Guatemala": 8.99,
  "Honduras": 8.99,
  "El Salvador": 8.99,
  "Nicaragua": 8.99,
  "South Africa": 9.99,
  "Nigeria": 7.99,
  "Kenya": 7.99,
  "Ghana": 7.99,
  "Ethiopia": 7.99,
  "Tanzania": 7.99,
  "Uganda": 7.99,
  "Rwanda": 7.99,
  "Zambia": 7.99,
  "Zimbabwe": 7.99,
  "Botswana": 8.99,
  "Namibia": 8.99,
  "Senegal": 7.99,
  "Ivory Coast": 7.99,
  "Cameroon": 7.99,
  "Angola": 7.99,
  "Sudan": 6.99,
  "Somalia": 6.99,
  "Georgia": 8.99,
  "Armenia": 8.99,
  "Azerbaijan": 8.99,
  "Kazakhstan": 8.99,
  "Uzbekistan": 8.99,
  "Kyrgyzstan": 7.99,
  "Tajikistan": 7.99,
  "Turkmenistan": 7.99,
  "Moldova": 8.99,
  "Ukraine": 8.99
};

const getGeminiPriceRangeText = () => {
  const basePrices = Object.values(geminiCountryPrices12M);
  if (basePrices.length === 0) return "$1.25 - $56.96 USD";
  const oneMonthPrices = basePrices.map(base => Math.max(0.99, Math.round((base * 0.25) * 100) / 100));
  const personalPrices = basePrices.map(base => base * 3.8);
  const minPrice = Math.min(...oneMonthPrices).toFixed(2);
  const maxPrice = Math.max(...personalPrices).toFixed(2);
  return `$${minPrice} - $${maxPrice} USD`;
};
const geminiPriceRangeText = getGeminiPriceRangeText();

const premiumProducts = [
  {
    id: 1,
    category: "Language & Skills",
    title: "সহজে ইংরেজি শিখার জনপ্রিয় ৬০টি+ PDF BOOK এবং ১৭০+ ভিডিও ক্লাস পাচ্ছেন মাত্র ৯৯ টাকায়",
    oldPrice: 700,
    price: 99,
    rating: 5,
    features: ["৬০+ প্রিমিয়াম PDF বই", "১৭০+ ভিডিও টিউটোরিয়াল", "আজীবন এক্সেস", "মোবাইল ও পিসি ফ্রেন্ডলি"],
    badge: "Best Seller"
  },
  {
    id: 2,
    category: "AI & Reels",
    title: "50000+ রেডিমেইড AI REELS ভিডিও",
    oldPrice: 1000,
    price: 199,
    rating: 5,
    features: ["৫০,০০০+ রেডি রিলস", "উচ্চ মানের ভিডিও (HD)", "কপিরাইট ফ্রি কন্টেন্ট", "ইনস্ট্যান্ট ডাউনলোড লিঙ্ক"],
    badge: "Trending"
  },
  {
    id: 3,
    category: "AI & Reels",
    title: "৫০ হাজারের বেশী ট্রেন্ডি AI কপিরাইট ফ্রি রিল্স ভিডিও!",
    oldPrice: 400,
    price: 120,
    rating: 5,
    features: ["ট্রেন্ডি এআই ভিডিওস", "১০০% কপিরাইট মুক্ত", "ভাইরাল হওয়ার গ্যারান্টি", "গুগল ড্রাইভ এক্সেস"],
    badge: "Hot Offer"
  },
  {
    id: 4,
    category: "Entertainment & Video",
    title: "৫০,০০০+ কপিরাইট ফ্রি রেডি টু আপলোড মুভি ক্লিপ বান্ডেল!",
    oldPrice: 1000,
    price: 250,
    rating: 5,
    features: ["মুভি ক্লিপস কালেকশন", "কপিরাইট ছাড়াই আপলোড", "ফেসবুক ও ইউটিউবের জন্য", "লাইফটাইম ডাউনলোড সুবিধা"],
    badge: "Popular"
  },
  {
    id: 5,
    category: "E-Commerce Course",
    title: "শহিদ আনোয়ার এর 297 ডলারের AMAZON FBA ফুল কোর্স",
    oldPrice: 3500,
    price: 190,
    rating: 5,
    features: ["২৯৭ ডলারের কোর্স মাত্র ১৯০৳", "ধাপ-বাই-ধাপ গাইডলাইন", "অ্যামাজন সেলার অ্যাকাউন্ট সেটআপ", "বাংলা সাবটাইটেল/ভাষা"],
    badge: "Premium"
  },
  {
    id: 6,
    category: "Animation Course",
    title: "2D, 3D, WHITEBOARD, MOBILE এনিমেশন ফুল কোর্স!",
    oldPrice: 1000,
    price: 155,
    rating: 5,
    features: ["2D & 3D এনিমেশন শিক্ষা", "হোয়াইটবোর্ড ও মোবাইল এনিমেশন", "সহজ বাংলা টিউটোরিয়াল", "প্রয়োজনীয় সকল সফটওয়্যার"],
    badge: "Super Course"
  },
  {
    id: 7,
    category: "ASMR & Reels",
    title: "১ হাজার+ ট্রেন্ডিং AI গ্লাস কাটিং রিল্স ভিডিও বান্ডেল",
    oldPrice: 300,
    price: 145,
    rating: 5,
    features: ["১০০০+ এআই গ্লাস কাটিং ভিডিও", "ভাইরাল ASMR সাউন্ড", "কপিরাইট ফ্রি কালেকশন", "গুগল ড্রাইভ লিঙ্ক"],
    badge: "Viral"
  },
  {
    id: 8,
    category: "Premium Bundle",
    title: "ধ্রুব রাঠির প্রিমিয়াম কোর্স বান্ডেল $550 মূল্যের সব কোর্স এখন মাত্র ২৯৯ টাকায় লাইফটাইম এক্সেস সহ।",
    oldPrice: 7000,
    price: 299,
    rating: 5,
    features: ["$550 মূল্যের প্রিমিয়াম কোর্স", "ধ্রুব রাঠির সিক্রেট মেথড", "লাইফটাইম এক্সেস পাবেন", "সম্পূর্ণ ফাইল কালেকশন"],
    badge: "VIP Choice"
  },
  {
    id: 9,
    category: "Software Bundle",
    title: "পিসির সব প্রয়োজনীয় সফটওয়্যার একসাথে! | PC SOFTWARE COMBO PACK (লাইফটাইম মেয়াদ)",
    oldPrice: 999,
    price: 290,
    rating: 5,
    features: ["পিসির সকল জরুরি সফটওয়্যার", "এক ক্লিকে ইনস্টলেশন গাইড", "লাইফটাইম মেয়াদ ও ফ্রি আপডেট", "অ্যাক্টিভেশন ফাইল সহ"],
    badge: "Must Have"
  },
  {
    id: 10,
    category: "Maps & Assets",
    title: "সারা বাংলাদেশ এর অরিজিনাল মৌজা ম্যাপ মাত্র ১৯৫ টাকা",
    oldPrice: 900,
    price: 195,
    rating: 5,
    features: ["৬৪ জেলার মৌজা ম্যাপ", "অরিজিনাল ও হাই-কোয়ালিটি ফাইল", "সহজে সার্চযোগ্য তালিকা", "ভূমির পরিমাপের জন্য প্রয়োজনীয়"],
    badge: "Rare Asset"
  },
  {
    id: 11,
    category: "Government Tendering",
    title: "ই-জিপি টেন্ডার ড্রপিং প্রফেশনাল ভিডিও রেকর্ডেড কোর্স",
    oldPrice: 1000,
    price: 300,
    rating: 5,
    features: ["e-GP টেন্ডার ড্রপিং গাইড", "লাইভ প্রজেক্ট ভিডিও ক্লাস", "ট্যাক্স ও ভ্যাট হিসাব কিতাব", "লাইফটাইম সাপোর্ট"],
    badge: "Expert Level"
  },
  {
    id: 12,
    category: "YouTube Course",
    title: "মায়াজাল এর ইউটিউব সিক্রেট কোর্স",
    oldPrice: 1500,
    price: 199,
    rating: 5,
    features: ["মায়াজাল এর কন্টেন্ট মেকিং সিক্রেট", "ইউটিউব এলগরিদম হ্যাকস", "ভিডিও এডিটিং ও ভয়েস ট্রিকস", "ইউটিউব গ্রোথ স্ট্র্যাটেজি"],
    badge: "Recommended"
  }
];

const renderProductCoverMockup = (prod: any) => {
  if (prod?.imageUrl) {
    return (
      <img 
        src={prod.imageUrl} 
        alt="Product Cover" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  let imgUrl = "";
  switch (Number(prod?.id)) {
    case 1:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1500x1500_resized.png";
      break;
    case 2:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/Creative-Design-1500x1500-1.png";
      break;
    case 3:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771754322702.png";
      break;
    case 4:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771754455157.png";
      break;
    case 5:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/Modern-Style-Design-1500x1500-1.png";
      break;
    case 6:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771755150725.png";
      break;
    case 7:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771755370340.png";
      break;
    case 8:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771755568064.png";
      break;
    case 9:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771755967871.png";
      break;
    case 10:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771755998473.png";
      break;
    case 11:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771756140421.png";
      break;
    case 12:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2025/12/1771756453624.png";
      break;
    default:
      imgUrl = "https://digitalproduct4.shop/wp-content/uploads/2026/01/cropped-Gemini_Generated_Image_7f75z77f75z77f75-270x270.png";
      break;
  }

  return (
    <img 
      src={imgUrl} 
      alt="Product Cover" 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [smmCategory, setSmmCategory] = useState("social");
  const [recordsTab, setRecordsTab] = useState<"buy" | "smm">("buy");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Custom premium modals state
  const [selectedCourseCat, setSelectedCourseCat] = useState("all");
  const [showSpecialOfferAd, setShowSpecialOfferAd] = useState(false);

  // Google Gemini Pro Premium purchase form states
  const [geminiCountry, setGeminiCountry] = useState("Bangladesh");
  const [geminiCategory, setGeminiCategory] = useState<"member" | "personal">("member");
  const [geminiPlan, setGeminiPlan] = useState<"1month" | "3month" | "6month" | "12month">("12month");
  const [geminiEmail, setGeminiEmail] = useState("");
  const [geminiPassword, setGeminiPassword] = useState("");
  const [geminiBackupCodes, setGeminiBackupCodes] = useState("");
  const [selectedToolDetail, setSelectedToolDetail] = useState<string | null>(null);
  const [geminiCountrySearch, setGeminiCountrySearch] = useState("");

  // Subscriptions states
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [editingFamilyEmails, setEditingFamilyEmails] = useState<Record<string, string>>({});
  const [adminSubSearch, setAdminSubSearch] = useState("");
  const [adminSubFilter, setAdminSubFilter] = useState<"all" | "expiring" | "active" | "expired">("all");

  // Success Receipt Modal state for order confirmation
  const [successReceipt, setSuccessReceipt] = useState<{
    txId?: string;
    title: string;
    category: string;
    priceUSD: number;
    details: Record<string, any>;
  } | null>(null);

  // Global listener for other components to trigger the receipt modal
  useEffect(() => {
    (window as any).triggerPurchaseSuccess = (data: {
      txId?: string;
      title: string;
      category: string;
      priceUSD: number;
      details: Record<string, any>;
    }) => {
      setSuccessReceipt(data);
    };
    return () => {
      delete (window as any).triggerPurchaseSuccess;
    };
  }, []);

  // Bind triggerAdClick to show the Special Offer ad
  useEffect(() => {
    (window as any).triggerAdClick = () => {
      setShowSpecialOfferAd(true);
    };
    return () => {
      delete (window as any).triggerAdClick;
    };
  }, []);

  // Dynamic Monetag loading (only when logged in)
  useEffect(() => {
    if (!currentUser) return; // Do not load on login/register pages
    
    
    
    
  }, [currentUser]);

  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [socialMarkupPercent, setSocialMarkupPercent] = useState(25);
  const [smmMarkupData, setSmmMarkupData] = useState<Record<string, any>>({});
  const [paymentKeys, setPaymentKeys] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "api_keys"), (docSnap) => {
      if (docSnap.exists()) {
        setPaymentKeys(docSnap.data());
      }
    }, (error) => console.error("api_keys onSnapshot error", error));
    return () => unsub();
  }, []);

    useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "smm_markup"), (docSnap) => {
      if (docSnap.exists()) {
        setSmmMarkupData(docSnap.data());
      }
    }, (error) => console.error("smm_markup onSnapshot error", error));
    return () => unsub();
  }, []);

  // Load global markup
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "markup"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.telegram !== undefined) setMarkupPercent(data.telegram);
        if (data.social !== undefined) setSocialMarkupPercent(data.social);
      }
    }, (error) => console.error("markup onSnapshot error", error));
    return () => unsub();
  }, []);

  // User Dashboard State
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [balanceAnimate, setBalanceAnimate] = useState(false);
  const prevBalanceRef = useRef(balanceUSD);
  const runningVerificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (balanceUSD !== prevBalanceRef.current) {
      setBalanceAnimate(true);
      const t = setTimeout(() => setBalanceAnimate(false), 500);
      prevBalanceRef.current = balanceUSD;
      return () => clearTimeout(t);
    }
  }, [balanceUSD]);

  const [numericId, setNumericId] = useState<number | null>(null);
  const [customReferralCode, setCustomReferralCode] = useState<string | null>(null);
  const [userReferredBy, setUserReferredBy] = useState<string | null>(null);
  const [topupModal, setTopupModal] = useState(false);
  const [binanceTransferAmount, setBinanceTransferAmount] = useState<number | null>(null);
  const [binanceOrderId, setBinanceOrderId] = useState("");
  const [binanceOrderIdError, setBinanceOrderIdError] = useState("");
  const [binanceStep, setBinanceStep] = useState<1 | 2>(1);
  const [isSubmitBinance, setIsSubmitBinance] = useState(false);
  const [p2pModal, setP2pModal] = useState<any>(null);
  const [topupStep, setTopupStep] = useState<1 | 2>(1);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [topupMethod, setTopupMethod] = useState<
    "bkash" | "nagad" | "binance" | "crypto" | null
  >(null);
  const [topupInputBdt, setTopupInputBdt] = useState<number | "">("");
  const [topupInputUsd, setTopupInputUsd] = useState<number | "">("");
  const [topupAmount, setTopupAmount] = useState<number | "">("");

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [withdrawMethod, setWithdrawMethod] = useState<
    "Binance" | "BSC-USDT" | "bKash" | "Nagad"
  >("Binance");
  const [withdrawDetails, setWithdrawDetails] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  const askConfirmation = (msg: string, callback: () => void) => {
    setConfirmModal({
      show: true,
      message: msg,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        callback();
      }
    });
  };

  const handleAiGenerateProductDetails = async () => {
    if (!adminCourseForm.title) {
      toast.error("Please enter a Product Title first to generate details!");
      return;
    }
    setGeneratingProductDetails(true);
    try {
      const res = await fetch("/api/admin/product/generate-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: adminCourseForm.title,
          category: adminCourseForm.category,
          badge: adminCourseForm.badge
        })
      });
      const data = await res.json();
      if (data.description || data.featuresString) {
        setAdminCourseForm(prev => ({
          ...prev,
          description: data.description || prev.description,
          featuresString: data.featuresString || prev.featuresString
        }));
        toast.success("AI Details & Features generated successfully!");
      } else if (data.error) {
        toast.error(`AI Error: ${data.error}`);
      } else {
        toast.error("Failed to generate details. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Network error while generating details.");
    } finally {
      setGeneratingProductDetails(false);
    }
  };

  const handleBulkAiGenerateProductDetails = async () => {
    const listToProcess = coursesList.length > 0 ? coursesList : premiumProducts;
    if (listToProcess.length === 0) {
      toast.error("No products/courses found to generate descriptions!");
      return;
    }

    askConfirmation(
      `Are you sure you want to bulk generate AI descriptions and key features for all ${listToProcess.length} products? This may take some time.`,
      async () => {
        setBulkGenerating(true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < listToProcess.length; i++) {
          const prod = listToProcess[i];
          setBulkProgress({
            current: i + 1,
            total: listToProcess.length,
            title: prod.title
          });

          try {
            const res = await fetch("/api/admin/product/generate-details", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: prod.title,
                category: prod.category,
                badge: prod.badge
              })
            });
            const data = await res.json();
            if (data.description || data.featuresString) {
              const featuresListParsed = data.featuresString
                ? data.featuresString.split(",").map((f: string) => f.trim()).filter(Boolean)
                : [];
              
              await setDoc(doc(db, "courses", String(prod.id)), {
                category: prod.category || "General",
                title: prod.title,
                description: data.description || "",
                oldPrice: Number(prod.oldPrice) || 0,
                price: Number(prod.price) || 0,
                rating: Number(prod.rating) || 5,
                badge: prod.badge || "Trending",
                features: featuresListParsed,
                imageUrl: prod.imageUrl || ""
              }, { merge: true });
              
              successCount++;
            } else {
              console.warn(`Failed to generate details for product ID ${prod.id}: ${data.error || 'Unknown response'}`);
              failCount++;
            }
          } catch (err) {
            console.error(`Error generating details for product ID ${prod.id}:`, err);
            failCount++;
          }
        }

        setBulkGenerating(false);
        toast.success(`Bulk AI generation complete! Success: ${successCount}, Failed: ${failCount}`);
      }
    );
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCourseForm.title) {
      toast("Please enter a title");
      return;
    }
    const courseId = adminCourseForm.id || String(Date.now());
    const features = adminCourseForm.featuresString
      ? adminCourseForm.featuresString.split(",").map(f => f.trim()).filter(Boolean)
      : [];

    const courseData = {
      category: adminCourseForm.category,
      title: adminCourseForm.title,
      description: adminCourseForm.description || "",
      oldPrice: Number(adminCourseForm.oldPrice) || 0,
      price: Number(adminCourseForm.price) || 0,
      rating: Number(adminCourseForm.rating) || 5,
      badge: adminCourseForm.badge || "Trending",
      features: features,
      imageUrl: adminCourseForm.imageUrl || ""
    };

    try {
      await setDoc(doc(db, "courses", courseId), courseData);
      toast("Course saved successfully!");
      setAdminEditingCourse(null);
      setAdminCourseForm({
        id: "",
        category: "Language & Skills",
        title: "",
        description: "",
        oldPrice: 0,
        price: 0,
        rating: 5,
        badge: "Trending",
        featuresString: "",
        imageUrl: ""
      });
    } catch (error) {
      console.error("Error saving course", error);
      toast("Error saving course");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    askConfirmation("Are you sure you want to delete this course/product?", async () => {
      try {
        await deleteDoc(doc(db, "courses", courseId));
        toast("Course deleted successfully!");
      } catch (error) {
        console.error("Error deleting course", error);
        toast("Error deleting course");
      }
    });
  };

  const handleBuyCourse = async (prod: any) => {
    if (!currentUser) return requireAuth();
    const priceUSD = Number((prod.price / TOPUP_RATE).toFixed(2));
    if (balanceUSD < priceUSD) {
      toast(`Insufficient balance. You need $${priceUSD.toFixed(2)} USD to purchase this course.`);
      return;
    }

    askConfirmation(
      `Confirm purchase of "${prod.title}" for $${priceUSD.toFixed(2)} USD?`,
      async () => {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            balanceUSD: increment(-priceUSD),
            total_spent: increment(priceUSD),
            last_update: Date.now()
          });

          const txRef = doc(collection(db, "transactions"));
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "purchase_course",
            txType: "Debit",
            amountUSD: priceUSD,
            status: "success",
            details: { title: prod.title, category: prod.category, url: "Instant delivery requested" },
            createdAt: Date.now(),
          });

          setSuccessReceipt({
            txId: txRef.id,
            title: prod.title,
            category: "Premium Course 📂",
            priceUSD: priceUSD,
            details: {
              "Course Category": prod.category || "N/A",
              "Delivery System": "Google Drive Link",
              "Instructions": lang === "bn"
                ? "আপনার কোর্সটি সফলভাবে কেনা হয়েছে! আপনার ট্রানজেকশন আইডি সহ নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে ডিরেক্ট গুগল ড্রাইভ ডাউনলোড লিংকটি সংগ্রহ করুন।"
                : "Your course was purchased successfully! Click the WhatsApp button below with your transaction details to claim your direct Google Drive download link."
            }
          });
        } catch (error) {
          console.error("Error completing purchase", error);
          toast("Error completing purchase");
        }
      }
    );
  };

  const handleBuyTool = async (tool: any) => {
    if (!currentUser) return requireAuth();
    const priceUSD = tool.price;
    if (balanceUSD < priceUSD) {
      toast(`Insufficient balance. You need $${priceUSD.toFixed(2)} USD to purchase this.`);
      return;
    }

    askConfirmation(
      `Confirm purchase of "${tool.title}" for $${priceUSD.toFixed(2)} USD?`,
      async () => {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            balanceUSD: increment(-priceUSD),
            total_spent: increment(priceUSD),
            last_update: Date.now()
          });

          const txRef = doc(collection(db, "transactions"));
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "purchase_tool",
            txType: "Debit",
            amountUSD: priceUSD,
            status: "success",
            details: { title: tool.title, category: tool.category, url: "Instant tool setup requested" },
            createdAt: Date.now(),
          });

          setSuccessReceipt({
            txId: txRef.id,
            title: tool.title,
            category: "Premium Tool / Account 🛠️",
            priceUSD: priceUSD,
            details: {
              "Tool Category": tool.category || "N/A",
              "Status": "Ready for Setup",
              "Instructions": lang === "bn"
                ? "আপনার টুল/প্রোডাক্টটি সফলভাবে কেনা হয়েছে! অ্যাক্টিভেশন ও ডাউনলোড ডিটেইলস পেতে নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে আমাদের সাথে যোগাযোগ করুন।"
                : "Your tool/product was purchased successfully! Click the WhatsApp button below with your transaction details to claim your activation & download details."
            }
          });
        } catch (error) {
          console.error("Error completing purchase", error);
          toast("Error completing purchase");
        }
      }
    );
  };

  const handleBuyGemini = async () => {
    if (!currentUser) return requireAuth();
    
    // Calculate country and plan price dynamically based on 12-Month base prices
    const base12MonthPrice = geminiCountryPrices12M[geminiCountry] || 9.99;
    let priceUSD = base12MonthPrice;
    let durationDays = 365;
    let planDbString = "member_12m";

    if (geminiCategory === "personal") {
      priceUSD = base12MonthPrice * 3.8;
      durationDays = 365;
      planDbString = "personal_12m";
    } else {
      // Gemini Member category
      if (geminiPlan === "1month") {
        priceUSD = Math.max(0.99, Math.round((base12MonthPrice * 0.25) * 100) / 100);
        durationDays = 30;
        planDbString = "member_1m";
      } else if (geminiPlan === "3month") {
        priceUSD = Math.max(1.99, Math.round((base12MonthPrice * 0.45) * 100) / 100);
        durationDays = 90;
        planDbString = "member_3m";
      } else if (geminiPlan === "6month") {
        priceUSD = Math.max(2.99, Math.round((base12MonthPrice * 0.70) * 100) / 100);
        durationDays = 180;
        planDbString = "member_6m";
      } else {
        priceUSD = base12MonthPrice;
        durationDays = 365;
        planDbString = "member_12m";
      }
    }

    if (!geminiEmail) {
      toast("Please enter your Gmail address.");
      return;
    }

    // Password and Backup Codes are only required for the Personal category (12-Month Personal Plan)
    if (geminiCategory === "personal") {
      if (!geminiPassword) {
        toast("Please enter your Gmail password for the 12-Month Personal Plan.");
        return;
      }
      if (!geminiBackupCodes) {
        toast("Please enter your Authentication Key for the 12-Month Personal Plan.");
        return;
      }
    }

    if (balanceUSD < priceUSD) {
      toast(`Insufficient balance. You need $${priceUSD.toFixed(2)} USD to purchase this subscription.`);
      return;
    }

    const planTitle = `Google Gemini Pro Premium (${
      geminiCategory === "personal" 
        ? "12-Month Personal" 
        : `Member - ${geminiPlan === "1month" ? "1-Month" : geminiPlan === "3month" ? "3-Month" : geminiPlan === "6month" ? "6-Month" : "12-Month"}`
    }) - ${geminiCountry}`;

    askConfirmation(
      `Confirm purchase of "${planTitle}" for $${priceUSD.toFixed(2)} USD?`,
      async () => {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            balanceUSD: increment(-priceUSD),
            total_spent: increment(priceUSD),
            last_update: Date.now()
          });

          const txRef = doc(collection(db, "transactions"));
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "purchase_gemini",
            txType: "Debit",
            amountUSD: priceUSD,
            status: "success",
            details: { 
              title: planTitle, 
              category: "Premium AI Subscription", 
              country: geminiCountry, 
              plan: planDbString, 
              email: geminiEmail,
              password: geminiCategory === "personal" ? geminiPassword : "Not Required",
              backupCodes: geminiCategory === "personal" ? geminiBackupCodes : "Not Required",
              url: "Gemini activation requested"
            },
            createdAt: Date.now(),
          });

          // Write subscription document
          const createdAt = Date.now();
          const expiresAt = 0;
          const subRef = doc(collection(db, "gemini_subscriptions"));
          
          await setDoc(subRef, {
            id: subRef.id,
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email?.split("@")[0] || "No Name",
            userEmail: currentUser.email || "No Email",
            geminiEmail: geminiEmail,
            geminiPassword: geminiCategory === "personal" ? geminiPassword : "Not Required",
            geminiBackupCodes: geminiCategory === "personal" ? geminiBackupCodes : "Not Required",
            plan: planDbString,
            priceUSD: priceUSD,
            country: geminiCountry,
            createdAt: createdAt,
            durationDays: durationDays,
            expiresAt: expiresAt,
            status: "pending",
            familyManagerEmail: "Not Assigned"
          });

          setSuccessReceipt({
            txId: txRef.id,
            title: planTitle,
            category: "Google Gemini Subscription ⚡",
            priceUSD: priceUSD,
            details: {
              "Gmail Address": geminiEmail,
              "Account Type": geminiCategory === "personal" ? "Personal (Private)" : "Member (Shared Family)",
              "Duration": `${durationDays} Days`,
              "Country Zone": geminiCountry,
              "Delivery Type": "Manual (5 mins - 2 hours)",
              "Instructions": lang === "bn"
                ? "আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে এবং এক্টিভেশন পেন্ডিং রয়েছে (৫ মিনিট - ২ ঘণ্টা)। দ্রুততম সময়ে অ্যাক্টিভেট করতে অনুগ্রহ করে নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে আমাদের সাথে যোগাযোগ করুন।"
                : "Your order was placed successfully and activation is pending (5 mins - 2 hours). To get it activated immediately, please click the WhatsApp button below to contact our support."
            }
          });
          
          setGeminiEmail("");
          setGeminiPassword("");
          setGeminiBackupCodes("");
        } catch (error) {
          console.error("Error completing purchase", error);
          toast("Error completing purchase");
        }
      }
    );
  };

  const [purchasedNumber, setPurchasedNumber] = useState<{
    number: string;
    code?: string;
    pass?: string;
    txId?: string;
  } | null>(null);



  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminTxs, setAdminTxs] = useState<any[]>([]);
  const [adminSearchTxId, setAdminSearchTxId] = useState("");
  const [adminTab, setAdminTab] = useState<"overview" | "orders" | "topups" | "withdrawals" | "failed" | "users" | "services" | "settings" | "courses" | "subscriptions" | "tickets">("overview");
  const [adminUnreadTickets, setAdminUnreadTickets] = useState(0);
  const [adminSubTab, setAdminSubTab] = useState<"pending" | "paid">("pending");

  const [adminAddBalanceUid, setAdminAddBalanceUid] = useState("");
  const [adminAddBalanceAmount, setAdminAddBalanceAmount] = useState<
    number | ""
  >("");
  const [adminBannerSettings, setAdminBannerSettings] = useState<{ banners: { imageUrl: string, linkUrl: string }[], isActive: boolean }>({ banners: [], isActive: false });
  const [dashboardButtons, setDashboardButtons] = useState<Record<string, any>>({});
  const [isPublishingBanner, setIsPublishingBanner] = useState(false);
  const [activeUsersStats, setActiveUsersStats] = useState({
    live: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [referredUsers, setReferredUsers] = useState<any[]>([]);

  // Courses list and admin states
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [adminEditingCourse, setAdminEditingCourse] = useState<any | null>(null);
  const [generatingProductDetails, setGeneratingProductDetails] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, title: "" });
  const [adminCourseForm, setAdminCourseForm] = useState({
    id: "",
    category: "Language & Skills",
    title: "",
    description: "",
    oldPrice: 0,
    price: 0,
    rating: 5,
    badge: "Trending",
    featuresString: "",
    imageUrl: ""
  });

  // local error states
  const [buyErrorId, setBuyErrorId] = useState<string | null>(null);
  const [topupError, setTopupError] = useState("");
  const [generatedPaymentUrl, setGeneratedPaymentUrl] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState("");

  const [binanceConfig, setBinanceConfig] = useState({ id: "1174790336", qrUrl: "" });
  const [adminBinanceConfig, setAdminBinanceConfig] = useState({ id: "1174790336", qrUrl: "" });
  const [isPublishingBinance, setIsPublishingBinance] = useState(false);

  // Load Binance config
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "binance"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const conf = { id: data.id || "1174790336", qrUrl: data.qrUrl || "" };
        setBinanceConfig(conf);
        setAdminBinanceConfig(conf);
      }
    }, (error) => console.error("binance onSnapshot error", error));
    return () => unsub();
  }, []);

  // Load dashboard buttons config
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "dashboard_buttons"), (docSnap) => {
      if (docSnap.exists()) {
        setDashboardButtons(docSnap.data());
      }
    }, (error) => console.error("dashboard_buttons onSnapshot error", error));
    return () => unsub();
  }, []);

  // Load global banner data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "banner"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let loadedBanners = data.banners || [];
        if (loadedBanners.length === 0 && data.imageUrl) {
          loadedBanners = [{ imageUrl: data.imageUrl, linkUrl: data.linkUrl || "" }];
        }
        setAdminBannerSettings({
          banners: loadedBanners,
          isActive: data.isActive || false,
        });
      }
    }, (error) => console.error("banner onSnapshot error", error));
    return () => unsub();
  }, []);

  // Load referred users data
  useEffect(() => {
    if (currentView !== "profile" || !currentUser) return;
    const q = query(
      collection(db, "users"),
      where("referredBy", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setReferredUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("users/referredBy query error", error)
    );
    return () => unsub();
  }, [currentView, currentUser]);

  // Load courses / premium products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => {
          const numA = Number(a.id);
          const numB = Number(b.id);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return String(a.id).localeCompare(String(b.id));
        });
        setCoursesList(list);
      } else {
        const initialProducts = [
          {
            id: "1",
            category: "Language & Skills",
            title: "সহজে ইংরেজি শিখার জনপ্রিয় ৬০টি+ PDF BOOK এবং ১৭০+ ভিডিও ক্লাস পাচ্ছেন মাত্র ৯৯ টাকায়",
            oldPrice: 700,
            price: 99,
            rating: 5,
            features: ["৬০+ প্রিমিয়াম PDF বই", "১৭০+ ভিডিও টিউটোরিয়াল", "আজীবন এক্সেস", "মোবাইল ও পিসি ফ্রেন্ডলি"],
            badge: "Best Seller",
            imageUrl: ""
          },
          {
            id: "2",
            category: "AI & Reels",
            title: "50000+ রেডিমেইড AI REELS ভিডিও",
            oldPrice: 1000,
            price: 199,
            rating: 5,
            features: ["৫০,০০০+ রেডি রিলস", "উচ্চ মানের ভিডিও (HD)", "কপিরাইট ফ্রি কন্টেন্ট", "ইনস্ট্যান্ট ডাউনলোড লিঙ্ক"],
            badge: "Trending",
            imageUrl: ""
          },
          {
            id: "3",
            category: "AI & Reels",
            title: "৫০ হাজারের বেশী ট্রেন্ডি AI কপিরাইট ফ্রি রিল্স ভিডিও!",
            oldPrice: 400,
            price: 120,
            rating: 5,
            features: ["ট্রেন্ডি এআই ভিডিওস", "১০০% কপিরাইট মুক্ত", "ভাইরাল হওয়ার গ্যারান্টি", "গুগল ড্রাইভ এক্সেস"],
            badge: "Hot Offer",
            imageUrl: ""
          },
          {
            id: "4",
            category: "Entertainment & Video",
            title: "৫০,০০০+ কপিরাইট ফ্রি রেডি টু আপলোড মুভি ক্লিপ বান্ডেল!",
            oldPrice: 1000,
            price: 250,
            rating: 5,
            features: ["মুভি ক্লিপস কালেকশন", "কপিরাইট ছাড়াই আপলোড", "ফেসবুক ও ইউটিউবের জন্য", "লাইফটাইম ডাউনলোড সুবিধা"],
            badge: "Popular",
            imageUrl: ""
          },
          {
            id: "5",
            category: "E-Commerce Course",
            title: "শহিদ আনোয়ার এর 297 ডলারের AMAZON FBA ফুল কোর্স",
            oldPrice: 3500,
            price: 190,
            rating: 5,
            features: ["২৯৭ ডলারের কোর্স মাত্র ১৯০৳", "ধাপ-বাই-ধাপ গাইডলাইন", "অ্যামাজন সেলার অ্যাকাউন্ট সেটআপ", "বাংলা সাবটাইটেল/ভাষা"],
            badge: "Premium",
            imageUrl: ""
          },
          {
            id: "6",
            category: "Animation Course",
            title: "2D, 3D, Whiteboard, Mobile এনিমেশন ফুল কোর্স!",
            oldPrice: 1000,
            price: 155,
            rating: 5,
            features: ["৩ডি ও ২ডি এনিমেশন শিক্ষা", "হোয়াইটবোর্ড ও মোবাইল এনিমেশন", "সহজ বাংলা টিউটোরিয়াল", "প্রয়োজনীয় সকল সফটওয়্যার"],
            badge: "Super Course",
            imageUrl: ""
          },
          {
            id: "7",
            category: "ASMR & Reels",
            title: "১ হাজার+ ট্রেন্ডিং AI গ্লাস কাটিং রিল্স ভিডিও বান্ডেল",
            oldPrice: 300,
            price: 145,
            rating: 5,
            features: ["১০০০+ এআই গ্লাস কাটিং ভিডিও", "ভাইরাল ASMR সাউন্ড", "কপিরাইট ফ্রি কালেকশন", "গুগল ড্রাইভ লিঙ্ক"],
            badge: "Viral",
            imageUrl: ""
          },
          {
            id: "8",
            category: "Premium Bundle",
            title: "ধ্রুব রাঠির প্রিমিয়াম কোর্স বান্ডেল $550 মূল্যের সব কোর্স এখন মাত্র ২৯৯ টাকায় লাইফটাইম এক্সেস সহ।",
            oldPrice: 7000,
            price: 299,
            rating: 5,
            features: ["$550 মূল্যের প্রিমিয়াম কোর্স", "ধ্রুব রাঠির সিক্রেট মেথড", "লাইফটাইম এক্সেস পাবেন", "সম্পূর্ণ ফাইল কালেকশন"],
            badge: "VIP Choice",
            imageUrl: ""
          },
          {
            id: "9",
            category: "Software Bundle",
            title: "পিসির সব প্রয়োজনীয় সফটওয়্যার একসাথে! | PC SOFTWARE COMBO PACK (লাইফটাইম মেয়াদ)",
            oldPrice: 999,
            price: 290,
            rating: 5,
            features: ["পিসির সকল জরুরি সফটওয়্যার", "এক ক্লিকে ইনস্টলেশন গাইড", "লাইফটাইম মেয়াদ ও ফ্রি আপডেট", "অ্যাক্টিভেশন ফাইল সহ"],
            badge: "Must Have",
            imageUrl: ""
          },
          {
            id: "10",
            category: "Maps & Assets",
            title: "সারা বাংলাদেশ এর অরিজিনাল মৌজা ম্যাপ মাত্র ১৯৫ টাকা",
            oldPrice: 900,
            price: 195,
            rating: 5,
            features: ["৬৪ জেলার মৌজা ম্যাপ", "অরিজিনাল ও হাই-কোয়ালিটি ফাইল", "সহজে সার্চযোগ্য তালিকা", "ভূমির পরিমাপের জন্য প্রয়োজনীয়"],
            badge: "Rare Asset",
            imageUrl: ""
          },
          {
            id: "11",
            category: "Government Tendering",
            title: "ই-জিপি টেন্ডার ড্রপিং প্রফেশনাল ভিডিও রেকর্ডেড কোর্স",
            oldPrice: 1000,
            price: 300,
            rating: 5,
            features: ["e-GP টেন্ডার ড্রপিং গাইড", "লাইভ প্রজেক্ট ভিডিও ক্লাস", "ট্যাক্স ও ভ্যাট হিসাব কিতাব", "লাইফটাইম সাপোর্ট"],
            badge: "Expert Level",
            imageUrl: ""
          },
          {
            id: "12",
            category: "YouTube Course",
            title: "মায়াজাল এর ইউটিউব সিক্রেট কোর্স",
            oldPrice: 1500,
            price: 199,
            rating: 5,
            features: ["মায়াজাল এর কন্টেন্ট মেকিং সিক্রেট", "ইউটিউব এলগরিদম হ্যাকস", "ভিডিও এডিটিং ও ভয়েস ট্রিকস", "ইউটিউব গ্রোথ স্ট্র্যাটেজি"],
            badge: "Recommended",
            imageUrl: ""
          },
          {
            id: "13",
            category: "Tool",
            title: "Telegram Member Adder Bot",
            description: "যেকোনো পাবলিক বা টার্গেটেড গ্রুপ থেকে একটিভ মেম্বারদের স্ক্র্যাপ করে সম্পূর্ণ নিরাপদে অটোমেটিক থ্রোটলিং-সহ আপনার নিজের চ্যানেল বা গ্রুপে এড করুন। / Extract active members from niche groups and add them directly into your channel/group safely with auto-throttling.",
            oldPrice: 59.99,
            price: 29.99,
            rating: 5,
            features: [
              "Multiple account rotation (anti-ban)",
              "Active user filtering (online filters)",
              "Windows / VPS ready software bundle",
              "Step-by-step video setup guides"
            ],
            badge: "50% OFF",
            imageUrl: ""
          },
          {
            id: "14",
            category: "Subscription",
            title: "VIP Membership Subscription",
            description: "আমাদের পুরো প্ল্যাটফর্ম জুড়ে পাইকারি মূল্যে অর্ডার করার অ্যাক্সেস, ফাস্ট প্রায়োরিটি সাপোর্ট এবং ডেডিকেটেড রিকভারি হেল্পলাইন পান। / Unlock wholesale prices across the entire platform, priority customer service, instant stock restock alerts, and exclusive seller tools.",
            oldPrice: 29.99,
            price: 15.00,
            rating: 5,
            features: [
              "0% Purchase markup on Telegram Accounts",
              "24/7 dedicated account recovery help",
              "Early access to fresh country stocks",
              "VIP badge on dashboard profile page"
            ],
            badge: "VIP Privileges",
            imageUrl: ""
          }
        ];
        // Only seed courses in Firestore if the logged-in user is an admin!
        const isUserAdmin = currentUser && (
          currentUser.email === "uzvsbdnzyxhzj@gmail.com" || 
          currentUser.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2"
        );
        if (isUserAdmin) {
          initialProducts.forEach((p: any) => {
            setDoc(doc(db, "courses", p.id), {
              category: p.category,
              title: p.title,
              description: p.description || "",
              oldPrice: p.oldPrice,
              price: p.price,
              rating: p.rating,
              features: p.features,
              badge: p.badge,
              imageUrl: p.imageUrl
            }).catch(err => console.error("Error seeding initial course", p.id, err));
          });
        }
        setCoursesList(initialProducts);
      }
    }, (error) => console.error("courses snapshot error", error));
    return () => unsub();
  }, [currentUser]);

  // Global click event for requesting notifications
  useEffect(() => {
    const handleInteraction = () => {
      requestNotificationPermission();
      document.removeEventListener("click", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  // Removed global Monetag Popunder Ad listener as per user request to only track specific buttons

  // Load admin data
  useEffect(() => {
    if (currentView !== "admin") return;

    let isInitialAdminLoad = true;
    // Pending withdrawals
    const qAdminTxs = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
    );

    const unsubAdminTxs = onSnapshot(qAdminTxs, (snapshot) => {
      if (!isInitialAdminLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const tx = change.doc.data();
            if (tx.status === "pending" && tx.type === "withdraw") {
              sendNotification(`New Withdrawal Request`, {
                body: `User requested a ${tx.type} of \$${tx.amountUSD?.toFixed(2)}`,
              });
            }
          }
        });
      }
      setAdminTxs(
        snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
      isInitialAdminLoad = false;
    }, (error) => console.error("admin transactions query error", error));

    // Active users
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const now = Date.now();
      let live = 0,
        daily = 0,
        weekly = 0,
        monthly = 0;
      snapshot.forEach((doc) => {
        const lastActive = doc.data().lastActiveAt || 0;
        if (now - lastActive < 5 * 60 * 1000) live++; // 5 mins
        if (now - lastActive < 24 * 60 * 60 * 1000) daily++;
        if (now - lastActive < 7 * 24 * 60 * 60 * 1000) weekly++;
        if (now - lastActive < 30 * 24 * 60 * 60 * 1000) monthly++;
      });
      setActiveUsersStats({ live, daily, weekly, monthly });
    }, (error) => console.error("users stats query error", error));

    // Admin fetch all gemini subscriptions
    const qAdminSubs = query(
      collection(db, "gemini_subscriptions"),
      orderBy("createdAt", "desc")
    );
    const unsubAdminSubs = onSnapshot(qAdminSubs, (snapshot) => {
      setAllSubscriptions(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    }, (error) => console.error("admin subscriptions snapshot error", error));

    // Real-time unread support tickets count for admin
    const qUnreadTickets = query(
      collection(db, "tickets"),
      where("unreadByAdmin", "==", true)
    );
    const unsubUnreadTickets = onSnapshot(qUnreadTickets, (snapshot) => {
      setAdminUnreadTickets(snapshot.size);
    }, (error) => console.error("admin unread tickets snapshot error", error));

    return () => {
      unsubAdminTxs();
      unsubUsers();
      unsubAdminSubs();
      unsubUnreadTickets();
    };
  }, [currentView]);

  // Localization State
  const [lang, setLang] = useState<Language>("en");
  const i18n = t[lang];

  // Multi-currency display state
  const [displayCurrency, setDisplayCurrency] = useState<string>("USD");

  const formatCurrency = (amountUSD: number) => {
    return formatValueWithCurrency(amountUSD, displayCurrency);
  };

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showLanding, setShowLanding] = useState(true);

  // Atomic double-spend secure wallet crediting system
  const executeAtomicTopUpCredit = async (txId: string, amountUSD: number, userId: string) => {
    if (!db) return false;
    try {
      const result = await runTransaction(db, async (trans) => {
        const txDocRef = doc(db, "transactions", txId);
        const txSnap = await trans.get(txDocRef);
        if (!txSnap.exists()) {
          console.warn(`[Atomic Credit] Transaction ${txId} does not exist.`);
          return { success: false, code: "not_found" };
        }
        
        const txData = txSnap.data();
        if (txData.status === "paid") {
          console.log(`[Atomic Credit] Transaction ${txId} is already marked paid.`);
          return { success: false, code: "already_paid" };
        }

        const userDocRef = doc(db, "users", userId);
        const userSnap = await trans.get(userDocRef);
        if (!userSnap.exists()) {
          console.warn(`[Atomic Credit] User ${userId} does not exist.`);
          return { success: false, code: "user_not_found" };
        }

        // Update transaction status
        trans.update(txDocRef, { 
          status: "paid",
          last_verified: Date.now()
        });

        // Update user balance safely
        trans.update(userDocRef, {
          balanceUSD: increment(amountUSD),
          total_deposited: increment(amountUSD),
          last_update: Date.now()
        });

        // Compute referral award in transaction
        const referredBy = userSnap.data().referredBy;
        let referralCreated = null;
        
        // Determine if current logged-in user is an admin
        const isCurrentUserAdmin = currentUser && (
          currentUser.email === "uzvsbdnzyxhzj@gmail.com" || 
          currentUser.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2"
        );

        if (referredBy) {
          if (isCurrentUserAdmin) {
            const referrerDocRef = doc(db, "users", referredBy);
            const referrerSnap = await trans.get(referrerDocRef);
            if (referrerSnap.exists()) {
              const bonusAmount = amountUSD * 0.01;
              trans.update(referrerDocRef, {
                balanceUSD: increment(bonusAmount),
                total_deposited: increment(bonusAmount),
                referralEarnings: increment(bonusAmount),
                last_update: Date.now()
              });

              const refTxRef = doc(collection(db, "transactions"));
              trans.set(refTxRef, {
                userId: referredBy,
                type: "referral_bonus",
                txType: "Credit",
                amountUSD: bonusAmount,
                status: "success",
                createdAt: Date.now(),
                details: { message: `1% Referral Bonus from ${userSnap.data().email || 'User'}'s topup` }
              });
              referralCreated = { referredBy, bonusAmount };
            }
          } else {
            // For normal users, we cannot write to the referrer's document or create a transaction for them.
            // So we flag the referral bonus as pending, allowing the Admin's background loop to credit it securely.
            trans.update(txDocRef, {
              "details.referral_bonus_pending": true,
              "details.referrerId": referredBy
            });
          }
        }

        return { success: true, referralCreated };
      });

      return result.success;
    } catch (err) {
      console.error("[Atomic Credit] Transaction execution error:", err);
      return false;
    }
  };

  // Poll for webhook-verified transactions
  useEffect(() => {
    if (!currentUser || !db) return;
    const interval = setInterval(async () => {
       const userPendingTxs = transactions.filter(tx => tx.userId === currentUser.uid && tx.status === 'pending' && tx.type === 'topup' && (tx.details?.method !== "binance_manual"));
       for (const tx of userPendingTxs) {
          if (runningVerificationsRef.current.has(tx.id)) {
             continue;
          }
          runningVerificationsRef.current.add(tx.id);
          try {
             let invoiceParam = "";
             let invoiceIdVal = tx.details?.invoice_id;
             if (!invoiceIdVal && tx.details?.payment_url) {
                const parts = tx.details.payment_url.split('/');
                let matchedId = parts[parts.length - 1];
                if (matchedId) {
                   if (matchedId.includes('?')) {
                      matchedId = matchedId.split('?')[0];
                   }
                   invoiceIdVal = matchedId;
                }
             }
             if (invoiceIdVal) {
                invoiceParam = `&invoice_id=${invoiceIdVal}`;
             }
             
             const apiKeyParam = paymentKeys?.paymentlyApiKey ? `&paymentlyApiKey=${paymentKeys.paymentlyApiKey}` : "";
             const cryptomusIdParam = paymentKeys?.cryptomusMerchantId ? `&cryptomusMerchantId=${paymentKeys.cryptomusMerchantId}` : "";
             const cryptomusKeyParam = paymentKeys?.cryptomusPaymentKey ? `&cryptomusPaymentKey=${paymentKeys.cryptomusPaymentKey}` : "";

             const res = await fetch(`/api/payment/verify?txId=${tx.id}${invoiceParam}${apiKeyParam}${cryptomusIdParam}${cryptomusKeyParam}`);
             if (res.ok) {
                 const data = await res.json();
                 if (data.paid) {
                    console.log(`Transaction ${tx.id} verified via API polling. Updating atomic credit...`);
                    const success = await executeAtomicTopUpCredit(tx.id, tx.amountUSD, currentUser.uid);
                    if (success) {
                       toast.success(`Topup of $${tx.amountUSD} was successfully credited!`);
                    }
                 }
             }
          } catch(e) {
             // silently ignore polling network errors
          } finally {
             runningVerificationsRef.current.delete(tx.id);
          }
       }
    }, 5000);
    return () => clearInterval(interval);
  }, [transactions, currentUser, db, paymentKeys]);

  // Admin auto-verification loop for all pending automatic top-up transactions (bKash, Nagad, Cryptomus)
  useEffect(() => {
    if (!currentUser || !db) return;
    const isUserAdmin = (currentUser.email === "uzvsbdnzyxhzj@gmail.com" || currentUser.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2");
    if (!isUserAdmin) return;

    const interval = setInterval(async () => {
       const pendingTxs = adminTxs.filter((tx: any) => tx.status === 'pending' && tx.type === 'topup' && (tx.details?.method !== "binance_manual"));
       for (const tx of pendingTxs) {
          if (runningVerificationsRef.current.has(tx.id)) {
             continue;
          }
          runningVerificationsRef.current.add(tx.id);
          try {
             let invoiceParam = "";
             let invoiceIdVal = tx.details?.invoice_id;
             if (!invoiceIdVal && tx.details?.payment_url) {
                const parts = tx.details.payment_url.split('/');
                let matchedId = parts[parts.length - 1];
                if (matchedId) {
                    if (matchedId.includes('?')) {
                        matchedId = matchedId.split('?')[0];
                    }
                    invoiceIdVal = matchedId;
                }
             }
             if (invoiceIdVal) {
                invoiceParam = `&invoice_id=${invoiceIdVal}`;
             }
             
             const apiKeyParam = paymentKeys?.paymentlyApiKey ? `&paymentlyApiKey=${paymentKeys.paymentlyApiKey}` : "";
             const cryptomusIdParam = paymentKeys?.cryptomusMerchantId ? `&cryptomusMerchantId=${paymentKeys.cryptomusMerchantId}` : "";
             const cryptomusKeyParam = paymentKeys?.cryptomusPaymentKey ? `&cryptomusPaymentKey=${paymentKeys.cryptomusPaymentKey}` : "";

             const res = await fetch(`/api/payment/verify?txId=${tx.id}${invoiceParam}${apiKeyParam}${cryptomusIdParam}${cryptomusKeyParam}`);
             if (res.ok) {
                 const data = await res.json();
                 if (data.paid) {
                    console.log(`[Admin Auto-Verify] Transaction ${tx.id} verified. Finalizing via atomic credit...`);
                    const success = await executeAtomicTopUpCredit(tx.id, tx.amountUSD, tx.userId);
                    if (success) {
                       toast.success(`[System Auto-Verified] Payment of $${tx.amountUSD} found completed! Wallet is credited.`);
                    }
                 }
             }
          } catch(e: any) {
             if (e && e.message === "Failed to fetch") {
                console.warn(`[Admin Auto-Verify] Connection pending (Server is restarting or temporary disconnect) for tx ${tx.id}`);
             } else {
                console.error("Admin auto-verify failed for tx " + tx.id, e);
             }
          } finally {
             runningVerificationsRef.current.delete(tx.id);
          }
       }

       // 2. Pending referral bonuses synchronization (Admin loop executes this securely because Admin is logged in)
       const pendingReferralTxs = adminTxs.filter((tx: any) => tx.status === 'paid' && tx.type === 'topup' && tx.details?.referral_bonus_pending === true);
       for (const tx of pendingReferralTxs) {
          const trackingKey = `ref_${tx.id}`;
          if (runningVerificationsRef.current.has(trackingKey)) {
             continue;
          }
          runningVerificationsRef.current.add(trackingKey);
          try {
             console.log(`[Admin Referral Sync] Syncing pending referral bonus for transaction ${tx.id}...`);
             await runTransaction(db, async (trans) => {
                const txRef = doc(db, "transactions", tx.id);
                const txSnap = await trans.get(txRef);
                if (!txSnap.exists()) return;
                const txData = txSnap.data();
                if (txData.details?.referral_bonus_pending !== true) return;

                const referrerId = txData.details?.referrerId;
                if (referrerId) {
                   const referrerRef = doc(db, "users", referrerId);
                   const referrerSnap = await trans.get(referrerRef);
                   if (referrerSnap.exists()) {
                      const bonusAmount = txData.amountUSD * 0.01;
                      trans.update(referrerRef, {
                         balanceUSD: increment(bonusAmount),
                         total_deposited: increment(bonusAmount),
                         referralEarnings: increment(bonusAmount),
                         last_update: Date.now()
                      });

                      const refTxRef = doc(collection(db, "transactions"));
                      trans.set(refTxRef, {
                         userId: referrerId,
                         type: "referral_bonus",
                         txType: "Credit",
                         amountUSD: bonusAmount,
                         status: "success",
                         createdAt: Date.now(),
                         details: { message: `1% Referral Bonus from ${txData.userEmail || 'referred user'}'s topup` }
                      });
                   }
                }
                // Mark processed
                trans.update(txRef, {
                   "details.referral_bonus_pending": false
                });
             });
             console.log(`[Admin Referral Sync] Successfully credited referral bonus for transaction ${tx.id}!`);
          } catch (err) {
             console.error(`[Admin Referral Sync] Failed for transaction ${tx.id}:`, err);
          } finally {
             runningVerificationsRef.current.delete(trackingKey);
          }
       }
    }, 7000);
    return () => clearInterval(interval);
  }, [adminTxs, currentUser, db, paymentKeys]);

  // Fetch bot countries from backend
  useEffect(() => {
    fetch("/api/proxy/countries?t=" + Date.now())
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error("HTTP " + res.status + " " + text);
        }
        return res.json();
      })
      .then((data) => {
        setCountries(data);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err.message || String(err);
        if (!msg.includes("Failed to fetch")) {
          console.error("Failed to fetch bot data:", msg);
        }
        // Fallback data in case of complete network failure
        setCountries([
          { id: "1", country: "Bangladesh", code: "+880", flag: "🇧🇩", stock: 500, basePrice: 0.20 },
          { id: "2", country: "India", code: "+91", flag: "🇮🇳", stock: 1000, basePrice: 0.15 },
          { id: "3", country: "USA", code: "+1", flag: "🇺🇸", stock: 200, basePrice: 0.50 },
          { id: "4", country: "Indonesia", code: "+62", flag: "🇮🇩", stock: 1500, basePrice: 0.18 },
          { id: "5", country: "Russia", code: "+7", flag: "🇷🇺", stock: 800, basePrice: 0.12 }
        ]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }
    let isInitialLoad = true;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!isInitialLoad) {
          snapshot.docChanges().forEach((change) => {
            const tx = change.doc.data();
            if (change.type === "modified") {
              if (tx.type === "withdraw" && tx.status === "paid") {
                sendNotification("Withdrawal Paid", {
                  body: `Your withdrawal of $${tx.amountUSD?.toFixed(2)} has been successfully paid.`,
                });
              }
            }
            if (change.type === "added") {
              if (tx.type === "buy") {
                sendNotification("Account Purchased!", {
                  body: `You successfully bought a new account.`,
                });
              } else if (tx.type === "deposit" && tx.status === "paid") {
                sendNotification("Deposit Successful", {
                  body: `Your deposit of $${tx.amountUSD?.toFixed(2)} was credited to your balance.`,
                });
              }
            }
          });
        }
        const txs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(txs);
        isInitialLoad = false;
      },
      (error) => console.error("current user transactions query error", error)
    );
    return () => unsub();
  }, [currentUser]);

  // Fetch user subscriptions
  useEffect(() => {
    if (!currentUser) {
      setUserSubscriptions([]);
      return;
    }
    const q = query(
      collection(db, "gemini_subscriptions"),
      where("userId", "==", currentUser.uid),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const subs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as any }));
        subs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setUserSubscriptions(subs);
      },
      (error) => console.error("current user subscriptions query error", error)
    );
    return () => unsub();
  }, [currentUser]);

  // Background expiry monitoring check to alert user on load
  useEffect(() => {
    if (userSubscriptions && userSubscriptions.length > 0) {
      const activeExpiring = userSubscriptions.filter(sub => sub.status === "active" && isSubscriptionExpiringSoon(sub.expiresAt));
      if (activeExpiring.length > 0) {
        const countries = activeExpiring.map(s => s.country).join(", ");
        toast(`⚠️ Critical Expiry: Your Gemini Pro Premium subscription for ${countries} is expiring within 24 hours! Please check your dashboard to renew.`, {
          duration: 8000
        });
      }
    }
  }, [userSubscriptions]);

  // Sync SMM order statuses when opening SMM orders tab
  useEffect(() => {
    if (!currentUser || recordsTab !== "smm" || transactions.length === 0) return;

    const syncSmmOrders = async () => {
      const pendingOrders = transactions.filter(t => 
          t.type === "smm_order" && 
          t.providerOrderId && 
          !["Completed", "Canceled", "Partial"].includes(t.status)
      );
      
      if (pendingOrders.length === 0) return;
      
      try {
        const orderIds = pendingOrders.map(t => t.providerOrderId).join(",");
        const res = await fetch("/api/proxy/smm/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders: orderIds })
        });
        const data = await res.json();
        
        if (data && typeof data === 'object' && !data.error) {
            // Bulk status returns object mapped by order ID
            const updates: Promise<void>[] = [];
            
            for (const order of pendingOrders) {
               const orderStatus = orderIds.includes(",") ? data[order.providerOrderId] : data;
               
               if (orderStatus && orderStatus.status && orderStatus.status !== order.status) {
                  // status changed, update firestore
                  if (order.id) {
                     updates.push(updateDoc(doc(db, "transactions", order.id), {
                         status: orderStatus.status
                     }));
                  }
               }
            }
            
            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`Synced ${updates.length} SMM orders`);
            }
        }
      } catch (err) {
         console.error("Failed to sync SMM orders", err);
      }
    };
    
    syncSmmOrders();
  }, [recordsTab, currentUser, transactions.length]);

  // Real-time user details sync
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      doc(db, "users", currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setBalanceUSD(docSnap.data().balanceUSD || 0);
          setNumericId(docSnap.data().numericId || 10000);
          setUserReferredBy(docSnap.data().referredBy || null);
          setCustomReferralCode(docSnap.data().customReferralCode || null);
        }
      },
      (error) => console.error("user doc error", error)
    );
    return () => unsub();
  }, [currentUser]);

  // Automated background balance auto-reconciliation & correction
  useEffect(() => {
    if (!currentUser || transactions.length === 0) return;

    const checkAndFixBalance = async () => {
      let calculatedBalance = 0;
      let total_deposited = 0;
      let total_spent = 0;
      let referralEarnings = 0;

      transactions.forEach((tx) => {
        const amount = Number(tx.amountUSD) || 0;
        
        // topup/deposit transactions check
        const isTopUpPaid = tx.type === 'topup' && (
          tx.status === 'paid' || 
          tx.status === 'completed' || 
          tx.status === 'success' || 
          tx.status === 'OK' || 
          tx.status === 'COMPLETED'
        );
        const isDepositPaid = tx.type === 'deposit' && (
          tx.status === 'paid' || 
          tx.status === 'completed' || 
          tx.status === 'success'
        );
        const isReferralPaid = tx.type === 'referral_bonus' && (
          tx.status === 'paid' || 
          tx.status === 'completed' ||
          tx.status === 'success'
        );
        
        if (isTopUpPaid || isDepositPaid) {
          calculatedBalance += amount;
          total_deposited += amount;
        }
        if (isReferralPaid) {
          calculatedBalance += amount;
          referralEarnings += amount;
        }

        // spent transactions check
        const isPurchase = tx.type === 'purchase' || tx.type === 'p2p_buy' || tx.type === 'buy' || tx.type === 'smm_order';
        const isWithdraw = tx.type === 'withdraw' && tx.status !== 'rejected';
        const isChildPanel = tx.type === 'child_panel' || tx.type === 'child_panel_order';

        if (isPurchase || isWithdraw || isChildPanel) {
          calculatedBalance -= amount;
          total_spent += amount;
        }
      });

      const expectedBalance = calculatedBalance < 0 ? 0 : calculatedBalance;

      // Compare with the user profile in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const dbBalance = Number(userData.balanceUSD) || 0;
        const dbDeposited = Number(userData.total_deposited) || 0;
        const dbSpent = Number(userData.total_spent) || 0;
        const dbReferrals = Number(userData.referralEarnings) || 0;

        const needsFix = 
          Math.abs(dbBalance - expectedBalance) > 0.0001 ||
          Math.abs(dbDeposited - total_deposited) > 0.0001 ||
          Math.abs(dbSpent - total_spent) > 0.0001 ||
          Math.abs(dbReferrals - referralEarnings) > 0.0001 ||
          isNaN(userData.balanceUSD) ||
          typeof userData.balanceUSD !== "number";

        if (needsFix) {
          console.log(`Auto-healing database balance mismatch: ${dbBalance} -> ${expectedBalance}`);
          await updateDoc(userRef, {
            balanceUSD: expectedBalance,
            total_deposited,
            total_spent,
            referralEarnings,
            last_update: Date.now()
          });
          setBalanceUSD(expectedBalance);
        }
      }
    };

    checkAndFixBalance().catch(err => console.error("Auto balance sync error:", err));
  }, [transactions, currentUser, db]);

  // Track user activity
  useEffect(() => {
    if (!currentUser) return;

    const updateActivity = async () => {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          lastActiveAt: Date.now(),
        });
      } catch (e) {
        // ignore
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 60000); // exactly 1 minute

    return () => clearInterval(interval);
  }, [currentUser]);

  // Auth Listener
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tgStartParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
    const refParam = urlParams.get("ref") || tgStartParam;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        (window as any).isCurrentUserAdmin = (
          user.email === "uzvsbdnzyxhzj@gmail.com" || 
          user.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2"
        );
        // Check if user exists in Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          let assignedNumericId = 10000;
          if (!docSnap.exists()) {
            // Resolve refParam to a uid
            let finalReferredBy = refParam || null;
            if (finalReferredBy) {
              try {
                const qCustom = query(collection(db, "users"), where("customReferralCode", "==", finalReferredBy));
                const qCustomSnap = await getDocs(qCustom);
                if (!qCustomSnap.empty) {
                  finalReferredBy = qCustomSnap.docs[0].id;
                } else if (!isNaN(Number(finalReferredBy))) {
                  const qRef = query(collection(db, "users"), where("numericId", "==", Number(finalReferredBy)));
                  const qSnap = await getDocs(qRef);
                  if (!qSnap.empty) {
                    finalReferredBy = qSnap.docs[0].id;
                  } else {
                    const uDoc = await getDoc(doc(db, "users", finalReferredBy));
                    finalReferredBy = uDoc.exists() ? uDoc.id : null;
                  }
                } else {
                  const uDoc = await getDoc(doc(db, "users", finalReferredBy));
                  finalReferredBy = uDoc.exists() ? uDoc.id : null;
                }
              } catch(e) {
                console.error("Referral lookup error", e);
                finalReferredBy = null;
              }
            }

            // Prevent self-referral
            if (finalReferredBy === user.uid) {
               finalReferredBy = null;
            }

            // Create user profile
            try {
              await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, "counters", "users");
                const counterDoc = await transaction.get(counterRef);
                const tUserDoc = await transaction.get(userRef);

                let nextId = 10000;
                if (!counterDoc.exists()) {
                  transaction.set(counterRef, { lastId: 10000 });
                } else {
                  nextId = counterDoc.data().lastId + 1;
                  transaction.update(counterRef, { lastId: nextId });
                }
                assignedNumericId = nextId;

                if (!tUserDoc.exists()) {
                  transaction.set(userRef, {
                    uid: user.uid,
                    numericId: nextId,
                    email: user.email || "",
                    name: user.displayName || "",
                    balanceUSD: increment(0),
                    role: "user",
                    referredBy: finalReferredBy,
                    referralEarnings: increment(0),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  }, { merge: true });
                }
              });
            } catch (tError) {
              console.error(
                "Transaction failed, creating default numeric Id:",
                tError,
              );
              // Fallback if transaction fails
              const fallbackSnap = await getDoc(userRef);
              if (!fallbackSnap.exists()) {
                await setDoc(userRef, {
                  uid: user.uid,
                  numericId: 10000,
                  email: user.email || "",
                  name: user.displayName || "",
                  balanceUSD: increment(0),
                  role: "user",
                  referredBy: finalReferredBy,
                  referralEarnings: increment(0),
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                }, { merge: true });
              }
            }
          }
        } catch (error) {
          console.error("Error setting up user:", error);
        }
        setAuthLoading(false);
      } else {
        setCurrentUser(null);
        (window as any).isCurrentUserAdmin = false;
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const txId = urlParams.get("txId");
    const invoice_id = urlParams.get("invoice_id") || urlParams.get("invoiceId");

    const runInstantVerification = async () => {
      if (paymentStatus === "success") {
        if (txId && db) {
          if (runningVerificationsRef.current.has(txId)) return;
          runningVerificationsRef.current.add(txId);
          toast.loading("Verifying your payment... please wait.", { id: "verify-toast" });
          try {
            const txRef = doc(db, "transactions", txId);
            const txSnap = await getDoc(txRef);
            if (txSnap.exists()) {
              const txData = txSnap.data();
              if (txData.status === "paid") {
                toast.success("Payment verified! Your balance is already credited.", { id: "verify-toast" });
                return;
              }

              const apiKeyParam = paymentKeys?.paymentlyApiKey ? `&paymentlyApiKey=${paymentKeys.paymentlyApiKey}` : "";
              const cryptomusIdParam = paymentKeys?.cryptomusMerchantId ? `&cryptomusMerchantId=${paymentKeys.cryptomusMerchantId}` : "";
              const cryptomusKeyParam = paymentKeys?.cryptomusPaymentKey ? `&cryptomusPaymentKey=${paymentKeys.cryptomusPaymentKey}` : "";
              
              const invoiceParam = invoice_id ? `&invoice_id=${invoice_id}` : "";
              const res = await fetch(`/api/payment/verify?txId=${txId}${invoiceParam}${apiKeyParam}${cryptomusIdParam}${cryptomusKeyParam}`);
              
              if (res.ok) {
                 const verifyData = await res.json();
                 if (verifyData.paid) {
                    const success = await executeAtomicTopUpCredit(txId, txData.amountUSD, txData.userId);
                    if (success) {
                       toast.success(`Successfully Verified! Credited $${txData.amountUSD} to your wallet.`, { id: "verify-toast" });
                    } else {
                       toast.success("Payment verified! Your balance is already credited.", { id: "verify-toast" });
                    }
                    return;
                 }
              }
            }
            toast.success("Payment submitted! It is being verified. Check your transactions tab in a few moments.", { id: "verify-toast" });
          } catch(e) {
            console.error("Instant verify failed:", e);
            toast.error("Payment submission failed. Check your Recent Transactions.", { id: "verify-toast" });
          } finally {
            runningVerificationsRef.current.delete(txId);
          }
        } else {
          toast.success("Payment was successful! Your balance will be updated once verified.");
        }
      } else if (paymentStatus === "cancel") {
        toast.error("Payment was cancelled or failed.");
      }
    };

    if (paymentStatus) {
      runInstantVerification();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [db, paymentKeys]);

  // Conversion Rates
  const TOPUP_RATE = 129;
  const WITHDRAW_RATE = 125;

  const getBdtFee = (amt: number) => {
    if (amt < 500) return 10 + amt * 0.02;
    if (amt < 1000) return 8 + amt * 0.018;
    return 5 + amt * 0.015;
  };

  const getUsdFee = (amt: number) => {
    if (amt < 5) return 0.1 + amt * 0.02;
    if (amt < 10) return 0.08 + amt * 0.018;
    return 0.05 + amt * 0.015;
  };

  const handleSetCustomReferralCode = async (code: string) => {
    if (!currentUser) return;
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) return toast("Please enter a valid code.");
    if (cleanCode.length < 3 || cleanCode.length > 20) return toast("Code must be between 3 and 20 characters.");
    if (!/^[a-z0-9_]+$/.test(cleanCode)) return toast("Code can only contain letters, numbers, and underscores.");

    try {
      // Check if it's already taken
      const qCustom = query(collection(db, "users"), where("customReferralCode", "==", cleanCode));
      const qCustomSnap = await getDocs(qCustom);
      if (!qCustomSnap.empty) {
        // If it's taken by someone else
        if (qCustomSnap.docs[0].id !== currentUser.uid) {
          return toast("This referral code is already taken. Please choose another.");
        }
      }
      
      await updateDoc(doc(db, "users", currentUser.uid), {
        customReferralCode: cleanCode,
        updatedAt: Date.now()
      });
      toast("Custom referral code set successfully!");
    } catch (e: any) {
      console.error(e);
      toast("Failed to set your referral code.");
    }
  };

  const handleBindReferral = async (code: string) => {
    if (!currentUser) return;
    if (!code.trim()) return toast(i18n.errorInvalidRefCode || "Please enter a valid referral code.");
    if (userReferredBy) return toast(i18n.errorAlreadyReferred || "You have already bound a referral code.");

    let finalReferredBy: string | null = null;
    
    try {
      const qCustom = query(collection(db, "users"), where("customReferralCode", "==", code));
      const qCustomSnap = await getDocs(qCustom);
      if (!qCustomSnap.empty) {
        finalReferredBy = qCustomSnap.docs[0].id;
      } else if (!isNaN(Number(code))) {
        const qRef = query(collection(db, "users"), where("numericId", "==", Number(code)));
        const qSnap = await getDocs(qRef);
        if (!qSnap.empty) {
          finalReferredBy = qSnap.docs[0].id;
        } else {
          const uDoc = await getDoc(doc(db, "users", code));
          if (uDoc.exists()) finalReferredBy = uDoc.id;
        }
      } else {
        const uDoc = await getDoc(doc(db, "users", code));
        if (uDoc.exists()) finalReferredBy = uDoc.id;
      }
    } catch (e) {
      console.error(e);
      return toast("Error looking up referral code.");
    }

    if (!finalReferredBy) {
      return toast(i18n.errorRefCodeNotFound || "Referral code not found.");
    }

    if (finalReferredBy === currentUser.uid) {
      return toast(i18n.errorSelfReferral || "You cannot use your own referral code.");
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        referredBy: finalReferredBy,
        updatedAt: Date.now()
      });
      setUserReferredBy(finalReferredBy);
      toast(i18n.successRefCodeBound || "Referral code bound successfully!");
    } catch (e: any) {
      console.error(e);
      toast("Failed to bind referral code.");
    }
  };

  const handleAdminAddBalance = async () => {
    if (!adminAddBalanceUid.trim())
      return toast("Please enter a User ID or Numeric UID");
    const amount = Number(adminAddBalanceAmount);
    if (!amount || amount === 0) return toast("Please enter a valid amount (positive or negative)");

    try {
      let targetUserRef;
      let targetUserDoc;

      if (!isNaN(Number(adminAddBalanceUid.trim()))) {
        const q = query(
          collection(db, "users"),
          where("numericId", "==", Number(adminAddBalanceUid.trim()))
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          targetUserDoc = querySnapshot.docs[0];
          targetUserRef = targetUserDoc.ref;
        }
      }

      if (!targetUserRef) {
        targetUserRef = doc(db, "users", adminAddBalanceUid.trim());
        targetUserDoc = await getDoc(targetUserRef);
      }

      if (!targetUserDoc || !targetUserDoc.exists()) {
        return toast("User not found with this UID.");
      }

      const currentTargetBalance = targetUserDoc.data().balanceUSD || 0;
      await updateDoc(targetUserRef, {
        balanceUSD: increment(amount),
        total_deposited: amount > 0 ? increment(amount) : increment(0),
        last_update: Date.now()
      });

      // optionally add a transaction record
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: targetUserDoc.id,
        userNumericId: targetUserDoc.data().numericId,
        userEmail: targetUserDoc.data().email || "N/A",
        type: amount > 0 ? "deposit" : "withdraw",
        txType: amount > 0 ? "Credit" : "Debit",
        amountUSD: Math.abs(amount),
        status: "paid",
        details: { method: amount > 0 ? "admin_add" : "admin_subtract", txId: "ADMIN-" + Date.now() },
        createdAt: Date.now(),
      });

      toast(
        `Successfully ${amount > 0 ? "added" : "subtracted"} $${Math.abs(amount)} ${amount > 0 ? "to" : "from"} user ${targetUserDoc.data().numericId || targetUserDoc.id}. Previous balance: $${currentTargetBalance.toFixed(2)}, New balance: ${(currentTargetBalance + amount).toFixed(2)}`
      );
      setAdminAddBalanceUid("");
      setAdminAddBalanceAmount("");
    } catch (error: any) {
      console.error(error);
      toast("Error modifying balance: " + error.message);
    }
  };



  const handleTopup = async (method: string, overrideAmount?: number) => {
    setIsTopupLoading(true);
    const finalAmount =
      overrideAmount !== undefined ? overrideAmount : Number(topupAmount);

    try {
      if (!currentUser) throw new Error("Not authenticated");
      const txRef = doc(collection(db, "transactions"));
      const pendingTxId = txRef.id;

      const res = await fetch("/api/payment/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUSD: finalAmount,
          method,
          uid: currentUser.uid,
          pendingTxId, 
          baseUrl: window.location.origin,
          paymentlyApiKey: paymentKeys?.paymentlyApiKey || null,
          cryptomusMerchantId: paymentKeys?.cryptomusMerchantId || null,
          cryptomusPaymentKey: paymentKeys?.cryptomusPaymentKey || null,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err: any) {
        throw new Error("Server returned an invalid response. Usually a temporary issue.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Server returned " + res.status);
      }

      if (data.payment_url) {
        
        try {
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "topup",
            txType: "Credit",
            amountUSD: finalAmount,
            status: "pending",
            details: { 
              method, 
              payment_url: data.payment_url,
              invoice_id: data.invoice_id || null
            },
            createdAt: Date.now(),
          });
        } catch (e) {
          console.error("Error setting pending topup", e);
        }

        setTopupMethod(null);
        setTopupStep(1);
        setTopupInputBdt("");
        setTopupInputUsd("");
        setTopupAmount("");
        
        const newWin = window.open(data.payment_url, "_blank");
        if (!newWin) {
          toast("Popup blocked! Check your Recent Transactions to pay.", { duration: 5000 });
        }
      } else if (data.success) {
        toast(`Top-up request for $${finalAmount} submitted! Please wait for Admin approval. (Secure Mode)`);

        try {
          await setDoc(txRef, {
            userId: currentUser.uid,
            type: "topup",
            txType: "Credit",
            amountUSD: finalAmount,
            status: "pending",
            details: { method },
            createdAt: Date.now(),
          });

          setTopupModal(false);
        } catch (e: any) {
          console.error("Error setting pending topup", e);
        }
      } else {
        toast("Payment failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast("Payment request failed. Details: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleBuy = async (country: CountryData, finalPrice: number) => {
    if (!currentUser) return requireAuth();
    setBuyErrorId(null);
    if (balanceUSD < finalPrice) {
      setBuyErrorId(country.id);
      return;
    }
    
    askConfirmation(
      `${i18n.buyConfirmTxt} ${country.country}? Price: $${finalPrice.toFixed(2)}`,
      async () => {
        try {
          const res = await fetch("/api/proxy/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country_code: country.id }),
          });
          const data = await res.json();
          if (data.status === "ok") {
            setCountries((prev) =>
              prev.map((c) =>
                c.id === country.id ? { ...c, stock: c.stock - 1 } : c,
              ),
            );

            if (currentUser) {
              await updateDoc(doc(db, "users", currentUser.uid), {
                balanceUSD: increment(-finalPrice),
                total_spent: increment(finalPrice),
                last_update: Date.now()
              });

              const txRef = doc(collection(db, "transactions"));
              await setDoc(txRef, {
                userId: currentUser.uid,
                type: "purchase",
                txType: "Debit",
                amountUSD: finalPrice,
                status: "WAIT",
                details: { phone: data.Number, country: country.country },
                createdAt: Date.now(),
              });
              setPurchasedNumber({ number: data.Number, txId: txRef.id });
              setSuccessReceipt({
                txId: txRef.id,
                title: `${country.country} Virtual Number`,
                category: "Virtual Number 📱",
                priceUSD: finalPrice,
                details: {
                  "Phone Number": data.Number,
                  "Country": country.country,
                  "Status": "Waiting for SMS OTP code",
                  "Instructions": lang === "bn"
                    ? "আপনার অ্যাকাউন্ট কেনার জন্য এই ভার্চুয়াল নম্বরটি সফলভাবে প্রস্তুত করা হয়েছে! নম্বরটি কপি করে আপনার সোশ্যাল অ্যাপে বসান এবং ওটিপি (OTP) কোডের জন্য অপেক্ষা করুন।"
                    : "Your virtual number has been prepared! Copy the phone number, paste it into your desired app, and wait for the SMS OTP code on this page."
                }
              });
            } else {
              setPurchasedNumber({ number: data.Number });
            }
            toast(i18n.buySuccessTxt);
          } else {
            toast("Failed to get number from API: " + JSON.stringify(data));
          }
        } catch (error) {
          toast("Network error while buying account.");
        }
      }
    );
  };

  const handleGetCode = async (
    phoneToCheck?: string,
    txIdToUpdate?: string,
  ) => {
    const numberToCheck = phoneToCheck || purchasedNumber?.number;
    if (!numberToCheck) return;

    try {
      const res = await fetch("/api/proxy/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: numberToCheck }),
      });
      const data = await res.json();
      if (data.status === "ok" && data.code) {
        if (!phoneToCheck) {
          setPurchasedNumber((prev) =>
            prev ? { ...prev, code: data.code, pass: data.pass } : null,
          );
        }

        const txId = txIdToUpdate || purchasedNumber?.txId;
        if (txId && currentUser) {
          await updateDoc(doc(db, "transactions", txId), {
            status: "OK",
            "details.code": data.code,
            "details.pass": data.pass,
          });
        }
      } else {
        toast("Code not ready yet. Please wait a moment and try again.");
      }
    } catch (error) {
      toast("Network error while fetching code.");
    }
  };

  const renderP2pModal = () => {
    if (!p2pModal) return null;
    const price = Number(p2pModal.priceUSD);
    const platformFee = Number((price * 0.02).toFixed(2));
    const totalToPay = price + platformFee;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Confirm Purchase</h3>
            <button onClick={() => setP2pModal(null)} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left border border-gray-200">
            <p className="text-lg font-bold text-gray-900 mb-1">
              {p2pModal.title}
            </p>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Account Price:</span>
              <span className="font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Escrow/Platform Fee (2%):</span>
              <span className="font-bold">${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-3 pt-3 border-t border-gray-300">
              <span className="text-gray-800 font-bold">Total to Pay:</span>
              <span className="font-bold text-green-600">
                ${totalToPay.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 rounded-r-lg">
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              <span className="font-bold">P2P Escrow Info:</span> By confirming,
              ${totalToPay.toFixed(2)} will be held in our escrow system. You
              will then enter a P2P process to receive the account ownership
              from the seller.
            </p>
          </div>

          <button
            onClick={async () => {
              if (!currentUser) return requireAuth();
                if (balanceUSD < totalToPay)
                  return toast(
                    `Insufficient balance. You need $${totalToPay.toFixed(2)}.`,
                  );

                try {
                  await updateDoc(doc(db, "users", currentUser.uid), {
                    balanceUSD: increment(-totalToPay),
                    total_spent: increment(totalToPay),
                    last_update: Date.now()
                  });

                  const txRef = doc(collection(db, "transactions"));
                  await setDoc(txRef, {
                    userId: currentUser.uid,
                    type: "p2p_buy",
                    txType: "Debit",
                    amountUSD: totalToPay,
                    status: "OK",
                    details: { accountId: p2pModal.id, title: p2pModal.title },
                    createdAt: Date.now(),
                  });

                  // Transfer the money to the seller
                  if (p2pModal.ownerId) {
                    try {
                      const sellerRef = doc(db, "users", p2pModal.ownerId);
                      const sellerSnap = await getDoc(sellerRef);
                      if (sellerSnap.exists()) {
                        await updateDoc(sellerRef, {
                          balanceUSD: increment(price),
                          total_deposited: increment(price),
                          last_update: Date.now()
                        });
                      }
                    } catch (e) {
                      console.error("Seller transfer error", e);
                    }
                  }

                  // Remove account from the list
                  if (p2pModal.id && typeof p2pModal.id === "string") {
                    try {
                      await deleteDoc(doc(db, "accounts", p2pModal.id));
                    } catch (e) {
                      console.error("Secure deletion error", e);
                    }
                  }

                  setP2pModal(null);
                  setSuccessReceipt({
                    txId: txRef.id,
                    title: p2pModal.title,
                    category: "P2P Escrow Account 🤝",
                    priceUSD: totalToPay,
                    details: {
                      "Seller ID": p2pModal.ownerId || "Anonymous",
                      "Escrow Status": "Funds held in Escrow (2% Fee applied)",
                      "Instructions": lang === "bn"
                        ? "টাকা এস্ক্রোতে জমা হয়েছে। অনুগ্রহ করে সেলারের সাথে যোগাযোগের নির্দেশাবলি অনুসরণ করুন।"
                        : "Funds are now safely held in Escrow. Please proceed to receive account credentials."
                    }
                  });
                } catch (error) {
                  console.error("Purchase error", error);
                toast("Something went wrong with the purchase.");
              }
            }}
            className="w-full py-3 bg-[#2AABEE] hover:bg-blue-500 text-white font-bold rounded-lg transition"
          >
            Confirm & Pay
          </button>
        </motion.div>
      </div>
    );
  };

  const renderPurchasedModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{i18n.purchasedModalTitle}</h3>
          <button onClick={() => setPurchasedNumber(null)} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Phone Number</p>
          <p className="text-xl font-mono font-bold tracking-wider text-gray-900">
            {purchasedNumber?.number}
          </p>
        </div>

        {purchasedNumber?.code ? (
          <div className="bg-green-50 p-4 rounded-lg mb-6 text-center border border-green-200">
            <p className="text-sm text-green-800 font-bold mb-1">
              Telegram Code:
            </p>
            <p className="text-3xl font-mono font-bold text-green-700">
              {purchasedNumber.code}
            </p>
            {purchasedNumber.pass && (
              <>
                <p className="text-sm text-green-800 font-bold mb-1 mt-4">
                  Password / 2FA:
                </p>
                <p className="text-xl font-mono font-bold text-green-700">
                  {purchasedNumber.pass}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mb-6 text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            {i18n.waitingForCode}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleGetCode()}
            className="w-full bg-[#2AABEE] hover:bg-[#2299d6] text-white py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(42,171,238,0.39)] hover:shadow-[0_6px_20px_rgba(42,171,238,0.23)] active:scale-[0.98] transition-all"
          >
            {i18n.getCodeBtn}
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderTopupModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{i18n.topupModalTitle}</h3>
            <button onClick={() => { setTopupModal(false); setTopupStep(1); setTopupMethod(null); }} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {topupStep === 1 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Select a payment method:
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    setTopupMethod("bkash");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 py-4 rounded-lg font-bold hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="h-8 w-auto" viewBox="-18.0015 -28.3525 156.013 170.115"><g fill="none"><path fill="#D12053" d="M96.58 62.45l-53.03-8.31 7.03 31.6z"/><path fill="#E2136E" d="M96.58 62.45L56.62 6.93 43.56 54.15z"/><path fill="#D12053" d="M42.32 53.51L.45 0l54.83 6.55z"/><path fill="#9E1638" d="M23.25 31.15L0 9.24h6.12z"/><path fill="#D12053" d="M107.89 35.46l-9.84 26.69L82.1 40.09z"/><path fill="#E2136E" d="M56.77 84.14l38.61-15.51L97 63.7z"/><path fill="#9E1638" d="M25.89 113.41l16.54-58.02 8.39 37.75z"/><path fill="#E2136E" d="M109.43 35.67l-4.06 11.02 14.64-.24z"/></g></svg>
                  <span className="text-gray-800">bKash</span>
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("nagad");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 py-4 rounded-lg font-bold hover:bg-gray-50 transition flex flex-col items-center justify-center gap-2 shadow-sm"
                >
                  <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" onError={(e) => { e.currentTarget.src = 'https://seeklogo.com/images/N/nagad-logo-7A70CCFEE0-seeklogo.com.png'; e.currentTarget.onerror = null; }} />
                  <span className="text-gray-800">Nagad</span>
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("binance");
                    setTopupStep(2);
                  }}
                  className="w-full bg-[#1e2329] text-[#f3ba2f] py-4 rounded-lg font-bold hover:bg-[#15191d] transition flex flex-col items-center justify-center gap-2 shadow-sm border border-[#2b3139]"
                >
                  <svg className="h-8 w-auto text-[#f3ba2f] fill-current" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg>
                  Binance Pay
                </button>

                <button
                  onClick={() => {
                    setTopupMethod("crypto");
                    setTopupStep(2);
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-800 py-4 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-between px-4"
                >
                  <span>Cryptomus (USDC, BTC, ETH & others)</span>
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-[#F7931A] flex items-center justify-center p-1 border-2 border-white relative z-10">
                      <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M14.4 12c1.32-.48 2.28-1.56 2.28-3.12 0-2.4-1.92-3.72-4.92-3.72H6.6v15.6h3.48v-2.16h1.8c3.24 0 5.4-1.56 5.4-4.2 0-1.8-1.2-3.12-2.88-3.6V12zm-3.84-4.32h1.56c1.2 0 1.92.6 1.92 1.56s-.72 1.56-1.92 1.56h-1.56V7.68zm1.92 8.16h-1.92v-3.36h1.92c1.32 0 2.28.6 2.28 1.68s-.96 1.68-2.28 1.68z"/></svg>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center p-1 border-2 border-white relative z-0">
                      <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.22l7.365 4.339 7.365-4.34L12.056 0z"/></svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {topupMethod === "bkash" || topupMethod === "nagad" ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to deposit (BDT)
                    </label>
                    <input
                      type="number"
                      min="100"
                      placeholder="Minimum 100 BDT"
                      value={topupInputBdt}
                      onChange={(e) =>
                        setTopupInputBdt(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                    />
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 text-sm font-medium">
                    <div className="flex justify-between mb-1">
                      <span>Wallet Credit:</span>{" "}
                      <span className="font-bold text-green-600">
                        +${(Number(topupInputBdt) / TOPUP_RATE).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-xs text-blue-600">
                      <span>Gateway Fee:</span>{" "}
                      <span>
                        +{getBdtFee(Number(topupInputBdt)).toFixed(2)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 font-bold text-lg">
                      <span>
                        Total Pay ({topupMethod === "bkash" ? "bKash" : "Nagad"}
                        ):
                      </span>{" "}
                      <span>
                        {(
                          Number(topupInputBdt) +
                          getBdtFee(Number(topupInputBdt))
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        BDT
                      </span>
                    </div>
                  </div>
                  {topupError && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                      {topupError}
                    </div>
                  )}
                  <button
                    disabled={isTopupLoading}
                    onClick={() => {
                      setTopupError("");
                      const enteredBDT = Number(topupInputBdt);
                      if (!enteredBDT || enteredBDT < 100) {
                        setTopupError("Minimum top-up amount is 100 BDT.");
                        return;
                      }
                      const amountUSDToPass = Number((enteredBDT / TOPUP_RATE).toFixed(2));
                      setTopupAmount(amountUSDToPass);
                      setTopupError("");
                      handleTopup(topupMethod, amountUSDToPass);
                    }}
                    className={`w-full text-gray-900 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-2 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm ${isTopupLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isTopupLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        {topupMethod === "bkash" ? <svg className="h-6 w-auto" viewBox="-18.0015 -28.3525 156.013 170.115"><g fill="none"><path fill="#D12053" d="M96.58 62.45l-53.03-8.31 7.03 31.6z"/><path fill="#E2136E" d="M96.58 62.45L56.62 6.93 43.56 54.15z"/><path fill="#D12053" d="M42.32 53.51L.45 0l54.83 6.55z"/><path fill="#9E1638" d="M23.25 31.15L0 9.24h6.12z"/><path fill="#D12053" d="M107.89 35.46l-9.84 26.69L82.1 40.09z"/><path fill="#E2136E" d="M56.77 84.14l38.61-15.51L97 63.7z"/><path fill="#9E1638" d="M25.89 113.41l16.54-58.02 8.39 37.75z"/><path fill="#E2136E" d="M109.43 35.67l-4.06 11.02 14.64-.24z"/></g></svg> : <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-6 object-contain" onError={(e) => { e.currentTarget.src = 'https://seeklogo.com/images/N/nagad-logo-7A70CCFEE0-seeklogo.com.png'; e.currentTarget.onerror = null; }} />}
                        Pay with {topupMethod === "bkash" ? "bKash" : "Nagad"}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to deposit (USD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Minimum 1 USD"
                      value={topupInputUsd}
                      onChange={(e) =>
                        setTopupInputUsd(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                    />
                  </div>
                  <div className="bg-gray-50 text-gray-800 p-3 rounded-lg mb-6 text-sm font-medium">
                    <div className="flex justify-between mb-1">
                      <span>Wallet Credit:</span>{" "}
                      <span className="font-bold text-green-600">
                        +${Number(topupInputUsd).toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-xs text-gray-500">
                      <span>Gateway Fee:</span>{" "}
                      <span>
                        +${getUsdFee(Number(topupInputUsd)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                      <span>
                        Total Pay ({topupMethod === "binance" ? "Binance Pay" : "Cryptomus"}):
                      </span>{" "}
                      <span>
                        $
                        {(
                          Number(topupInputUsd) + getUsdFee(Number(topupInputUsd))
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      <span className="font-bold">Important Instruction:</span>{" "}
                      {topupMethod === "binance" ? "You will make an internal transfer to our Binance account and verify with the Order ID." : "You will be redirected directly to the Cryptomus gateway to complete your transaction securely."}
                    </p>
                  </div>

                  {topupError && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                      {topupError}
                    </div>
                  )}
                  <button
                    disabled={isTopupLoading}
                    onClick={() => {
                      setTopupError("");
                      const enteredUSD = Number(topupInputUsd);
                      if (!enteredUSD || enteredUSD < 1) {
                        setTopupError("Minimum top-up amount is 1 USD.");
                        return;
                      }
                      setTopupAmount(enteredUSD);
                      setTopupError("");
                      if (topupMethod === "binance") {
                        setBinanceTransferAmount(enteredUSD);
                        setBinanceStep(1);
                        setTopupModal(false);
                      } else {
                        handleTopup(topupMethod!, enteredUSD);
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 mb-2 ${topupMethod === "binance" ? "bg-[#1e2329] text-[#f3ba2f] hover:bg-[#15191d]" : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"} shadow-sm ${isTopupLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isTopupLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        {topupMethod === "binance" ? <svg className="h-6 w-auto text-[#f3ba2f] fill-current" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg> : (
                          <div className="flex -space-x-1 mr-1">
                            <div className="w-5 h-5 rounded-full bg-[#F7931A] flex items-center justify-center p-0.5 border-2 border-white relative z-10">
                              <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M14.4 12c1.32-.48 2.28-1.56 2.28-3.12 0-2.4-1.92-3.72-4.92-3.72H6.6v15.6h3.48v-2.16h1.8c3.24 0 5.4-1.56 5.4-4.2 0-1.8-1.2-3.12-2.88-3.6V12zm-3.84-4.32h1.56c1.2 0 1.92.6 1.92 1.56s-.72 1.56-1.92 1.56h-1.56V7.68zm1.92 8.16h-1.92v-3.36h1.92c1.32 0 2.28.6 2.28 1.68s-.96 1.68-2.28 1.68z"/></svg>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-[#627EEA] flex items-center justify-center p-0.5 border-2 border-white relative z-0">
                              <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.22l7.365 4.339 7.365-4.34L12.056 0z"/></svg>
                            </div>
                          </div>
                        )}
                        <span>Pay with {topupMethod === "binance" ? "Binance Pay" : "Cryptomus"}</span>
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setTopupStep(1);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition mt-2"
              >
                Back
              </button>
            </div>
          )}

          {/* Pending Topups Section */}
          {transactions.filter(t => t.type === "topup" && t.status === "pending").length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-5">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                Pending Top Ups
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                  {transactions.filter(t => t.type === "topup" && t.status === "pending").length}
                </span>
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 flex flex-col">
                {transactions.filter(t => t.type === "topup" && t.status === "pending").map(tx => (
                  <div key={`pending-topup-${tx.id}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-700">${tx.amountUSD?.toFixed(2)} USD</div>
                      <div className="text-xs text-gray-500 font-medium mt-1 truncate">
                        {tx.details?.method === "binance_manual" ? "Binance: " + tx.details?.orderId : tx.details?.method === "binance" ? "Binance Pay" : tx.details?.method === "crypto" ? "Cryptomus" : tx.details?.method === "bkash" ? "bKash" : tx.details?.method === "nagad" ? "Nagad" : "Local Gateway"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="text-[10px] uppercase font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                        Pending
                      </div>
                      {tx.details?.payment_url && (
                        <a href={tx.details.payment_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-[#2AABEE] hover:bg-blue-600 text-white px-2.5 py-1 rounded font-bold transition whitespace-nowrap">
                          Pay Now
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const renderWithdrawModal = () => {
    const enteredAmount = Number(withdrawAmount) || 0;
    const displayAmount = Math.max(0, enteredAmount);
    const baseBdt = displayAmount * WITHDRAW_RATE;
    const bdtFee = getBdtFee(baseBdt);
    const totalGetBdt = Math.max(0, baseBdt - bdtFee);

    const baseUsd = displayAmount;
    const usdFee = getUsdFee(baseUsd);
    const totalGetUsd = Math.max(0, baseUsd - usdFee);

    return (
      <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{i18n.withdrawModalTitle}</h3>
            <button onClick={() => setWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-4 flex-wrap gap-1">
            {["Binance", "BSC-USDT", "bKash", "Nagad"].map((method) => (
              <button
                key={method}
                onClick={() => setWithdrawMethod(method as any)}
                className={`flex-1 min-w-[70px] px-3 py-2 rounded-md font-bold text-sm transition-all ${withdrawMethod === method ? "bg-white shadow text-[#2AABEE]" : "text-gray-500 hover:text-gray-700"}`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {i18n.amountUsdLbl}
            </label>
            <input
              type="number"
              min="1"
              max={balanceUSD}
              placeholder="Minimum 1 USD"
              value={withdrawAmount}
              onChange={(e) =>
                setWithdrawAmount(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {i18n.availWithdrawLbl} ${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {withdrawMethod === "bKash" || withdrawMethod === "Nagad"
                ? `${withdrawMethod} Personal Number`
                : withdrawMethod === "Binance"
                  ? "Binance Pay ID or Email"
                  : "BSC-USDT Address"}
            </label>
            <input
              type="text"
              value={withdrawDetails}
              onChange={(e) => setWithdrawDetails(e.target.value)}
              placeholder={
                withdrawMethod === "bKash" || withdrawMethod === "Nagad"
                  ? `Enter your ${withdrawMethod} personal number`
                  : withdrawMethod === "Binance"
                    ? "Enter your Binance Pay ID or Email"
                    : "Enter your BSC Network USDT Address"
              }
              className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
            />
            {withdrawMethod === "Binance" && (
              <p className="text-xs text-gray-500 mt-1">
                Please provide your Binance Pay ID or Email. We do not use payment links.
              </p>
            )}
            {withdrawMethod === "BSC-USDT" && (
              <p className="text-xs text-gray-500 mt-1">
                Make sure you provide a valid USDT address on the BSC (BEP20)
                network.
              </p>
            )}
            {(withdrawMethod === "bKash" || withdrawMethod === "Nagad") && (
              <p className="text-xs text-gray-500 mt-1">
                Please provide a valid personal account number.
              </p>
            )}
          </div>

          <div className="bg-green-50 text-green-800 p-3 rounded-lg mb-4 text-sm font-medium shrink-0">
            {withdrawMethod === "Binance" || withdrawMethod === "BSC-USDT" ? (
              <div className="flex flex-col gap-1">
                <span>Rate: 1 USD = 1 USD</span>
                <span className="text-gray-500">Fee: ${usdFee.toFixed(2)}</span>
                <span>
                  Total Get:{" "}
                  <span className="font-bold text-lg">
                    ${totalGetUsd.toFixed(2)}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span>
                  {i18n.rateLbl} {WITHDRAW_RATE} BDT
                </span>
                <span className="text-gray-500">
                  Fee: {bdtFee.toLocaleString()} BDT
                </span>
                <span>
                  {i18n.totalGetLbl}{" "}
                  <span className="font-bold text-lg">
                    {totalGetBdt.toLocaleString()} BDT
                  </span>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-orange-600 font-medium mb-6 bg-orange-50 p-2 rounded shrink-0">
            {i18n.manualWithdrawNote}
          </p>

          {withdrawError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {withdrawError}
            </div>
          )}

          <div className="space-y-3 shrink-0">
            <button
              onClick={async () => {
                setWithdrawError("");
                const amountObj = Number(withdrawAmount);
                if (!amountObj || amountObj < 1) {
                  setWithdrawError("Minimum withdrawal amount is 1 USD");
                  return;
                }
                if (amountObj > balanceUSD) {
                  setWithdrawError("Insufficient balance for this withdrawal");
                  return;
                }
                if (!withdrawDetails.trim()) {
                  setWithdrawError(`Please enter your ${withdrawMethod} details`);
                  return;
                }
                if (currentUser) {
                  askConfirmation(
                    `Are you sure you want to withdraw $${amountObj.toFixed(2)} to ${withdrawMethod}?`,
                    async () => {
                      try {
                        await updateDoc(doc(db, "users", currentUser.uid), {
                          balanceUSD: increment(-amountObj),
                          total_spent: increment(amountObj),
                          last_update: Date.now()
                        });
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                        let wId = "W-";
                        for(let i=0; i<36; i++) wId += chars.charAt(Math.floor(Math.random() * chars.length));
                        const txRef = doc(db, "transactions", wId);
                        await setDoc(txRef, {
                          userId: currentUser.uid,
                          userNumericId: numericId,
                          userEmail: currentUser.email || "N/A",
                          type: "withdraw",
                          txType: "Debit",
                          amountUSD: amountObj,
                          status: "pending",
                          details: {
                            method: withdrawMethod,
                            account: withdrawDetails,
                            payoutUsd: totalGetUsd,
                            payoutBdt: totalGetBdt,
                          },
                          createdAt: Date.now(),
                        });
                        toast(i18n.withdrawSuccessTxt);
                        setWithdrawModal(false);
                      } catch (e: any) {
                        toast("Error during withdrawal: " + e.message);
                        console.error(e);
                      }
                    }
                  );
                }
              }}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
            >
              {i18n.withdrawSubmitBtn}
            </button>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-4 flex-1 overflow-auto">
            <h4 className="font-bold text-gray-800 mb-3">Withdrawal History</h4>
            <div className="space-y-2">
              {transactions.filter((t) => t.type === "withdraw").length ===
              0 ? (
                <p className="text-sm text-gray-500 italic">
                  No previous withdrawals.
                </p>
              ) : (
                transactions
                  .filter((t) => t.type === "withdraw")
                  .map((tx) => (
                    <div
                      key={`withdraw-history-${tx.id}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          ${tx.amountUSD.toFixed(2)} USD
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                        <p 
                          onClick={() => {
                            if (tx.id) {
                              navigator.clipboard.writeText(tx.id);
                              toast("Transaction ID copied to clipboard: " + tx.id);
                            }
                          }}
                          className="text-[10px] font-mono text-gray-400 cursor-pointer hover:text-gray-600 transition truncate max-w-[120px] bg-gray-200/50 px-1.5 py-0.5 rounded"
                          title="Click to copy Transaction ID"
                        >
                          ID: {tx.id}
                        </p>
                      </div>
                      <div>
                        {tx.status === "paid" || tx.status === "completed" || tx.status === "success" || tx.status === "OK" ? (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded uppercase">
                            Paid
                          </span>
                        ) : tx.status === "rejected" || tx.status === "failed" || tx.status === "canceled" || tx.status === "cancelled" ? (
                          <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded uppercase">
                            Rejected
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2AABEE]"></div>
      </div>
    );
  }

  const requireAuth = (callback?: () => void) => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    if (callback) callback();
  };

  if (!currentUser) {
    if (showLanding) {
      return (
        <Landing
          countries={countries}
          markupPercent={markupPercent}
          lang={lang}
          setLang={setLang}
          displayCurrency={displayCurrency}
          onGetStarted={(mode) => {
            setAuthMode(mode || 'login');
            setShowLanding(false);
          }}
        />
      );
    }
    return (
      <Login
        lang={lang}
        setLang={setLang}
        initialMode={authMode}
        onBack={() => {
          setShowLanding(true);
        }}
      />
    );
  }

   // Email verification requirement removed to allow instant sign in
  

  if (binanceTransferAmount !== null) {
    const usdFee = binanceTransferAmount < 5 ? 0.10 + (binanceTransferAmount * 0.02) : binanceTransferAmount < 10 ? 0.08 + (binanceTransferAmount * 0.018) : 0.05 + (binanceTransferAmount * 0.015);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans sm:py-8">
        <div className="bg-white/0 absolute inset-0" onClick={() => setBinanceTransferAmount(null)} />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-gray-200 relative z-10">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-800 tracking-tight">Binance internal transfer</h2>
            <button onClick={() => setBinanceTransferAmount(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center relative my-2">
              <div className="absolute left-1/2 top-[1rem] -translate-y-1/2 -translate-x-1/2 w-48 h-[2px] bg-gray-200" />
              <div
                className="absolute left-[calc(50%-6rem)] top-[1rem] -translate-y-1/2 h-[2px] bg-[#3b71ca] transition-all duration-300"
                style={{ width: binanceStep === 2 ? '12rem' : '0' }}
              />
              
              <div className="flex justify-between w-48 relative z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors duration-300 " + (binanceStep >= 1 ? "bg-[#3b71ca]" : "bg-gray-400")}>
                    1
                  </div>
                  <span className={"text-[13px] font-medium whitespace-nowrap " + (binanceStep >= 1 ? "text-gray-800" : "text-gray-500")}>Make payment</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors duration-300 " + (binanceStep === 2 ? "bg-[#3b71ca]" : "bg-gray-400")}>
                    2
                  </div>
                  <span className={"text-[13px] font-medium whitespace-nowrap " + (binanceStep === 2 ? "text-gray-800" : "text-gray-500")}>Verify payment</span>
                </div>
              </div>
            </div>

            {binanceStep === 1 ? (
              <div className="animate-in slide-in-from-left-4 fade-in duration-300 mt-2">
                <div className="text-center mb-6 pt-2">
                  <div className="text-4xl font-bold text-gray-800">
                    {(binanceTransferAmount + usdFee).toFixed(2)} <span className="text-2xl font-semibold text-gray-600 ml-1">USDT</span>
                  </div>
                  <div className="text-[13px] font-medium text-gray-400 mt-1">Total (incl. fee)</div>
                </div>

                <div className="mb-4">
                  <label className="block text-[15px] font-bold text-gray-800 mb-1.5">Send to Binance ID</label>
                  <div className="flex bg-[#f5f5f5] rounded border border-gray-200 overflow-hidden">
                    <input 
                      type="text" 
                      readOnly 
                      value={binanceConfig.id} 
                      className="flex-1 bg-transparent px-3 py-2.5 text-gray-600 outline-none w-full font-sans"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(binanceConfig.id);
                        toast("Copied Binance ID: " + binanceConfig.id);
                      }}
                      className="flex items-center gap-1.5 px-4 bg-white border-l border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#181a20] rounded-xl overflow-hidden shadow-xl mb-6 relative">
                  {/* Decorative faint dots background */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                  
                  {/* Header Text - BINANCE */}
                  <div className="flex items-center justify-center gap-2 pt-6 pb-2 relative z-10 w-full text-[#f0b90b] text-[22px] font-bold tracking-wide">
                    <svg className="w-6 h-6 fill-current mb-0.5" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg>
                    BINANCE
                  </div>

                  <div className="p-5 mt-2 bg-[#1e2329] mx-4 mb-3 rounded-[10px] border border-[#2b3139] flex flex-col items-center relative z-10 shadow-lg">
                    <div className="text-white/90 text-[15.5px] font-medium mb-6">Scan with Binance App to pay</div>
                    
                    <div className="bg-white p-3 rounded-lg border-[3px] border-white shadow-2xl relative max-w-[200px] w-full mb-6 mx-auto overflow-hidden">
                      <img src={binanceConfig.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${binanceConfig.id}&margin=0`} alt="QR" className="w-full h-auto aspect-square object-contain" />
                      {!binanceConfig.qrUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white w-11 h-11 flex items-center justify-center rounded-[6px] shadow-[0_0_0_4px_white]">
                            <svg className="w-[1.75rem] h-[1.75rem] text-[#f0b90b] fill-current" viewBox="-52.785 -88 457.47 528">
                              <path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-white text-[16px] tracking-wide mb-1">TeleMarket Pay</div>
                  </div>

                  {/* Footer App Download Section */}
                  <div className="bg-[#2b3139] p-4 flex items-center gap-3 relative z-10">
                    <div className="bg-white p-1 rounded-sm w-[42px] h-[42px] flex-shrink-0 shadow-sm relative overflow-hidden">
                      <img src={binanceConfig.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${binanceConfig.id}&margin=0`} alt="App QR" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left flex-1 pl-1">
                      <div className="text-[#eaecef] text-[15px] font-medium leading-tight">Pay Anywhere</div>
                      <div className="text-[#848e9c] text-[13px] mt-0.5 font-medium">Download the Binance app</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-left text-[14px] text-gray-700 space-y-2 leading-relaxed font-sans mb-6 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <p className="flex gap-2.5"><span className="text-blue-600 font-bold">1.</span> Scan the QR above or send funds using the Binance ID.</p>
                  <p className="flex gap-2.5"><span className="text-blue-600 font-bold">2.</span> After completing payment, tap "Confirm payment".</p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setBinanceStep(2)}
                    className="w-full bg-[#3b71ca] hover:bg-[#3260ab] text-white font-medium py-3 rounded text-[16px] transition shadow flex items-center justify-center relative z-10"
                  >
                    Confirm payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300 mt-2">
                
                <div className="bg-[#f5f5f5] rounded-md p-4 flex justify-between items-center mb-6 border border-gray-100">
                  <div>
                    <div className="text-[13px] text-gray-500 mb-0.5">Amount</div>
                    <div className="text-[16px] font-medium text-gray-800">{(binanceTransferAmount + usdFee).toFixed(2)} <span className="text-[13px]">USDT</span></div>
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-500 mb-0.5">Send to Binance ID</div>
                    <div className="text-[16px] font-medium text-gray-800 flex items-center gap-1.5">
                      {binanceConfig.id} 
                      <button onClick={() => { navigator.clipboard.writeText(binanceConfig.id); toast("Copied!"); }} className="text-[#3b71ca] hover:text-[#3260ab] transition ml-0.5">
                        <Copy className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="block text-[15px] font-bold text-gray-800">Enter you Binance Order ID</label>
                  <input
                    type="text"
                    onChange={e => {
                      setBinanceOrderId(e.target.value);
                      if (binanceOrderIdError) setBinanceOrderIdError("");
                    }}
                    value={binanceOrderId}
                    className={`w-full px-3 py-2.5 bg-white border ${binanceOrderIdError ? 'border-red-500' : 'border-[#3b71ca]'} rounded outline-none shadow-[0_0_0_1px_rgba(59,113,202,0.3)] focus:shadow-[0_0_0_2px_rgba(59,113,202,0.8)] transition font-sans`}
                  />
                  {binanceOrderIdError && (
                    <p className="text-red-500 text-sm font-bold mt-1">
                      {binanceOrderIdError}
                    </p>
                  )}
                </div>

                <div className="bg-[#f6f6f6] rounded-xl p-5 mb-6 shadow-sm border border-gray-100 text-[14.5px] text-gray-700">
                   <div className="text-center mb-5 pb-5 border-b border-gray-200">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 inline-block w-full max-w-[240px]">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="text-[11px] text-gray-500 mb-1 font-bold">Payment Successful</div>
                        <div className="font-bold text-[17px] mb-4 text-gray-800 border-b border-gray-100 pb-3">{(binanceTransferAmount + usdFee).toFixed(3)} USDT <br/><span className="text-[10px] text-gray-400 font-normal">The recipient can check the balance in the funding wallet.</span></div>
                        
                        <div className="flex flex-col items-start bg-blue-50/50 border border-blue-100 px-3 py-2 rounded text-xs gap-1.5 relative">
                          <div className="flex w-full justify-between items-center">
                            <span className="text-gray-500 font-medium">To</span>
                            <div className="h-2 w-10 bg-gray-300 rounded-sm"></div>
                          </div>
                          <div className="flex w-full justify-between items-center shadow-[0_0_0_1px_rgba(59,113,202,0.3)] bg-white p-1 rounded-sm relative z-10 -mx-1 px-2">
                            <span className="text-gray-500 font-medium">Order ID</span>
                            <div className="font-mono font-medium text-gray-700 flex items-center gap-2 relative">
                              <div className="h-[12px] w-20 bg-gradient-to-r from-gray-300 to-gray-200 rounded-sm"></div>
                              <Copy className="w-[12px] h-[12px] text-gray-500 bg-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4 leading-relaxed text-left font-sans">
                     <p>1. Copy the Order ID from the successful payment details in your Binance account.</p>
                     <p>2. Paste it into the field above and tap "Verify payment".</p>
                   </div>
                </div>

                <div className="relative">
                  <button
                    disabled={!binanceOrderId || isSubmitBinance}
                    onClick={async () => {
                      setIsSubmitBinance(true);
                      setBinanceOrderIdError("");
                      try {
                        const prevTxQuery = query(
                          collection(db, "transactions"),
                          where("details.orderId", "==", binanceOrderId)
                        );
                        const prevTxSnap = await getDocs(prevTxQuery);
                        if (!prevTxSnap.empty) {
                           setBinanceOrderIdError("This Binance Order ID has already been used by another transaction.");
                           toast.error("This Binance Order ID has already been used.");
                           setIsSubmitBinance(false);
                           return;
                        }

                        const res = await fetch('/api/payment/binance/check', {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId: binanceOrderId,
                            amount: Number((binanceTransferAmount + usdFee).toFixed(2)),
                            uid: currentUser?.uid,
                            email: currentUser?.email,
                            numericId: numericId
                          })
                        });
                        const data = await res.json();
                        
                        if (data.success) {
                           setBinanceTransferAmount(null);
                           setTopupModal(false);
                           setBinanceOrderId("");
                           toast("Binance Verified Instantly! Balance updated.");
                           return;
                        }

                        const txRef = doc(collection(db, "transactions"));
                        await setDoc(txRef, {
                          userId: currentUser?.uid,
                          userEmail: currentUser?.email,
                          userNumericId: numericId,
                          type: "topup",
                          txType: "Credit",
                          amountUSD: binanceTransferAmount,
                          status: "pending",
                          details: { method: 'binance_manual', orderId: binanceOrderId, totalSent: binanceTransferAmount + usdFee },
                          createdAt: Date.now(),
                        });
                        
                        // remove referred logic
                        // no operation here

                        toast("Your Order is submitted for review! It could not be instantly verified, an admin will review.");
                        setBinanceTransferAmount(null);
                        setTopupModal(false);
                        setBinanceOrderId("");
                      } catch(e) {
                        console.error(e);
                        toast("Error submitting. Try again.");
                      }
                      setIsSubmitBinance(false);
                    }}
                    className="w-full bg-[#3b71ca] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3260ab] text-white font-medium py-3 rounded text-[16px] transition shadow flex justify-center items-center gap-2 relative z-10"
                  >
                    {isSubmitBinance ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : "Verify payment"}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    );
  }

  const nowMsLocal = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const adminTxStats = adminTxs.reduce(
    (acc, tx) => {
      if (tx.status !== "paid" && tx.status !== "success" && tx.status !== "completed") return acc;
      let timeMs = 0;
      if (tx.createdAt) {
        timeMs = tx.createdAt.toMillis ? tx.createdAt.toMillis() : (typeof tx.createdAt === 'number' ? tx.createdAt : Date.parse(tx.createdAt));
      }

      if (tx.type === "withdraw") {
        if (nowMsLocal - timeMs < oneDay) acc.withdrawDaily += tx.amountUSD || 0;
        if (nowMsLocal - timeMs < oneWeek) acc.withdrawWeekly += tx.amountUSD || 0;
        if (nowMsLocal - timeMs < oneMonth) acc.withdrawMonthly += tx.amountUSD || 0;
      } else if (tx.type === "topup") {
        if (nowMsLocal - timeMs < oneDay) acc.topupDaily += tx.amountUSD || 0;
        if (nowMsLocal - timeMs < oneWeek) acc.topupWeekly += tx.amountUSD || 0;
        if (nowMsLocal - timeMs < oneMonth) acc.topupMonthly += tx.amountUSD || 0;
      }
      return acc;
    },
    {
      withdrawDaily: 0,
      withdrawWeekly: 0,
      withdrawMonthly: 0,
      topupDaily: 0,
      topupWeekly: 0,
      topupMonthly: 0,
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ className: 'rounded-xl shadow-lg border border-slate-100 font-medium' }} />
      {/* Clean Professional Animated Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe]/50">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#38bdf8]/20 blur-[80px] md:blur-[120px] animate-blob mix-blend-multiply"></div>
        <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#818cf8]/20 blur-[90px] md:blur-[130px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-[#34d399]/20 blur-[80px] md:blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
      </div>
      <AnimatePresence>




        {showWelcome && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-8 max-w-md w-full relative">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <TelemarketLogo className="h-16 text-[#2AABEE]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to TeleMarket!
                </h2>
                <div className="text-gray-600 mb-6 text-sm leading-relaxed space-y-4">
                  <p>
                    The premier marketplace to securely buy and sell Telegram accounts, and access high-quality social media services (SMM).
                    Browse our directory of verified accounts and supercharge your social presence!
                  </p>
                  <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
                    <p className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">🌐</span> Access Anywhere
                    </p>
                    <p className="text-blue-800 text-xs mb-3">
                      You can use our platform directly here on the web, or through our Official Telegram Bot!
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-blue-800 text-xs space-y-1.5 font-medium">
                      <li>Telegram Bot: <strong>@TeleMarket_official_bot</strong></li>
                      <li>Website: <strong>https://telemarket-rldz.onrender.com/</strong></li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full bg-[#2AABEE] hover:bg-[#2299d6] text-white font-bold py-3 px-6 rounded-xl shadow-[0_4px_14px_rgba(42,171,238,0.39)] hover:shadow-[0_6px_20px_rgba(42,171,238,0.23)] active:scale-[0.98] transition-all"
                >
                  Explore Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopTicker />
      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-xl text-slate-800 shadow-[0_2px_20px_-3px_rgba(0,0,0,0.05)] sticky top-0 z-50 border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
              >
                 <Menu className="w-5 h-5" />
              </button>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => { setCurrentView("dashboard"); }}
              >
                <TelemarketLogo className="h-10 md:h-12" hideTextOnMobile={true} />
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2">
                <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-1.5 py-1.5 rounded-lg shrink-0 border border-gray-200">
                  <Globe className="w-4 h-4 opacity-80" />
                  <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold max-w-[50px]">
                    <option value="en">English</option>
                    <option value="bn">Bengali</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="ar">Arabic</option>
                    <option value="ru">Russian</option>
                    <option value="pt">Portuguese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="tr">Turkish</option>
                    <option value="id">Indonesian</option>
                    <option value="ur">Urdu</option>
                    <option value="it">Italian</option>
                    <option value="nl">Dutch</option>
                    <option value="pl">Polish</option>
                    <option value="vi">Vietnamese</option>
                    <option value="th">Thai</option>
                    <option value="ms">Malay</option>
                    <option value="tl">Tagalog</option>
                    <option value="fa">Persian</option>
                    <option value="uk">Ukrainian</option>
                    <option value="ro">Romanian</option>
                  </select>
                </div>
                <div 
                  className="flex items-center gap-1 bg-[#1cd435] hover:bg-green-600 text-white px-3 py-1.5 rounded-full cursor-pointer transition shadow-sm shrink-0"
                  onClick={() => { requireAuth(() => setTopupModal(true)); }}
                >
                  <Wallet className="w-4 h-4" />
                  <span className={`font-bold text-sm inline-block transition-all duration-300 ${balanceAnimate ? 'scale-125 text-yellow-300' : ''}`}>{formatCurrency(balanceUSD)}</span>
                </div>
                <div
                  className={`w-9 h-9 bg-[#5b8735] hover:opacity-90 text-white rounded-full flex items-center justify-center font-bold text-base cursor-pointer shadow-sm uppercase tracking-wider relative ${currentUser?.photoURL ? '' : 'overflow-hidden'}`}
                  onClick={() => requireAuth(() => { setCurrentView("profile"); })}
                >
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser?.email?.[0] || "U"
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Navbar right side */}
            <div className="hidden md:flex w-full md:w-auto items-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-1.5 lg:gap-2.5 font-medium min-w-max">
                <button onClick={() => { setCurrentView("dashboard"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "dashboard" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-[#2AABEE]" /> <span className="whitespace-nowrap">{i18n.dashboardNav}</span>
                </button>
                <button onClick={() => { setCurrentView("buy"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "buy" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <ShoppingCart className="w-4 h-4 shrink-0 text-emerald-500" /> <span className="whitespace-nowrap">{i18n.buyNav}</span>
                </button>
                <button onClick={() => { setCurrentView("courses"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "courses" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <Hash className="w-4 h-4 shrink-0 text-blue-500" /> <span className="whitespace-nowrap">{lang === "bn" ? "ভার্চুয়াল নাম্বার" : "Virtual Numbers"}</span>
                </button>
                <button onClick={() => { setCurrentView("tools"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "tools" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <Wrench className="w-4 h-4 shrink-0 text-orange-500" /> <span className="whitespace-nowrap">{lang === "bn" ? "টুলস ও ভিআইপি" : "Tools & VIP"}</span>
                </button>
                <button onClick={() => requireAuth(() => { setCurrentView("sell"); })} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "sell" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <PlusCircle className="w-4 h-4 shrink-0 text-blue-500" /> <span className="whitespace-nowrap">{i18n.sellNav}</span>
                </button>
                <button onClick={() => requireAuth(() => { setCurrentView("records"); })} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "records" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <FileText className="w-4 h-4 shrink-0 text-amber-500" /> <span className="whitespace-nowrap">{i18n.recordsNav || "My Orders"}</span>
                </button>
                <button onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setCurrentView("child-panel"); })} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "child-panel" ? "bg-rose-50 text-rose-700 border-rose-300 font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <Globe className="w-4 h-4 shrink-0 text-rose-500" /> <span className="whitespace-nowrap">{lang === "bn" ? "সাব পেইজ" : "Sub Page"}</span>
                </button>
                <button onClick={() => { setCurrentView("api"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "api" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <Code className="w-4 h-4 shrink-0 text-cyan-500" /> <span className="whitespace-nowrap">API</span>
                </button>
                <button onClick={() => requireAuth(() => { setCurrentView("profile"); })} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm border shadow-sm ${currentView === "profile" ? "bg-blue-50 text-[#2AABEE] border-[#2AABEE] font-extrabold" : "bg-white border-gray-350 text-gray-700 hover:bg-gray-50 hover:border-gray-400"}`}>
                  <User className="w-4 h-4 shrink-0 text-indigo-500" /> <span className="whitespace-nowrap">{i18n.profileNav || "Profile"}</span>
                </button>
                {((currentUser?.email && (currentUser.email === "uzvsbdnzyxhzj@gmail.com")) || currentUser?.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2") && (
                  <button data-ad-skip="true" onClick={() => { setCurrentView("admin"); }} className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-xl transition text-sm bg-red-100 text-red-600 hover:bg-red-200 border border-red-300 font-black shadow-sm`}>
                    <Settings className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">{i18n.adminNav}</span>
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-lg shrink-0 border border-gray-200">
                <Globe className="w-4 h-4 opacity-80" />
                <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold max-w-[80px]">
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="ar">Arabic</option>
                  <option value="ru">Russian</option>
                  <option value="pt">Portuguese</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="tr">Turkish</option>
                  <option value="id">Indonesian</option>
                  <option value="ur">Urdu</option>
                  <option value="it">Italian</option>
                  <option value="nl">Dutch</option>
                  <option value="pl">Polish</option>
                  <option value="vi">Vietnamese</option>
                  <option value="th">Thai</option>
                  <option value="ms">Malay</option>
                  <option value="tl">Tagalog</option>
                  <option value="fa">Persian</option>
                  <option value="uk">Ukrainian</option>
                  <option value="ro">Romanian</option>
                </select>
              </div>

              <div 
                className="flex items-center gap-1.5 bg-[#1cd435] hover:bg-green-600 text-white px-3 py-1.5 rounded-full cursor-pointer transition shadow-sm shrink-0"
                onClick={() => { requireAuth(() => setTopupModal(true)); }}
              >
                <Wallet className="w-4 h-4" />
                <span className={`font-bold text-sm inline-block transition-all duration-300 ${balanceAnimate ? 'scale-125 text-yellow-300' : ''}`}>{formatCurrency(balanceUSD)}</span>
              </div>
              <div
                className={`w-9 h-9 lg:w-10 lg:h-10 bg-[#5b8735] hover:opacity-90 text-white rounded-full flex items-center justify-center font-bold text-lg cursor-pointer shadow-sm uppercase tracking-wider relative shrink-0 ${currentUser?.photoURL ? '' : 'overflow-hidden'}`}
                onClick={() => requireAuth(() => { setCurrentView("profile"); })}
              >
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  currentUser?.email?.[0] || "U"
                )}
              </div>
              <button
                onClick={() => { signOut(auth); setShowAuth(true); setAuthMode('login'); }}
                className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-full transition shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
        </div>
      </header>

      <AdvertisementBanner onPostAdClick={() => requireAuth(() => setCurrentView("post-ad"))} />

      {/* Main Content Area */}
      <main data-view={currentView} className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-20 md:pb-8 relative">
        <AnimatePresence mode="wait">
        <motion.div key={currentView} initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(5px)' }} transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.5 }} className="w-full">
        {currentView === "post-ad" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <PostAd
              balanceUSD={balanceUSD}
              onNavigate={setCurrentView}
              uid={currentUser?.uid || ""}
            />
          </div>
        )}
        {currentView === "tickets" && (
          <div className="max-w-5xl mx-auto py-8 bg-gradient-to-br from-sky-100 to-indigo-200 p-2 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
             <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-4 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
             >
               <ArrowLeft className="w-5 h-5 mr-2" /> {lang === "bn" ? "ড্যাশবোর্ডে ফিরুন" : "Back to Dashboard"}
             </button>
             <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2 px-1 font-sans">
               <MessageSquare className="w-7 h-7 text-[#2AABEE]" /> {lang === "bn" ? "সাপোর্ট লাইভ চ্যাট ⚡" : "Live Support Chat ⚡"}
             </h2>
             <SupportTickets lang={lang} />
          </div>
        )}
        {currentView === "smm" && (
          <div className="w-full h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] -mt-4 sm:-mt-8 -mx-3 sm:-mx-6 lg:-mx-8 p-0 relative bg-gradient-to-br from-sky-100 to-indigo-200">
            <SocialServices currentUser={currentUser} onNavigate={setCurrentView} balanceUSD={balanceUSD} socialMarkupPercent={socialMarkupPercent} smmMarkupData={smmMarkupData} smmCategoryGroupName={smmCategory} lang={lang} displayCurrency={displayCurrency} />
          </div>
        )}
        {currentView === "child-panel" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <ChildPanel currentUser={currentUser} onNavigate={(v) => setCurrentView(v as View)} balanceUSD={balanceUSD} lang={lang} displayCurrency={displayCurrency} />
          </div>
        )}
        {currentView === "api" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <ApiView onNavigate={(v) => setCurrentView(v as View)} />
          </div>
        )}
        {currentView === "courses" && (
          <VirtualNumbers
            currentUser={currentUser}
            onNavigate={(v) => setCurrentView(v as View)}
            balanceUSD={balanceUSD}
            lang={lang}
            displayCurrency={displayCurrency}
          />
        )}
        {currentView === "tools" && (
          <div className="space-y-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-sky-100 p-4 sm:p-6 rounded-2xl border border-indigo-200/50 shadow-md">
            <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-2 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
            </button>

            {/* Header style matching Buy view */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  ⚡ {lang === "bn" ? "প্রিমিয়াম টুলস ও ভিআইপি সাবস্ক্রিপশন" : "Premium Tools & VIP Subscription"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {lang === "bn" ? "হাইপার-অটোমেশন সফটওয়্যার ও লাইফটাইম প্রাইভেট প্রিভিলেজ পান।" : "Unlock hyper-automation and high-tier platform privileges."}
                </p>
              </div>
              <div className="hidden md:flex bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg items-center gap-2 font-medium border border-indigo-100">
                <Wrench className="w-5 h-5 animate-pulse" />
                <span>{lang === "bn" ? "ইনস্ট্যান্ট সেটআপ" : "Instant VIP Access"}</span>
              </div>
            </div>

            {/* Premium Tools & Subscriptions Content Area */}
            {selectedToolDetail === "gemini" ? (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <button
                    onClick={() => setSelectedToolDetail(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                    <span>{lang === "bn" ? "সব প্রিমিয়াম টুলস দেখুন" : "Back to All Premium Tools"}</span>
                  </button>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden w-full max-w-4xl">
                    
                    {/* Visual Header with Gemini PNG */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white flex justify-between items-center relative overflow-hidden">
                      <div className="flex flex-col justify-between h-full z-10 text-left max-w-[70%]">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-white/20 text-white backdrop-blur-sm self-start mb-3">
                          {lang === "bn" ? "অফিসিয়াল এআই সাবস্ক্রিপশন" : "Official AI Subscription"}
                        </span>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                            Google Gemini Pro Premium
                          </h2>
                          <p className="text-sm text-blue-100 mt-1.5 font-medium">
                            {lang === "bn" 
                              ? "গুগলের সর্বাধুনিক নেক্সট-জেনারেশন এআই পাওয়ারহাউস সাবস্ক্রিপশন" 
                              : "Google's most advanced next-generation AI powerhouse subscription"}
                          </p>
                        </div>
                      </div>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/960px-Google_Gemini_icon_2025.svg.png" 
                        alt="Google Gemini" 
                        className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-2xl z-10 animate-pulse shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    </div>

                    {/* 2-Column Responsive Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
                      
                      {/* Left Column: Interactive Order Form */}
                      <div id="gemini-order-form" className="lg:col-span-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/80 shadow-sm flex flex-col justify-between h-full">
                        <div className="space-y-4 text-left">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                            🛒 {lang === "bn" ? "অর্ডার ফর্ম ও পেমেন্ট" : "Order Form & Checkout"}
                          </h3>

                          {/* Country Select */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                              📍 {lang === "bn" ? "দেশ / রিজিয়ন" : "Select Country/Region"}
                            </label>
                            <select
                              value={geminiCountry}
                              onChange={(e) => setGeminiCountry(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                            >
                              {geminiCountriesList.map((country) => (
                                <option key={country} value={country}>
                                  {country} {geminiCountryFlags[country] || "🌍"}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Plan Toggle */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                              📦 {lang === "bn" ? "সাবস্ক্রিপশন ক্যাটাগরি" : "Choose Subscription Category"}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["member", "personal"] as const).map((catOption) => {
                                const isSelected = geminiCategory === catOption;
                                return (
                                  <button
                                    key={catOption}
                                    type="button"
                                    onClick={() => {
                                      setGeminiCategory(catOption);
                                      if (catOption === "member") {
                                        setGeminiPassword("");
                                      }
                                    }}
                                    className={`px-3 py-3 rounded-xl border text-xs font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                      isSelected
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                  >
                                    <span>
                                      {catOption === "member" 
                                        ? (lang === "bn" ? "জেমিনি মেম্বার" : "Gemini Member")
                                        : (lang === "bn" ? "পার্সোনাল প্ল্যান" : "Personal Plan")}
                                    </span>
                                    <span className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                                      {catOption === "member" ? "1, 3, 6, 12 Months" : "12 Months (1 Year)"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Duration Toggle (only for Member category) */}
                          {geminiCategory === "member" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-1.5"
                            >
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                ⏱️ {lang === "bn" ? "মেয়াদ নির্বাচন করুন" : "Select Duration"}
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {(["1month", "3month", "6month", "12month"] as const).map((durOption) => {
                                  const isSelected = geminiPlan === durOption;
                                  return (
                                    <button
                                      key={durOption}
                                      type="button"
                                      onClick={() => setGeminiPlan(durOption)}
                                      className={`py-2.5 rounded-xl border text-xs font-black transition-all duration-150 cursor-pointer text-center ${
                                        isSelected
                                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                      }`}
                                    >
                                      {durOption === "1month" ? "1 M" :
                                       durOption === "3month" ? "3 M" :
                                       durOption === "6month" ? "6 M" :
                                       "12 M"}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}

                          {/* Gmail Input */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                              📧 {lang === "bn" ? "জিমেইল এড্রেস" : "Your Gmail Address"}
                            </label>
                            <input
                              type="email"
                              value={geminiEmail}
                              onChange={(e) => setGeminiEmail(e.target.value)}
                              placeholder="example@gmail.com"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                          </div>

                          {/* Password Input (conditional) */}
                          {geminiCategory === "personal" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3.5 text-left"
                            >
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  🔒 {lang === "bn" ? "জিমেইল পাসওয়ার্ড" : "Gmail Password"}
                                </label>
                                <input
                                  type="password"
                                  value={geminiPassword}
                                  onChange={(e) => setGeminiPassword(e.target.value)}
                                  placeholder={lang === "bn" ? "আপনার জিমেইল পাসওয়ার্ড" : "Your Gmail Password"}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  🔑 {lang === "bn" ? "অথেনটিকেশন কী (Authentication Key)" : "Authentication Key / Auth Key"}
                                </label>
                                <input
                                  type="text"
                                  value={geminiBackupCodes}
                                  onChange={(e) => setGeminiBackupCodes(e.target.value)}
                                  placeholder={lang === "bn" ? "যেমন: Google Authenticator Key" : "e.g., Google Authenticator Key"}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                />
                              </div>

                              <p className="text-[10px] text-amber-600 leading-tight">
                                ⚠️ {lang === "bn" 
                                  ? "১-বছরের পার্সোনাল প্ল্যানটি আপনার নিজস্ব একাউন্টে সেটআপ করার জন্য পাসওয়ার্ড এবং অথেনটিকেশন কী প্রয়োজন। কাজ শেষে পাসওয়ার্ড পরিবর্তন করে নিবেন।"
                                  : "Password & Authentication Key are required for 1-Year Personal Plan setup on your account. You can change your password immediately after setup."}
                              </p>
                            </motion.div>
                          )}

                          {/* Price Display */}
                          <div className="bg-white/80 p-4 rounded-xl border border-blue-100/50 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500">
                                💰 {lang === "bn" ? "নির্ধারিত মূল্য:" : "Total Price:"}
                              </span>
                              <div className="flex flex-col items-end gap-1">
                                <div className="text-xs text-gray-400 font-medium">
                                  <span>{lang === "bn" ? "নরমাল প্রাইস: " : "Regular Price: "}</span>
                                  <span className="line-through font-mono">
                                    ${(() => {
                                      const base12MonthPrice = geminiCountryPrices12M[geminiCountry] || 9.99;
                                      let activePrice = base12MonthPrice;
                                      if (geminiCategory === "personal") {
                                        activePrice = base12MonthPrice * 3.8;
                                      } else {
                                        if (geminiPlan === "1month") {
                                          activePrice = Math.max(0.99, Math.round((base12MonthPrice * 0.25) * 100) / 100);
                                        } else if (geminiPlan === "3month") {
                                          activePrice = Math.max(1.99, Math.round((base12MonthPrice * 0.45) * 100) / 100);
                                        } else if (geminiPlan === "6month") {
                                          activePrice = Math.max(2.99, Math.round((base12MonthPrice * 0.70) * 100) / 100);
                                        } else {
                                          activePrice = base12MonthPrice;
                                        }
                                      }
                                      const regularPrice = activePrice * 2.5;
                                      return regularPrice.toFixed(2);
                                    })()} USD
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                  <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                                    🔥 {lang === "bn" ? "৬০% ছাড়" : "60% OFF"}
                                  </span>
                                  <span className="text-2xl font-black text-blue-600 font-mono">
                                    ${(() => {
                                      const base12MonthPrice = geminiCountryPrices12M[geminiCountry] || 9.99;
                                      let activePrice = base12MonthPrice;
                                      if (geminiCategory === "personal") {
                                        activePrice = base12MonthPrice * 3.8;
                                      } else {
                                        if (geminiPlan === "1month") {
                                          activePrice = Math.max(0.99, Math.round((base12MonthPrice * 0.25) * 100) / 100);
                                        } else if (geminiPlan === "3month") {
                                          activePrice = Math.max(1.99, Math.round((base12MonthPrice * 0.45) * 100) / 100);
                                        } else if (geminiPlan === "6month") {
                                          activePrice = Math.max(2.99, Math.round((base12MonthPrice * 0.70) * 100) / 100);
                                        } else {
                                          activePrice = base12MonthPrice;
                                        }
                                      }
                                      return activePrice.toFixed(2);
                                    })()} USD
                                  </span>
                                </div>
                                <div className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                  ✨ {lang === "bn" ? "অফার প্রাইস / ডিসকাউন্ট মূল্য" : "Special Offer Price"}
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-right mt-1">
                              {lang === "bn" ? "*ব্যালেন্স থেকে ইনস্ট্যান্ট কেটে নেয়া হবে" : "*Instantly deducted from your wallet balance"}
                            </p>
                          </div>

                          {/* Manual Service Alert Notice */}
                          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                              ⏳ {lang === "bn" ? "ম্যানুয়াল ডেলিভারি নোটিশ" : "Manual Delivery Notice"}
                            </p>
                            <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                              {lang === "bn"
                                ? "এটি একটি ম্যানুয়াল সার্ভিস। অর্ডার সম্পন্ন হওয়ার পর সাধারণত ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে সাবস্ক্রিপশনটি চালু করা হয়। জরুরি প্রয়োজনে আমাদের হোয়াটসঅ্যাপ বা টেলিগ্রাম সাপোর্টে যোগাযোগ করলে আরও দ্রুত এক্টিভ করে দেওয়া হবে।"
                                : "This is a manual activation service. It usually takes 5 minutes to 2 hours to activate. For urgent activation, contact us on WhatsApp or Telegram to speed up the process!"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            onClick={handleBuyGemini}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-200 flex items-center justify-center cursor-pointer border-b-4 border-blue-800 gap-1.5"
                          >
                            <span>⚡ {lang === "bn" ? "এখনই কিনুন" : "Buy Now"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Rich Detailed Features & Information */}
                      <div className="lg:col-span-7 space-y-6 text-left overflow-y-auto max-h-[650px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-snug flex items-center gap-2">
                            ✨ {lang === "bn" ? "গুগল জেমিনি প্রো প্রিমিয়াম অফিসিয়াল সাবস্ক্রিপশন" : "Google Gemini Pro Premium Official Subscription"}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            {lang === "bn" 
                              ? "জেমিনি প্রো প্রিমিয়ামের মাধ্যমে গুগলের নেক্সট-জেনারেশন এআই-এর সর্বোচ্চ ক্ষমতা আনলক করুন। আপনি কনটেন্ট ক্রিয়েটর, প্রোগ্রামার, গবেষক বা ডিজিটাল মার্কেটার যা-ই হোন না কেন, আপনার প্রোডাক্টিভিটি বহুগুণ বাড়িয়ে তুলতে এই অল-ইন-ওয়ান এআই পাওয়ারহাউস তৈরি করা হয়েছে।"
                              : "Unlock the ultimate power of Google's next-generation AI with Gemini Pro Premium. Whether you are a content creator, programmer, researcher, or digital marketer, this all-in-one AI powerhouse is designed to turbocharge your productivity and bring your ideas to life."}
                          </p>
                          <p className="text-blue-600 font-extrabold text-xs mt-3 bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
                            🌟 {lang === "bn" 
                              ? "SoftzoneBD থেকে সবচেয়ে সাশ্রয়ী মূল্যে ১০০% আসল, অফিসিয়াল এবং বৈধ জেমিনি প্রো প্রিমিয়াম সাবস্ক্রিপশন কিনুন একদম ইনস্ট্যান্ট ডেলিভারি ও ফুল-পিরিয়ড ওয়ারেন্টি সহ!"
                              : "Buy 100% genuine, official, and legitimate Gemini Pro Premium subscriptions from SoftzoneBD at the most affordable prices, featuring instant delivery and a full-period warranty!"}
                          </p>
                        </div>

                        {/* Two Distinct Categories Comparison */}
                        <div className="space-y-3.5">
                          <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                            📦 {lang === "bn" ? "আমাদের ২ টি সাবস্ক্রিপশন ক্যাটাগরি ও প্রয়োজনীয়তা" : "Our 2 Subscription Categories & Requirements"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Member Category Card */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/20 border border-emerald-100/70 shadow-sm space-y-2.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-emerald-800 text-sm flex items-center gap-1">
                                  👥 {lang === "bn" ? "১. জেমিনি মেম্বার প্ল্যান" : "1. Gemini Member Plan"}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                  {lang === "bn" ? "পাসওয়ার্ড ছাড়া" : "No Password Required"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {lang === "bn"
                                  ? "এটি আমাদের সবচেয়ে বাজেট-ফ্রেন্ডলি অপশন। আমরা আপনাকে একটি গুগল ফ্যামিলি ইনভাইটেশন লিংক পাঠাবো, যেখানে জয়েন করে আপনি জেমিনি অ্যাডভান্সড এর সমস্ত প্রিমিয়াম ফিচার ব্যবহার করতে পারবেন।"
                                  : "Our most budget-friendly option. We will send you an official Google Family Invitation link to your Gmail, and joining it will instantly activate Gemini Advanced benefits on your account."}
                              </p>
                              <div className="text-xs space-y-1.5 pt-1 border-t border-emerald-100/40">
                                <p className="font-bold text-emerald-900">
                                  ⏱️ {lang === "bn" ? "মেয়াদসমূহ:" : "Available Durations:"} <span className="font-normal text-gray-600">1, 3, 6, 12 {lang === "bn" ? "মাস" : "Months"}</span>
                                </p>
                                <p className="font-bold text-red-600 flex items-center gap-1">
                                  🔒 {lang === "bn" ? "প্রয়োজনীয়তা: শুধুমাত্র জিমেইল এড্রেস!" : "Requirements: Gmail Address Only!"}
                                </p>
                                <p className="text-[11px] text-gray-500 italic">
                                  {lang === "bn" ? "*কোন পাসওয়ার্ড বা লগইন কোডের প্রয়োজন নেই।" : "*No password or login credentials needed."}
                                </p>
                              </div>
                            </div>

                            {/* Personal Category Card */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/20 border border-indigo-100/70 shadow-sm space-y-2.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-indigo-800 text-sm flex items-center gap-1">
                                  👑 {lang === "bn" ? "২. পার্সোনাল প্ল্যান" : "2. Personal Plan"}
                                </span>
                                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                  {lang === "bn" ? "মাস্টার একাউন্ট" : "Master Access"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {lang === "bn"
                                  ? "আপনার নিজস্ব পার্সোনাল জিমেইল একাউন্টেই অফিসিয়াল পেমেন্ট মেথড দিয়ে এটি একটিভেট করে দেয়া হবে। এটি নিলে আপনি মাস্টার একাউন্ট হোল্ডার হবেন এবং চাইলে আপনার আরও ৫ জন ফ্যামিলি মেম্বার/বন্ধুকে শেয়ার করতে পারবেন!"
                                  : "Fully activated directly on your personal Gmail account using official Google billing. As the master owner, you can share all premium benefits with up to 5 family members or friends!"}
                              </p>
                              <div className="text-xs space-y-1.5 pt-1 border-t border-indigo-100/40">
                                <p className="font-bold text-indigo-900">
                                  ⏱️ {lang === "bn" ? "মেয়াদসমূহ:" : "Available Durations:"} <span className="font-normal text-gray-600">12 {lang === "bn" ? "মাস (১ বছর)" : "Months (1 Year)"}</span>
                                </p>
                                <p className="font-bold text-indigo-900 flex items-center gap-1">
                                  👥 {lang === "bn" ? "মেম্বার সুবিধা: মোট ৬ জন ব্যবহারযোগ্য!" : "Sharing Benefit: Up to 6 Users Total!"}
                                </p>
                                <p className="font-bold text-amber-700 flex items-center gap-1 leading-tight">
                                  ⚠️ {lang === "bn" ? "প্রয়োজনীয়তা: জিমেইল, পাসওয়ার্ড এবং অথেনটিকেশন কী" : "Requirements: Gmail, Password & Authentication Key"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                          <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
                            💎 {lang === "bn" ? "এক্সক্লুসিভ ফিচার ও সুবিধাসমূহ" : "Exclusive Features & Benefits"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-gray-600">
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">☁️ {lang === "bn" ? "৫টিবি ক্লাউড স্টোরেজ:" : "Massive Cloud Storage:"}</span>
                              <span>{lang === "bn" ? "আপনার বড় ফাইল, ডকুমেন্টস ও মিডিয়া ব্যাকআপ রাখার জন্য ৫টিবি সুরক্ষিত ক্লাউড স্টোরেজ পাবেন।" : "Get 5TB of secure Cloud Storage to save all your large files, documents, and high-res media."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">⚡ {lang === "bn" ? "ফ্লো এআই ও মান্থলি ক্রেডিট:" : "Flow AI & Monthly Credits:"}</span>
                              <span>{lang === "bn" ? "ফ্লো এআই, চ্যাটজিপিটি এবং অন্যান্য অ্যাডভান্সড কাজের জন্য প্রতি মাসে ১০০০ প্রিমিয়াম এআই ক্রেডিট পাবেন।" : "Enjoy 1000 AI Credits every month for seamless, high-volume access to Flow AI, ChatGPT, and advanced AI tasks."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">👥 {lang === "bn" ? "ফ্যামিলি শেয়ারিং অপশন:" : "Family Sharing Allowed:"}</span>
                              <span>{lang === "bn" ? "শেয়ার করুন সবার সাথে! পার্সোনাল প্ল্যানটি নিলে আপনার সাথে আরও ৫ জন ফ্যামিলি মেম্বারকে অ্যাড করার মাস্টার সুবিধা পাবেন।" : "Share the power of AI! The Personal plan allows you to invite and share premium access with up to 5 additional family members."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">⭐ {lang === "bn" ? "জেমিনি অ্যাডভান্সড এক্সেস:" : "Gemini Advanced:"}</span>
                              <span>{lang === "bn" ? "জতিিল প্রজেক্ট বা কাজের জন্য গুগলের সবচেয়ে শক্তিশালী ও আধুনিক এআই মডেলগুলোতে প্রায়োরিটি এক্সেস পাবেন।" : "Gain priority access to Google’s most capable and cutting-edge AI models for highly complex workflows."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">🔍 {lang === "bn" ? "ডিপ রিসার্চ ক্যাপাবিলিটি:" : "Deep Research Capabilities:"}</span>
                              <span>{lang === "bn" ? "খুব সহজেই গভীরভাবে ওয়েব রিসার্চ, হাই-লেভেল ডাটা অ্যানালাইসিস এবং নিখুঁতভাবে সারসংক্ষেপ তৈরি করুন।" : "Conduct deep-dive web research, high-level data analysis, and comprehensive summaries effortlessly."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-gray-800 block">💼 {lang === "bn" ? "গুগল ওয়ার্কস্পেস ইন্টিগ্রেশন:" : "Workspace Integration:"}</span>
                              <span>{lang === "bn" ? "সরাসরি আপনার দৈনন্দিন জিমেইল, গুগল ডকস, ড্রাইভ এবং স্লাইডের ভেতর এআই অ্যাসিস্ট্যান্ট ব্যবহার করুন।" : "Use AI assistance directly inside your everyday Google apps, including Gmail, Docs, Drive, and Slides."}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100 col-span-1 md:col-span-2">
                              <span className="font-bold text-gray-800 block">💻 {lang === "bn" ? "অ্যাডভান্সড কোডিং ও ক্রিয়েটিভ টুলস:" : "Advanced Coding & Creative Tools:"}</span>
                              <span>{lang === "bn" ? "কয়েক সেকেন্ডে জটিল কোড লিখুন, ডিবাগ করুন ও অপ্টিমাইজ করুন। এছাড়াও টেক্সট দিয়ে ফটো-রিয়েলিস্টিক ছবি তৈরি এবং পিডিএফ নিয়ে কাজ করার জন্য NotebookLM প্রিমিয়াম এক্সেস পাবেন!" : "Write, debug, and optimize complex code in seconds. Plus, transform text prompts into photorealistic next-gen images and interact with your PDFs via NotebookLM Premium Access!"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tracking, Warranty, Step-by-Step */}
                        <div className="space-y-4 text-xs text-gray-600 border-t border-gray-100 pt-4">
                          <div>
                            <span className="font-bold text-gray-800 flex items-center gap-1 mb-1.5">📊 {lang === "bn" ? "কিভাবে অর্ডার এবং এক্সপায়ারি ট্র্যাকিং করবেন" : "How to Track Your Order & Expiry"}</span>
                            <p className="leading-relaxed">
                              {lang === "bn" 
                                ? "অর্ডারের পর আপনার সচল প্ল্যানগুলো এবং মেয়াদ শেষ হতে কতদিন বাকি আছে তা সরাসরি আমাদের ওয়েবসাইট থেকেই দেখতে পারবেন। আপনার একাওন্ট ড্যাশবোর্ডের 'My Plan and Subscription' সেকশনে গেলেই সমস্ত ডিটেইলস পেয়ে যাবেন।"
                                : "You can track your active plans and check how many days are left on your subscription directly from our website. Simply log into your Account Dashboard, go to 'My Plan and Subscription' section, and view all details in one click."}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-gray-800 flex items-center gap-1 mb-1.5">🛡️ {lang === "bn" ? "ফুল-পিরিয়ড ওয়ারেন্টি ও কাস্টমার সাপোর্ট" : "Full-Period Warranty & Priority Support"}</span>
                            <p className="leading-relaxed">
                              {lang === "bn"
                                ? "আমাদের ১০০% অফিসিয়াল ফুল-পিরিয়ড ওয়ারেন্টির কারণে সম্পূর্ণ নিশ্চিন্তে ব্যবহার করতে পারবেন। যেকোনো প্রয়োজনে আমাদের হোয়াটসঅ্যাপ বা টেলিগ্রাম সাপোর্টে যোগাযোগ করলেই অতি দ্রুত (১ মিনিট থেকে ২ ঘন্টার মধ্যে) সমাধান পেয়ে যাবেন।"
                                : "Enjoy 100% peace of mind with our official full-period warranty. If you face any issues, contact our support team on WhatsApp or Telegram for ultra-fast, priority issue resolution and fast-track processing (takes 1 minute to 2 hours)."}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-gray-800 flex items-center gap-1 mb-1.5">🌍 {lang === "bn" ? "গ্লোবাল সার্ভিস ও রিজিওনাল প্রাইজ নোটিশ" : "Global Service & Regional Pricing Notice"}</span>
                            <p className="leading-relaxed">
                              {lang === "bn"
                                ? "আমরা বিশ্বজুড়ে গ্রাহকদের সেবা প্রদান করি। রিজিওনাল ট্যাক্স এবং গুগলের স্থানীয় বিলিং পলিসির কারণে বিভিন্ন দেশে দামের তারতম্য হতে পারে। ড্রপডাউন মেনু থেকে আপনার দেশ সিলেক্ট করে সঠিক রেটটি দেখে নিতে পারেন।"
                                : "We proudly serve customers globally. Please note that pricing may vary depending on your country due to regional taxes and localized Google billing policies. Use our dropdown to view the exact rate for your country!"}
                            </p>
                          </div>

                          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50">
                            <span className="font-bold text-blue-800 flex items-center gap-1 mb-1.5">🛒 {lang === "bn" ? "ধাপ-বাই-ধাপ অর্ডার করার নিয়ম" : "Step-by-Step Ordering Process"}</span>
                            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-blue-900/80">
                              {lang === "bn" ? (
                                <>
                                  <li>অর্ডার করার পূর্বে অবশ্যই নিশ্চিত করুন যে আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স আছে।</li>
                                  <li>আপনার কান্ট্রি/রিজিওন সিলেক্ট করুন এবং আপনার পছন্দের ক্যাটাগরি (মেম্বার নাকি পার্সোনাল) ও মেয়াদ বেছে নিন।</li>
                                  <li>প্ল্যান অনুযায়ী প্রয়োজনীয় তথ্য (মেম্বারের জন্য শুধুমাত্র জিমেইল এড্রেস, এবং পার্সোনালের জন্য জিমেইল, পাসওয়ার্ড ও অথেনটিকেশন কী) দিয়ে অর্ডার সাবমিট করুন। ব্যালেন্স ইনস্ট্যান্ট কেটে নেওয়া হবে এবং দ্রুত সাবস্ক্রিপশন চালু হবে।</li>
                                </>
                              ) : (
                                <>
                                  <li>Before placing an order, make sure to Top Up your website wallet with sufficient funds.</li>
                                  <li>Select your Country/Region, choose your preferred category (Member or Personal), and select duration.</li>
                                  <li>Provide the required information (only Gmail Address for Member plan, or Gmail Address, Password & Authentication Key for Personal plan) and confirm the order. The amount will be instantly deducted from your wallet balance.</li>
                                </>
                              )}
                            </ol>
                          </div>
                        </div>

                        {/* Bottom Buy Now button scrolling back up to the form */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={() => {
                              document.getElementById("gemini-order-form")?.scrollIntoView({ behavior: "smooth" });
                              const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                              if (emailInput) {
                                emailInput.focus();
                                emailInput.classList.add("ring-4", "ring-blue-500/20");
                                setTimeout(() => {
                                  emailInput.classList.remove("ring-4", "ring-blue-500/20");
                                }, 1500);
                              }
                            }}
                            className="py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>⚡ {lang === "bn" ? "এখনই কিনুন" : "Buy Now"}</span>
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Product: Google Gemini Pro Premium (Custom Featured Card) */}
                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                  {/* Visual Header with Gemini PNG */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center h-44 relative overflow-hidden">
                    <div className="flex flex-col justify-between h-full z-10 text-left">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white/20 text-white backdrop-blur-sm self-start">
                        {lang === "bn" ? "প্রিমিয়াম এআই সাবস্ক্রিপশন" : "Premium AI Subscription"}
                      </span>
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight drop-shadow-sm">
                          Google Gemini Pro Premium
                        </h3>
                        <p className="text-xs text-blue-100 mt-1 line-clamp-1">
                          {lang === "bn" ? "অফিসিয়াল জেমিনি প্রো প্রিমিয়াম" : "Official Gemini Pro Premium"}
                        </p>
                      </div>
                    </div>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/960px-Google_Gemini_icon_2025.svg.png" 
                      alt="Google Gemini" 
                      className="w-16 h-16 object-contain drop-shadow-lg z-10 animate-pulse shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  </div>

                  {/* Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="text-left">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {lang === "bn" 
                          ? "গুগলের সর্বাধুনিক নেক্সট-জেনারেশন এআই সাবস্ক্রিপশন। ৫টিবি ক্লাউড স্টোরেজ, জেমিনি এডভান্সড, ডিপ রিসার্চ এবং আনলিমিটেড কোডিং অ্যাসিস্ট্যান্স সুবিধা পান।"
                          : "Unlock the ultimate power of Google's next-generation AI with Gemini Pro Premium. Features 5TB secure Cloud Storage, Gemini Advanced, Deep Research, Workspace Integration & more."}
                      </p>

                      <div className="space-y-2 mb-6 text-xs text-gray-600 border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{lang === "bn" ? "৫টিবি ক্লাউড স্টোরেজ এবং জেমিনি এডভান্সড" : "5TB Secure Cloud Storage & Gemini Advanced"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{lang === "bn" ? "পরিবারের ৫ জন মেম্বার শেয়ারিং সুবিধা" : "Invite & share with up to 5 family members"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{lang === "bn" ? "ডিপ রিসার্চ ও ওয়ার্কস্পেস জিমেইল এআই ইন্টিগ্রেশন" : "Deep research & Smart Workspace integration"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="leading-tight text-left">
                          <span className="text-xs text-slate-400 font-bold block">{lang === "bn" ? "সাবস্ক্রিপশন ফি" : "Subscription Fee"}</span>
                          <span className="text-lg font-black text-blue-600 block">{geminiPriceRangeText}</span>
                          <span className="text-[10px] text-gray-400 font-medium block leading-none mt-0.5">
                            {lang === "bn" ? "দেশভেদে পরিবর্তনশীল" : "Varies by Country"}
                          </span>
                        </div>
                        <span className="text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                          {lang === "bn" ? "ইনস্ট্যান্ট সেটআপ" : "Instant Setup"}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedToolDetail("gemini")}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer border-b-2 border-indigo-700 gap-1.5"
                      >
                        <span>⚡ {lang === "bn" ? "কিনতে ক্লিক করুন" : "Buy Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dynamic Tools & Subscriptions added by admin in database */}
                {coursesList
                  .filter((prod) => prod.category === "Tool" || prod.category === "Subscription")
                  .map((prod, index) => {
                    const discountPercent = prod.oldPrice > 0 ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;
                    
                    // Assign lovely modern background gradients depending on type and index
                    let bgGradient = "from-indigo-500 to-purple-600";
                    if (prod.category === "Subscription") {
                      bgGradient = "from-purple-500 to-indigo-600";
                    } else if (index % 2 !== 0) {
                      bgGradient = "from-teal-500 to-emerald-600";
                    }

                    return (
                      <div key={prod.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                        {/* Visual Header */}
                        <div className={`bg-gradient-to-r ${bgGradient} p-6 text-white flex flex-col justify-between h-44 text-left relative overflow-hidden`}>
                          <div className="flex justify-between items-start z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white/20 text-white backdrop-blur-sm">
                              {prod.category === "Subscription" 
                                ? (lang === "bn" ? "VIP সাবস্ক্রিপশন" : "VIP Subscription")
                                : (lang === "bn" ? "অটোমেশন টুল" : "Automation Tool")}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-xs font-black text-amber-300 bg-black/20 px-2 py-1 rounded-md font-mono">
                                {discountPercent}% {lang === "bn" ? "ছাড়" : "OFF"}
                              </span>
                            )}
                          </div>
                          <div className="z-10">
                            <h3 className="text-xl font-extrabold tracking-tight drop-shadow-sm line-clamp-2" title={prod.title}>
                              {prod.title}
                            </h3>
                            <p className="text-xs text-white/90 mt-1 line-clamp-1">
                              {prod.badge || "Genuine Software"}
                            </p>
                          </div>
                          <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                        </div>

                        {/* Content Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="text-left">
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3" title={prod.description}>
                              {prod.description || prod.title}
                            </p>

                            {/* Features list */}
                            {Array.isArray(prod.features) && prod.features.length > 0 && (
                              <div className="space-y-2 mb-6 text-xs text-gray-600 border-t border-gray-50 pt-4">
                                {prod.features.slice(0, 4).map((feat, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="line-clamp-1">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                              <div className="leading-tight text-left">
                                {prod.oldPrice > 0 && (
                                  <span className="text-xs text-slate-400 font-bold line-through block font-mono">
                                    ${prod.oldPrice} USD
                                  </span>
                                )}
                                <span className="text-2xl font-black text-blue-600 block font-mono">
                                  ${prod.price} USD
                                </span>
                              </div>
                              <span className="text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                                {prod.badge || (lang === "bn" ? "ইনস্ট্যান্ট ডেলিভারি" : "Instant Delivery")}
                              </span>
                            </div>

                            <button
                              onClick={() => handleBuyTool(prod)}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer border-b-2 border-blue-800 gap-1.5"
                            >
                              <span>⚡ {lang === "bn" ? "ব্যালেন্স দিয়ে অ্যাক্টিভেট করুন" : "Activate with Balance"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

              </div>
            )}
          </div>
        )}
        {/* BUY VIEW */}
        {currentView === "buy" && (
          <div className="space-y-6 bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-2 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
            </button>


            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {i18n.liveBuyTitle}
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {i18n.liveBuySub}
                </p>
              </div>
              <div className="hidden md:flex bg-blue-50 text-blue-700 px-4 py-2 rounded-lg items-center gap-2 font-medium border border-blue-100">
                <CheckCircle className="w-5 h-5" />
                {i18n.autoSystem}
              </div>
            </div>

            {/* Special Offer Ad inside Buy view */}
            <AnimatePresence>
              {showSpecialOfferAd && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 30 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden border-2 border-yellow-300 group">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[shimmer_2s_linear_infinite] opacity-20 pointer-events-none" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowSpecialOfferAd(false); }}
                      className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition cursor-pointer z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative z-10 max-w-xl mx-auto space-y-4">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block bg-yellow-300 text-red-700 text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-yellow-400"
                      >
                        🔥 SPECIAL OFFER 🔥
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                        UP TO 79% OFF! 🎉
                      </h3>
                      <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed drop-shadow-sm">
                        Boost your business & get insane discounts on Advertising! 🚀 Hurry up, this is a LIMITED TIME EVENT! ⏰
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pt-2">
                        <button
                          onClick={() => {
                            setCurrentView("courses");
                            setSelectedCourseCat("all");
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-white text-red-600 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-b-4 border-gray-200 uppercase tracking-wider"
                        >
                          <span>👉 CLICK HERE TO CLAIM 👈</span>
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {
              loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2AABEE]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countries.map((c, idx) => {
                    const finalPrice =
                      c.basePrice + (c.basePrice * markupPercent) / 100;

                    return (
                      <div
                        key={`${c.id || "c"}-${idx}`}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {c.flag || getFlag(c.country, c.code)}{" "}
                                {c.country}
                              </h3>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                                {c.code}
                              </span>
                            </div>
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                              {formatCurrency(finalPrice)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-5 text-sm">
                            <span className="text-gray-600">
                              {i18n.stockLbl}
                            </span>
                            <span
                              className={`font-bold ${c.stock > 0 ? "text-green-600" : "text-red-500"}`}
                            >
                              {c.stock > 0
                                ? `${c.stock} ${i18n.pcs}`
                                : i18n.outOfStock}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={c.stock === 0}
                          onClick={() => handleBuy(c, finalPrice)}
                          className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 mt-auto ${
                            c.stock > 0
                              ? "bg-[#2AABEE] hover:bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {c.stock > 0 ? i18n.buyBtn : i18n.outOfStock}
                        </button>
                        {buyErrorId === c.id && (
                          <div className="mt-3 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-center animate-in fade-in slide-in-from-top-2">
                            <p className="font-bold text-sm mb-2">Insufficient balance!</p>
                            <button 
                              onClick={() => {
                                setBuyErrorId(null);
                                setTopupModal(true);
                              }}
                              className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold text-sm transition"
                            >
                              Top Up Now
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* SELL VIEW */}
        {currentView === "sell" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 p-8 rounded-2xl shadow-md border border-blue-200/50 text-center max-w-2xl mx-auto my-8">
            <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium bg-gray-50 px-4 py-2 rounded-full mx-auto shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {i18n.underDevTitle}
            </h2>
            <p className="text-gray-600">
              {i18n.underDevSub}
            </p>
          </div>
        )}



        {/* WALLET HISTORY VIEW */}
        {currentView === "wallet-history" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 min-h-[500px] text-gray-900 rounded-2xl overflow-hidden shadow-md border border-blue-200/50 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold mb-4 sm:mb-0 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-500" /> Top-up & Withdraw
                History
              </h2>
              <button
                onClick={() => requireAuth(() => { setCurrentView("profile"); })}
                className="text-sm font-medium text-[#2AABEE] hover:underline bg-[#2AABEE]/10 px-3 py-1.5 rounded-lg border border-[#2AABEE]/20"
              >
                Back to Profile
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
              {transactions.filter(
                (t) =>
                  t.type === "withdraw" ||
                  t.type === "deposit" ||
                  t.type === "topup" ||
                  t.type === "referral_bonus",
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">
                  No wallet history found.
                </div>
              ) : (
                transactions
                  .filter(
                    (t) =>
                      t.type === "withdraw" ||
                      t.type === "deposit" ||
                      t.type === "topup" ||
                      t.type === "referral_bonus",
                  )
                  .map((tx) => (
                    <div
                      key={`wallet-history-${tx.id}`}
                      className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-full ${tx.type === "withdraw" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                        >
                          {tx.type === "withdraw" ? (
                            <ArrowRight className="w-5 h-5 transform -rotate-45" />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 capitalize">
                            {tx.type === "withdraw"
                              ? "Withdraw"
                              : tx.type === "referral_bonus"
                                ? "Referral Bonus"
                                : "Top-up"}
                            {tx.status === "OK" || tx.status === "paid" || tx.status === "completed" || tx.status === "success" ? (
                              <span className="text-green-500 ml-1 text-sm font-bold">
                                (Paid)
                              </span>
                            ) : tx.status === "rejected" || tx.status === "failed" || tx.status === "canceled" || tx.status === "cancelled" ? (
                              <span className="text-red-500 ml-1 text-sm font-bold">
                                (Rejected)
                              </span>
                            ) : (
                              <span className="text-yellow-500 ml-1 text-sm font-normal">
                                (Pending)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(tx.createdAt).toLocaleString()}{" "}
                            {tx.details?.method ? `• ${tx.details.method}` : ""}
                          </p>
                          {tx.details?.account && (
                            <p className="text-xs font-mono text-gray-400 mt-1">
                              Account: {tx.details.account}
                            </p>
                          )}
                          <p 
                            className="text-xs font-mono text-gray-400 mt-1 cursor-pointer hover:text-gray-600 transition inline-block bg-gray-100 px-1.5 py-0.5 rounded"
                            title="Click to copy Transaction ID"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tx.id) {
                                navigator.clipboard.writeText(tx.id);
                                toast("Transaction ID copied to clipboard: " + tx.id);
                              }
                            }}
                          >
                            ID: {tx.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p
                          className={`font-bold text-lg ${tx.type === "withdraw" ? "text-red-500" : "text-green-600"}`}
                        >
                          {tx.type === "withdraw" ? "-" : "+"}$
                          {tx.amountUSD?.toFixed(2)}
                        </p>
                        {tx.type === "topup" && tx.status === "pending" && tx.details?.payment_url && (
                          <button 
                            onClick={() => window.open(tx.details.payment_url, "_blank")}
                            className="mt-2 bg-[#2AABEE] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600 transition inline-flex items-center justify-center gap-1"
                          >
                            Pay Now <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* RECORDS VIEW */}
        {currentView === "records" && (
          <div className="bg-gradient-to-br from-sky-100 to-indigo-200 min-h-[500px] text-gray-900 rounded-2xl overflow-hidden shadow-md border border-blue-200/50 relative">
            <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden absolute top-4 right-4 flex items-center text-gray-600 hover:text-gray-900 font-medium bg-gray-100 px-3 py-1.5 rounded-full shadow-sm z-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 pt-14 sm:pt-4 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-4 sm:mb-0">
                {i18n.recordsTitle || "Transaction Ledger"}
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar shrink-0">
                <button 
                   onClick={() => setRecordsTab("buy")}
                   className={`px-4 py-2 font-bold whitespace-nowrap transition-colors ${recordsTab === "buy" ? "text-[#2AABEE] border-b-2 border-[#2AABEE]" : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"}`}>
                  BUY TELEGRAM ACCOUNTS
                </button>
                <button 
                   onClick={() => setRecordsTab("smm")}
                   className={`px-4 py-2 font-bold whitespace-nowrap transition-colors ${recordsTab === "smm" ? "text-[#2AABEE] border-b-2 border-[#2AABEE]" : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"}`}>
                  SMM ORDERS
                </button>
                <button className="text-gray-600 hover:text-gray-500 px-4 py-2 font-bold whitespace-nowrap cursor-not-allowed border-b-2 border-transparent">
                  SELL TELEGRAM ACCOUNTS
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {recordsTab === "buy" ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 tracking-wider text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">{i18n.colPhone || "PHONE"}</th>
                      <th className="px-6 py-4">{i18n.colPrice || "PRICE"}</th>
                      <th className="px-6 py-4">{i18n.colDate || "DATE"}</th>
                      <th className="px-6 py-4">{i18n.colStatus || "STATUS"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions
                      .filter((t) => t.type === "purchase")
                      .map((tx) => (
                        <tr
                          key={`purchase-${tx.id}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-gray-900">
                            {tx.details?.phone || "Loading..."}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {tx.amountUSD?.toFixed(2)} USD
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(tx.createdAt).toLocaleString(undefined, {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {tx.status === "WAIT" ? (
                              <div className="flex items-center gap-4">
                                <span className="text-yellow-500 font-bold uppercase">
                                  WAIT
                                </span>
                                <button
                                  onClick={() =>
                                    handleGetCode(tx.details?.phone, tx.id)
                                  }
                                  className="bg-[#2AABEE]/10 text-[#2AABEE] border border-[#2AABEE]/30 hover:bg-[#2AABEE]/20 px-3 py-1.5 rounded-lg text-xs transition font-bold shadow-sm"
                                >
                                  {i18n.getCodeBtnRecord || "Get Code"}
                                </button>
                              </div>
                            ) : tx.status === "OK" ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="text-green-500 font-bold uppercase">
                                  OK
                                </span>
                                {tx.details?.code && (
                                  <span className="font-mono text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded inline-block shadow-sm">
                                    Code: {tx.details.code}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-red-500 font-bold">
                                {tx.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {transactions.filter((t) => t.type === "purchase").length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-gray-500 italic"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 tracking-wider text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">SERVICE</th>
                      <th className="px-6 py-4">QTY / LINK</th>
                      <th className="px-6 py-4">PRICE</th>
                      <th className="px-6 py-4">DATE</th>
                      <th className="px-6 py-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions
                      .filter((t) => t.type === "smm_order")
                      .map((tx) => (
                        <tr
                          key={`smm-order-${tx.id}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-[#2AABEE]">
                            {tx.providerOrderId || tx.id}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            <div className="max-w-[200px] truncate">{tx.serviceName}</div>
                            <div className="text-xs text-gray-500 mt-1">{tx.category}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="font-bold text-gray-800">{tx.quantity}</div>
                            <a href={tx.link} target="_blank" rel="noopener noreferrer" className="text-[#2AABEE] text-xs hover:underline truncate max-w-[150px] block mt-1">{tx.link}</a>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {tx.amountUSD?.toFixed(2)} USD
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(tx.createdAt).toLocaleString(undefined, {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold uppercase ${
                              (tx.status || "").toLowerCase() === "completed" || (tx.status || "").toLowerCase() === "success" ? "text-green-500" :
                              ["canceled", "cancelled", "failed", "error", "rejected", "refunded"].includes((tx.status || "").toLowerCase()) ? "text-red-500" :
                              ["pending", "wait", "awaiting"].includes((tx.status || "").toLowerCase()) ? "text-yellow-500" :
                              "text-blue-500"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {transactions.filter((t) => t.type === "smm_order").length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500 italic"
                        >
                          No SMM orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === "profile" && (
          <div className="space-y-6 bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <button
              onClick={() => { setCurrentView("dashboard"); }}
              className="md:hidden flex items-center text-gray-600 hover:text-gray-900 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
            </button>
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {i18n.profileTitle || "My Profile"}
              </h2>
              <div className="flex items-center gap-2">
                {((currentUser?.email && (currentUser.email === "uzvsbdnzyxhzj@gmail.com")) || currentUser?.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2") && (
                  <button data-ad-skip="true" onClick={() => { setCurrentView("admin"); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold hidden md:flex">
                    <Settings className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Admin Settings</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    signOut(auth); setShowAuth(true); setAuthMode('login'); }}
                  className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-6">
                   {((currentUser?.email && (currentUser.email === "uzvsbdnzyxhzj@gmail.com")) || currentUser?.uid === "rLDBAtiXmOcXGLU2d5GYFonwJkr2") && (
                     <button data-ad-skip="true" onClick={() => { setCurrentView("admin"); }} className="mb-4 mx-auto md:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold w-full">
                       <Settings className="w-5 h-5 shrink-0" /> <span>Admin Settings Dashboard</span>
                     </button>
                   )}
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#1cd435] to-green-600 p-1 mb-4 flex items-center justify-center">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile Avatar" className="w-full h-full rounded-full object-cover border-4 border-white" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#1cd435] flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
                        {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#1cd435] mb-2 uppercase">
                    Hi, {currentUser?.displayName || currentUser?.email?.split('@')[0] || "User"}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-gray-800 font-bold text-base">Available Balance : {(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))} USD</span>
                    <button onClick={() => window.location.reload()} className="p-1 hover:bg-gray-100 border border-gray-300 rounded-md transition shadow-sm">
                      <RefreshCw className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm relative group cursor-pointer" onClick={() => { navigator.clipboard.writeText(currentUser.uid); toast("UID copied!"); }}>
                      <div className="text-[#1cd435] font-bold text-[10px] sm:text-xs mb-1 break-all flex items-center justify-center gap-1">
                        {currentUser.uid}
                        <Copy className="w-3 h-3 shrink-0" />
                      </div>
                      <div className="text-[#152e4d] flex items-center justify-center gap-1 font-bold text-xs sm:text-sm">Support ID (UID)</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.txType === "Credit").reduce((sum, t) => sum + (t.amountUSD || 0), 0).toFixed(2)} USD</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Deposited</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.type === "purchase" || t.txType === "Debit").reduce((sum, t) => sum + (t.amountUSD || 0), 0).toFixed(2)}</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Spent</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.type === "purchase" || t.type === "p2p_buy").length}</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Order</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-800" />
                    <h3 className="font-bold text-gray-800 text-lg">Account Information</h3>
                  </div>
                  <div className="p-6">
                      <div className="bg-[#1cd435] text-white rounded-lg p-4 text-center mb-4">
                        <div className="font-bold text-xl mb-1">{(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))} USD</div>
                        <div className="text-sm font-bold tracking-wide">Available Balance</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                        <CheckCircle className="w-10 h-10 text-blue-500 mx-auto fill-blue-500/10" />
                        <div className="text-xl font-bold mt-3 text-gray-800">Account Verified!</div>
                      </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-800" />
                    <h3 className="font-bold text-gray-800 text-lg">User Information</h3>
                  </div>
                  <div className="p-6 text-sm text-gray-800 space-y-3">
                      <p className="flex items-center"><strong className="w-16">email :</strong> <span className="font-medium text-gray-600">{currentUser?.email}</span></p>
                      <p className="flex items-center"><strong className="w-16">Phone :</strong> <span className="font-medium text-gray-600">N/A</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">

              {/* Referral Profile Card */}
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 rounded-2xl shadow-lg text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">
                    {i18n.referEarnUpTo || "Refer & Earn"}
                  </h3>
                  <p className="text-orange-50 text-sm md:text-base mb-6 leading-relaxed">
                    {i18n.referDesc ||
                      "Earn 1% lifetime commission on every deposit."}
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4 space-y-4">
                    <div>
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mb-2">
                        {i18n.yourRefLink || "Your Website Link"}
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <code className="bg-black/20 px-3 py-2 rounded-lg font-mono text-sm flex-1 overflow-x-auto whitespace-nowrap">
                          {window.location.origin}/?ref={numericId || currentUser?.uid}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/?ref=${numericId || currentUser?.uid}`,
                            );
                            toast("Website Link Copied!");
                          }}
                          className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mb-2">
                        Your Telegram Bot Link
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <code className="bg-black/20 px-3 py-2 rounded-lg font-mono text-sm flex-1 overflow-x-auto whitespace-nowrap">
                          https://t.me/TeleMarket_official_bot?start={numericId}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://t.me/TeleMarket_official_bot?start=${numericId}`,
                            );
                            toast("Bot Link Copied!");
                          }}
                          className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="bg-orange-500/30 rounded-lg p-3 text-xs md:text-sm text-white flex items-center gap-2 border border-orange-300">
                      <span className="text-xl shrink-0">💡</span>
                      <p>
                        <strong>How it works:</strong> Anyone who opens your Bot Link or Website Link will be automatically counted as your referral! The manual code box inside the app is only if they come without clicking any link.
                      </p>
                    </div>
                  </div>

                  {!userReferredBy ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-4">
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mb-2">
                        {i18n.enterRefCode || "Enter Invite Code"}
                      </p>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        handleBindReferral(data.get("refCode") as string);
                      }} className="flex gap-2">
                        <input
                          type="text"
                          name="refCode"
                          placeholder="e.g. 10005"
                          className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                          required
                        />
                        <button type="submit" className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition">
                          Bind
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mt-4">
                       <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mb-1">Invited By</p>
                       <p className="text-sm font-bold">You were invited by a friend.</p>
                    </div>
                  )}

                </div>
                <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl outline-none"></div>
              </div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">My Invited Users</h3>
                <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded text-xs">
                  {referredUsers.length} Users
                </span>
              </div>

              {referredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    You haven't invited anyone yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Share your link above to get started!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {referredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-300">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {user.hasDeposited || user.balanceUSD > 0 ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold uppercase border border-gray-200">
                            Unactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My AI Tools & Subscription Plans */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
              <div className="p-4 border-b border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                      {lang === "bn" ? "আমার এআই টুলস ও সাবস্ক্রিপশন প্ল্যান" : "My AI Tools & Subscription Plans"}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {lang === "bn" ? "আপনার সক্রিয় এবং মেয়াদোত্তীর্ণ সাবস্ক্রিপশন তালিকা" : "List of your active & expired subscription plans"}
                    </p>
                  </div>
                </div>
                <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-xs">
                  {userSubscriptions.length} Plans
                </span>
              </div>

              {userSubscriptions.length === 0 ? (
                <div className="p-8 text-center">
                  <Bot className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    {lang === "bn" ? "কোন সক্রিয় সাবস্ক্রিপশন পাওয়া যায়নি" : "No active subscriptions found"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    {lang === "bn" ? "কম দামে গুগল জেমিনি প্রো প্রিমিয়াম কিনতে আমাদের সার্ভিস পেজ ভিজিট করুন।" : "Get Gemini Pro Premium at cheap prices from our Tools section."}
                  </p>
                  <button
                    onClick={() => setCurrentView("tools")}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-600/10"
                  >
                    {lang === "bn" ? "সাবস্ক্রিপশন কিনুন" : "Buy Subscription"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto custom-scrollbar">
                  {userSubscriptions.map((sub) => {
                    const ago = getSubscriptionDaysAgo(sub.createdAt);
                    const remaining = getSubscriptionRemainingText(sub.expiresAt);
                    const countryFlag = geminiCountryFlags[sub.country] || "🌍";
                    
                    return (
                      <div key={sub.id} className="p-4 hover:bg-indigo-50/10 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-800">
                              Google Gemini Pro Premium
                            </span>
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {sub.plan === "member_1m" ? "Gemini Member (1-Month)" :
                               sub.plan === "member_3m" ? "Gemini Member (3-Month)" :
                               sub.plan === "member_6m" ? "Gemini Member (6-Month)" :
                               sub.plan === "member_12m" ? "Gemini Member (12-Month)" :
                               sub.plan === "personal_12m" ? "Personal (12-Month)" : "12-Month"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {sub.status === "pending" ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                ⏳ {lang === "bn" ? "পেন্ডিং (ম্যানুয়াল এক্টিভেশন)" : "Pending (Manual Activation)"}
                              </span>
                            ) : sub.status === "canceled" || sub.status === "cancelled" ? (
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                                ❌ {lang === "bn" ? "বাতিল ও রিফান্ডড" : "Cancelled & Refunded"}
                              </span>
                            ) : remaining.isExpired ? (
                              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                                {lang === "bn" ? "মেয়াদোত্তীর্ণ" : "Expired"}
                              </span>
                            ) : remaining.isCritical ? (
                              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                ⚠️ {remaining.text}
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                                {remaining.text}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs mb-3">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium">Country</p>
                              <p className="font-semibold text-gray-700 flex items-center gap-1">
                                {sub.country} {countryFlag}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium">Purchased</p>
                              <p className="font-semibold text-gray-700">
                                {new Date(sub.createdAt).toLocaleDateString()} <span className="text-[10px] font-normal text-gray-400">({ago})</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-gray-400 font-medium">Linked Gmail</p>
                              <p className="font-semibold text-gray-700 truncate select-all">
                                {sub.geminiEmail}
                              </p>
                            </div>
                          </div>

                          {sub.plan === "personal_12m" && (
                            <div className="col-span-2 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/30 space-y-1">
                              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">🔒 Submitted Credentials</p>
                              <p className="text-xs text-gray-600 font-medium">
                                Pass: <span className="font-mono font-bold text-gray-800 select-all">{sub.geminiPassword}</span>
                              </p>
                              {sub.geminiBackupCodes && sub.geminiBackupCodes !== "Not Required" && (
                                <p className="text-xs text-gray-600 font-medium">
                                  Authentication Key: <span className="font-mono font-bold text-gray-800 select-all">{sub.geminiBackupCodes}</span>
                                </p>
                              )}
                            </div>
                          )}

                           <div className="flex items-center gap-1.5 text-gray-600 col-span-2 bg-indigo-50/40 p-2 rounded-xl border border-indigo-50/50">
                            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Family Manager Gmail</p>
                              <p className="font-bold text-indigo-900 truncate">
                                {sub.familyManagerEmail && sub.familyManagerEmail !== "Not Assigned" ? (
                                  <span className="select-all">{sub.familyManagerEmail}</span>
                                ) : sub.status === "canceled" || sub.status === "cancelled" ? (
                                  <span className="text-red-500 font-semibold italic">
                                    {lang === "bn" ? "অর্ডার বাতিল করা হয়েছে" : "Order Cancelled"}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-normal italic">
                                    {lang === "bn" ? "অ্যাক্টিভেশন প্রক্রিয়াধীন..." : "Activation in progress..."}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {sub.status === "pending" && (
                            <div className="col-span-2 mt-2 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-left">
                              <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-1">
                                📢 {lang === "bn" ? "ম্যানুয়াল প্রসেস (৫ মিনিট - ২ ঘণ্টা)" : "Manual Process (5 Mins - 2 Hours)"}
                              </p>
                              <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
                                {lang === "bn"
                                  ? "আপনার সাবস্ক্রিপশনটি ম্যানুয়ালি প্রসেস করা হচ্ছে। দ্রুততম সময়ে ডেলিভারি পেতে অনুগ্রহ করে হোয়াটসঅ্যাপ বা টেলিগ্রাম সাপোর্টে আমাদের সাথে যোগাযোগ করুন।"
                                  : "Your subscription is being manually processed. To get it activated faster, please reach out to our WhatsApp or Telegram support team."}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-2">
                          <span className="text-[10px] text-gray-400">
                            ID: <span className="font-mono text-gray-500 select-all">{sub.id}</span>
                          </span>
                          <button
                            onClick={() => {
                              setGeminiCountry(sub.country);
                              setGeminiPlan(sub.plan);
                              setGeminiEmail(sub.geminiEmail);
                              setCurrentView("tools");
                              toast(`Form pre-filled! You can now renew your plan.`);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm"
                          >
                            {lang === "bn" ? "রিনিউ করুন 🔄" : "Renew Plan 🔄"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Advertisements Component */}
            <MyAdsProfile currentUser={currentUser} onNavigate={(v) => setCurrentView(v as typeof currentView)} />

            {/* Quick Actions / Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Account Actions</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <button
                  onClick={() => requireAuth(() => { setCurrentView("wallet-history"); })}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Top-up & Withdraw History
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => requireAuth(() => { setCurrentView("records"); })}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Buy & Sell Records
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    requestNotificationPermission();
                    toast("Notifications Enabled");
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Enable Push Notifications
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Recent Transactions in Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">
                  Recent Wallet History
                </h3>
                <button
                  onClick={() => requireAuth(() => { setCurrentView("wallet-history"); })}
                  className="text-sm font-medium text-[#2AABEE] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {transactions
                  .filter(
                    (t) =>
                      t.type === "withdraw" ||
                      t.type === "deposit" ||
                      t.type === "topup" ||
                      t.type === "referral_bonus",
                  )
                  .slice(0, 5)
                  .map((tx) => (
                    <div
                      key={`recent-activity-${tx.id}`}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-bold text-gray-800 capitalize">
                          {tx.type === "withdraw"
                            ? "Withdraw"
                            : tx.type === "referral_bonus"
                              ? "Referral Bonus"
                              : "Top-up"}
                          {tx.status === "OK" || tx.status === "paid" || tx.status === "completed" || tx.status === "success" ? (
                            <span className="text-green-500 ml-1 text-xs font-bold">
                              ✓ Paid
                            </span>
                          ) : tx.status === "rejected" || tx.status === "failed" || tx.status === "canceled" || tx.status === "cancelled" ? (
                            <span className="text-red-500 ml-1 text-xs font-bold">
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="text-yellow-500 ml-1 text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${tx.type === "withdraw" ? "text-red-500" : "text-green-600"}`}
                        >
                          {tx.type === "withdraw" ? "-" : "+"}$
                          {tx.amountUSD?.toFixed(2)}
                        </p>
                        <p className="text-xs font-mono text-gray-400 max-w-[120px] truncate mb-0.5">
                          {tx.details?.method || tx.details?.account || ""}
                        </p>
                        <p 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tx.id) {
                              navigator.clipboard.writeText(tx.id);
                              toast("Transaction ID copied to clipboard: " + tx.id);
                            }
                          }}
                          className="text-[10px] font-mono text-gray-400 cursor-pointer hover:text-gray-600 transition truncate max-w-[120px] bg-gray-100 px-1.5 py-0.5 rounded inline-block"
                          title="Click to copy Transaction ID"
                        >
                          ID: {tx.id}
                        </p>
                      </div>
                    </div>
                  ))}
                {transactions.filter(
                  (t) =>
                    t.type === "withdraw" ||
                    t.type === "deposit" ||
                    t.type === "topup" ||
                    t.type === "referral_bonus",
                ).length === 0 && (
                  <div className="p-6 text-center text-gray-500 italic">
                    No recent transactions
                  </div>
                )}
              </div>
            </div>
            {/* Contact Support Section */}
            <div className="mt-8 pb-10">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Contact Us</h2>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <svg className="w-6 h-6 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06 0 .13-.01.2z"/></svg>
                  <span className="font-bold text-gray-700">Telegram</span>
                </a>
                <a href="https://wa.me/8801644627304" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 13.5v-.01c-.13-.06-1.14-.56-1.32-.63-.18-.06-.31-.1-.44.1-.14.19-.5.63-.61.76-.11.13-.23.14-.36.08-.13-.06-.82-.3-1.56-.96-.58-.51-.97-1.14-1.08-1.32-.12-.19 0-.29.07-.38.06-.06.13-.15.2-.23.06-.07.08-.13.13-.21.04-.08.02-.16-.01-.22-.04-.06-.44-1.06-.61-1.46-.16-.39-.32-.34-.44-.34h-.38c-.13 0-.34.05-.51.24s-.68.66-.68 1.62c0 .96.69 1.88.79 2.01.1.13 1.37 2.09 3.31 2.93 1.65.71 2.14.77 2.92.65.65-.1 1.43-.59 1.63-1.16.2-.56.2-.1.14-.11z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.55 3.76 1.48 5.3L2 22l4.89-1.28A9.957 9.957 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM12 20.31c-1.63 0-3.19-.43-4.52-1.22l-.32-.18-3.37.88.9-3.28-.2-.33a8.307 8.307 0 01-1.28-4.45c0-4.59 3.73-8.32 8.32-8.32 4.59 0 8.32 3.73 8.32 8.32s-3.73 8.32-8.32 8.32z"/></svg>
                  <span className="font-bold text-gray-700">WhatsApp</span>
                </a>
              </div>

              <div className="space-y-4">
                <a href="https://wa.me/8801644627304" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                   <div className="flex items-center gap-4">
                     <svg className="w-10 h-10 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 13.5v-.01c-.13-.06-1.14-.56-1.32-.63-.18-.06-.31-.1-.44.1-.14.19-.5.63-.61.76-.11.13-.23.14-.36.08-.13-.06-.82-.3-1.56-.96-.58-.51-.97-1.14-1.08-1.32-.12-.19 0-.29.07-.38.06-.06.13-.15.2-.23.06-.07.08-.13.13-.21.04-.08.02-.16-.01-.22-.04-.06-.44-1.06-.61-1.46-.16-.39-.32-.34-.44-.34h-.38c-.13 0-.34.05-.51.24s-.68.66-.68 1.62c0 .96.69 1.88.79 2.01.1.13 1.37 2.09 3.31 2.93 1.65.71 2.14.77 2.92.65.65-.1 1.43-.59 1.63-1.16.2-.56.2-.1.14-.11z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.55 3.76 1.48 5.3L2 22l4.89-1.28A9.957 9.957 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM12 20.31c-1.63 0-3.19-.43-4.52-1.22l-.32-.18-3.37.88.9-3.28-.2-.33a8.307 8.307 0 01-1.28-4.45c0-4.59 3.73-8.32 8.32-8.32 4.59 0 8.32 3.73 8.32 8.32s-3.73 8.32-8.32 8.32z"/></svg>
                     <div>
                       <h4 className="font-bold text-gray-800 flex items-center gap-1.5">WhatsApp HelpLine <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" /></h4>
                       <p className="text-gray-500 text-sm mt-0.5">Available 24 hours / 7 days</p>
                     </div>
                   </div>
                </a>

                <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                   <div className="flex items-center gap-4">
                     <svg className="w-10 h-10 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06 0 .13-.01.2z"/></svg>
                     <div>
                       <h4 className="font-bold text-gray-800 flex items-center gap-1.5">Telegram HelpLine <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" /></h4>
                       <p className="text-gray-500 text-sm mt-0.5">Available 24 hours / 7 days</p>
                     </div>
                   </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {currentView === "dashboard" && (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="space-y-6 bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex items-center justify-between border-b border-blue-300/50 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {i18n.dashboardTitle}
              </h2>
              {currentUser?.uid && (
                <div className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold font-mono border border-gray-200 flex items-center gap-1.5 shadow-sm max-w-full">
                  <span className="truncate">My UID: {currentUser.uid}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.uid);
                      toast("UID copied to clipboard!");
                    }}
                    className="text-gray-500 hover:text-gray-800 p-1 bg-white hover:bg-gray-50 rounded shadow-sm border border-gray-200 transition shrink-0"
                    title="Copy UID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Critical Subscription Expiry Warning Banner */}
            {(() => {
              const expiringUserSubs = userSubscriptions.filter(sub => sub.status === "active" && isSubscriptionExpiringSoon(sub.expiresAt));
              if (expiringUserSubs.length === 0) return null;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-900 px-4 py-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">⚠️</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-red-800">
                        {lang === "bn" ? "সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে!" : "Critical Expiry Alert!"}
                      </h4>
                      <p className="text-xs text-red-700 mt-0.5">
                        {lang === "bn" 
                          ? `আপনার ${expiringUserSubs.map(s => s.country).join(", ")} Gemini Pro Premium সাবস্ক্রিপশনটি আগামী ২৪ ঘন্টার মধ্যে শেষ হয়ে যাবে। রিনিউ করুন এখনই!` 
                          : `Your Gemini Pro Premium subscription for ${expiringUserSubs.map(s => s.country).join(", ")} is expiring in less than 24 hours. Please renew now to avoid service interruption.`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const firstSub = expiringUserSubs[0];
                      setGeminiCountry(firstSub.country);
                      if (firstSub.plan && firstSub.plan.startsWith("personal")) {
                        setGeminiCategory("personal");
                        setGeminiPlan("12month");
                      } else {
                        setGeminiCategory("member");
                        if (firstSub.plan === "member_1m") setGeminiPlan("1month");
                        else if (firstSub.plan === "member_3m") setGeminiPlan("3month");
                        else if (firstSub.plan === "member_6m") setGeminiPlan("6month");
                        else setGeminiPlan("12month");
                      }
                      setGeminiEmail(firstSub.geminiEmail);
                      setSelectedToolDetail("gemini");
                      setCurrentView("tools");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md border-b-2 border-red-800 shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    {lang === "bn" ? "রিনিউ করুন 🔄" : "Renew Now 🔄"}
                  </button>
                </motion.div>
              );
            })()}

            {/* Custom Premium Offer Buttons placed above Buy Telegram Accounts */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Virtual Number for Verification Card/Button */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("courses"); }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2 bg-cover bg-center">
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Instant OTP
                  </div>
                  <Hash className="w-12 h-12 text-white drop-shadow-sm animate-pulse" />
                  <div className="text-white font-bold text-xs sm:text-sm tracking-tight mt-1 uppercase">SMS VERIFICATION</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      {lang === "bn" ? "ভার্চুয়াল নাম্বার" : "Virtual Number Verification"}
                    </h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-auto">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                    <span className="truncate">{lang === "bn" ? "হোয়াটসঅ্যাপ, টেলিগ্রাম ও জিমেইল ওটিপি" : "WhatsApp, Telegram & Gmail OTP"}</span>
                  </div>
                </div>
              </motion.div>

              {/* Tools & Subscription Card/Button */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView("tools")}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2 bg-cover bg-center">
                  <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    VIP Tools
                  </div>
                  <Wrench className="w-12 h-12 text-white drop-shadow-sm" />
                  <div className="text-white font-bold text-xs sm:text-sm tracking-tight mt-1 uppercase">AUTOMATION & VIP</div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Tools & Subscription
                    </h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-auto">
                    <Wrench className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span className="truncate">Premium tools & VIP privileges</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions (Buy / Sell / Topup / Withdraw inside dashboard) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("buy"); }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="relative bg-gradient-to-br from-blue-500 to-blue-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2 bg-cover bg-center"
                  style={dashboardButtons.buy_telegram?.imageUrl ? { backgroundImage: `url(${dashboardButtons.buy_telegram.imageUrl})` } : {}}
                >
                  {!dashboardButtons.buy_telegram?.imageUrl && (
                    <>
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Hot
                      </div>
                      <svg
                        className="w-12 h-12 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.93 1.23-5.45 3.61-.51.35-.98.53-1.4.52-.46-.01-1.34-.26-1.99-.48-.8-.27-1.42-.42-1.37-.89.03-.25.38-.51 1.04-.78 4.08-1.78 6.79-2.95 8.12-3.5 3.86-1.6 4.66-1.88 5.18-1.89.11 0 .36.03.49.14.11.09.15.22.16.34-.01.07.01.21-.01.4z" />
                      </svg>
                      <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">TELEGRAM</div>
                    </>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Buy Telegram Account
                    </h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-auto">
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">130+ country available</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requireAuth(() => { setCurrentView("sell"); })}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="relative bg-gradient-to-br from-purple-500 to-purple-600 h-28 flex flex-col items-center justify-center px-4 pt-4 pb-2 bg-cover bg-center"
                  style={dashboardButtons.sell_telegram?.imageUrl ? { backgroundImage: `url(${dashboardButtons.sell_telegram.imageUrl})` } : {}}
                >
                  {!dashboardButtons.sell_telegram?.imageUrl && (
                    <>
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Maintenance
                      </div>
                      <svg
                        className="w-12 h-12 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.93 1.23-5.45 3.61-.51.35-.98.53-1.4.52-.46-.01-1.34-.26-1.99-.48-.8-.27-1.42-.42-1.37-.89.03-.25.38-.51 1.04-.78 4.08-1.78 6.79-2.95 8.12-3.5 3.86-1.6 4.66-1.88 5.18-1.89.11 0 .36.03.49.14.11.09.15.22.16.34-.01.07.01.21-.01.4z" />
                      </svg>
                      <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">TELEGRAM</div>
                    </>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Sell Telegram Account
                    </h3>
                    <div className="flex items-center text-xs text-red-500 font-bold mb-2">
                      Under Maintenance
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 gap-1.5 mt-auto">
                    <Heart className="w-3.5 h-3.5 shrink-0" />
                    <span>Coming soon</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setSmmCategory("games"); setCurrentView("smm"); }) }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group h-full"
              >
                <div 
                  className="relative bg-gradient-to-br from-orange-500 to-red-600 h-28 flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
                  style={dashboardButtons.games?.imageUrl ? { backgroundImage: `url(${dashboardButtons.games.imageUrl})` } : {}}
                >
                  {!dashboardButtons.games?.imageUrl && (
                    <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-tight mt-1 z-10 uppercase text-center">
                      Games
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">Games Service</h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-auto">Free Fire, PUBG Mobile, Mobile Legends</p>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setSmmCategory("streaming"); setCurrentView("smm"); }) }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group h-full"
              >
                <div 
                  className="relative bg-gradient-to-br from-indigo-500 to-purple-600 h-28 flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
                  style={dashboardButtons.streaming?.imageUrl ? { backgroundImage: `url(${dashboardButtons.streaming.imageUrl})` } : {}}
                >
                  {!dashboardButtons.streaming?.imageUrl && (
                    <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-tight mt-1 z-10 uppercase text-center">
                      Streaming
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">Audio & Video</h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-auto">Twitch, Kick, Spotify, SoundCloud, Audiomack, Deezer, Tidal, Vimeo</p>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setSmmCategory("social"); setCurrentView("smm"); }) }}
                className="col-span-2 bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 h-28 flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
                  style={dashboardButtons.social?.imageUrl ? { backgroundImage: `url(${dashboardButtons.social.imageUrl})` } : {}}
                >
                  <div className="absolute top-2 left-2 flex gap-1 z-10">
                    <span className="bg-green-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">Fast</span>
                    <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">Cheap</span>
                  </div>
                  {!dashboardButtons.social?.imageUrl && (
                    <>
                      <div className="flex gap-3 text-white mb-1 items-center z-10 mt-2">
                        <Facebook className="w-6 h-6 sm:w-8 sm:h-8 opacity-95 drop-shadow-md" />
                        <Youtube className="w-7 h-7 sm:w-9 sm:h-9 opacity-95 drop-shadow-md" />
                        <Instagram className="w-6 h-6 sm:w-8 sm:h-8 opacity-95 drop-shadow-md" />
                      </div>
                      <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-tight mt-1 z-10 uppercase text-center">
                        Social Media & Messaging Service
                      </div>
                      {/* Decorative background icons */}
                      <Twitter className="absolute -right-4 -top-4 w-20 h-20 text-white opacity-10 pointer-events-none" />
                      <Globe className="absolute -left-4 -bottom-4 w-20 h-20 text-white opacity-10 pointer-events-none" />
                    </>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      Social Media & Messaging Service
                    </h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5 mt-auto">
                    <Heart className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                    <span className="truncate">FB, IG, TikTok, YT, X, Telegram, WhatsApp...</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setSmmCategory("regional"); setCurrentView("smm"); }) }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group h-full"
              >
                <div 
                  className="relative bg-gradient-to-br from-pink-500 to-rose-600 h-28 flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
                  style={dashboardButtons.regional?.imageUrl ? { backgroundImage: `url(${dashboardButtons.regional.imageUrl})` } : {}}
                >
                  {!dashboardButtons.regional?.imageUrl && (
                    <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-tight mt-1 z-10 uppercase text-center">
                      Regional
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">Regional & Short Video</h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-auto">Kwai, Likee, VK, OK.ru, Lemon 8, Coub</p>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => { (window as any).triggerAdClick?.(); setSmmCategory("ecommerce"); setCurrentView("smm"); }) }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group h-full"
              >
                <div 
                  className="relative bg-gradient-to-br from-emerald-500 to-teal-600 h-28 flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
                  style={dashboardButtons.ecommerce?.imageUrl ? { backgroundImage: `url(${dashboardButtons.ecommerce.imageUrl})` } : {}}
                >
                  {!dashboardButtons.ecommerce?.imageUrl && (
                    <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-tight mt-1 z-10 uppercase text-center">
                      Web Traffic & E-commerce
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">Web Traffic & E-commerce</h3>
                    <div className="flex items-center gap-0.5 mb-2">
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                      <span className="text-amber-400 text-xs sm:text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-auto">Shopee, Lazada, Google Reviews, Website Traffic, Yandex, Reverbnation</p>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => setTopupModal(true)); }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 h-28 flex flex-col items-center justify-center p-4 bg-cover bg-center"
                  style={dashboardButtons.topup?.imageUrl ? { backgroundImage: `url(${dashboardButtons.topup.imageUrl})` } : {}}
                >
                  {!dashboardButtons.topup?.imageUrl && (
                    <>
                      <div className="relative mb-1 text-white">
                        <Wallet className="w-12 h-12 text-white/90" />
                        <div className="absolute -bottom-1 -left-1 bg-white rounded-full text-indigo-700 p-0.5">
                          <Plus className="w-5 h-5 flex-shrink-0 stroke-[4]" />
                        </div>
                      </div>
                      <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">FUNDS</div>
                    </>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-center text-center">
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base leading-tight">
                    {i18n.topupBtn}
                  </h3>
                  <div className="text-xs text-gray-500">
                    Add money to wallet
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { requireAuth(() => setWithdrawModal(true)); }}
                className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100/80 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col group"
              >
                <div 
                  className="relative bg-gradient-to-br from-teal-500 to-emerald-600 h-28 flex flex-col items-center justify-center p-4 bg-cover bg-center"
                  style={dashboardButtons.withdraw?.imageUrl ? { backgroundImage: `url(${dashboardButtons.withdraw.imageUrl})` } : {}}
                >
                  {!dashboardButtons.withdraw?.imageUrl && (
                    <>
                      <div className="relative mb-1 text-white">
                        <CircleDollarSign className="w-12 h-12 text-white/90" />
                      </div>
                      <div className="text-white font-bold text-lg leading-tight tracking-tight mt-1">CASH OUT</div>
                    </>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-center text-center">
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base leading-tight">
                    {i18n.withdrawBtn}
                  </h3>
                  <div className="text-xs text-gray-500">
                    Withdraw earnings
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Animated Special Offer Ad Section */}
            <AnimatePresence>
              {showSpecialOfferAd && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 30 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden border-2 border-yellow-300 group">
                    {/* Floating elements & light effects */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[shimmer_2s_linear_infinite] opacity-20 pointer-events-none" />
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl pointer-events-none" />

                    {/* Close Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowSpecialOfferAd(false); }}
                      className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition cursor-pointer z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="relative z-10 max-w-xl mx-auto space-y-4">
                      {/* Flashing Title Badge */}
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block bg-yellow-300 text-red-700 text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-yellow-400"
                      >
                        🔥 SPECIAL OFFER 🔥
                      </motion.div>

                      {/* Main Heading */}
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                        UP TO 79% OFF! 🎉
                      </h3>

                      {/* Supporting copy */}
                      <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed drop-shadow-sm">
                        Boost your business & get insane discounts on Advertising! 🚀 Hurry up, this is a LIMITED TIME EVENT! ⏰
                      </p>

                      {/* Animated CTA Button */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="pt-2"
                      >
                        <button
                          onClick={() => {
                            setCurrentView("courses");
                            setSelectedCourseCat("all");
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-white text-red-600 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-b-4 border-gray-200 uppercase tracking-wider"
                        >
                          <span>👉 CLICK HERE TO CLAIM 👈</span>
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Invite & Earn Banner */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => requireAuth(() => { setCurrentView("profile"); })}
              className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group mb-6 mt-4 md:mt-0"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    Invite & Earn
                  </h3>
                  <p className="text-orange-50 font-medium">
                    Refer friends and earn rewards when they top up.
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition shadow-inner">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute right-[-5%] top-[-50%] w-48 h-48 bg-white/10 rounded-full blur-3xl outline-none"></div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-[#2AABEE] to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    {i18n.availBal}
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    <span className={`inline-block transition-all duration-300 ${balanceAnimate ? 'scale-110 text-yellow-300' : ''}`}>
                      ${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}
                    </span>{" "}
                    <span className="text-xl font-normal text-blue-200">
                      USD
                    </span>
                  </h3>
                </div>
                <Wallet className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-blue-400 opacity-20" />
              </div>

              {/* Top-up Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {i18n.addFundsTitle}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {i18n.addFundsSub}
                  </p>
                  <div className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg inline-block mb-1">
                    {i18n.rateLbl} {TOPUP_RATE} BDT
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Crypto & Binance: 1 USD = 1 USDT
                  </p>
                </div>
                <button
                  onClick={() => { requireAuth(() => setTopupModal(true)); }}
                  className="w-full bg-[#2AABEE] hover:bg-[#2299d6] text-white py-2.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(42,171,238,0.39)] hover:shadow-[0_6px_20px_rgba(42,171,238,0.23)] active:scale-[0.98] transition-all"
                >
                  {i18n.topupBtn}
                </button>
              </div>

              {/* Withdraw Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {i18n.withdrawFundsTitle}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {i18n.withdrawFundsSub}
                  </p>
                  <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg inline-block mb-1">
                    {i18n.rateLbl} {WITHDRAW_RATE} BDT
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    BSC-USDT / Binance: 1 USD = 1 USDT
                  </p>
                </div>
                <button
                  onClick={() => { requireAuth(() => setWithdrawModal(true)); }}
                  className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-700 transition shadow-sm"
                >
                  {i18n.withdrawBtn}
                </button>
              </div>
            </motion.div>

            {/* Why Choose Us / Value Proposition */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500 transition-colors">
                  <Timer className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Instant Processing
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Transactions are handled automatically in real-time, 24/7.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Secure Vault
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your funds are protected with multiple layers of enterprise
                  security.
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 text-center shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500 transition-colors">
                  <Headphones className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 text-sm">
                  Always Here
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dedicated support via Telegram or Help Desk whenever needed.
                </p>
              </div>
            </motion.div>
            {/* Contact Support Section */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="mt-8 pb-10">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Contact Us</h2>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <svg className="w-6 h-6 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06 0 .13-.01.2z"/></svg>
                  <span className="font-bold text-gray-700">Telegram</span>
                </a>
                <a href="https://wa.me/8801644627304" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 13.5v-.01c-.13-.06-1.14-.56-1.32-.63-.18-.06-.31-.1-.44.1-.14.19-.5.63-.61.76-.11.13-.23.14-.36.08-.13-.06-.82-.3-1.56-.96-.58-.51-.97-1.14-1.08-1.32-.12-.19 0-.29.07-.38.06-.06.13-.15.2-.23.06-.07.08-.13.13-.21.04-.08.02-.16-.01-.22-.04-.06-.44-1.06-.61-1.46-.16-.39-.32-.34-.44-.34h-.38c-.13 0-.34.05-.51.24s-.68.66-.68 1.62c0 .96.69 1.88.79 2.01.1.13 1.37 2.09 3.31 2.93 1.65.71 2.14.77 2.92.65.65-.1 1.43-.59 1.63-1.16.2-.56.2-.1.14-.11z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.55 3.76 1.48 5.3L2 22l4.89-1.28A9.957 9.957 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM12 20.31c-1.63 0-3.19-.43-4.52-1.22l-.32-.18-3.37.88.9-3.28-.2-.33a8.307 8.307 0 01-1.28-4.45c0-4.59 3.73-8.32 8.32-8.32 4.59 0 8.32 3.73 8.32 8.32s-3.73 8.32-8.32 8.32z"/></svg>
                  <span className="font-bold text-gray-700">WhatsApp</span>
                </a>
              </div>

              <div className="space-y-4">
                <a href="https://wa.me/8801644627304" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                   <div className="flex items-center gap-4">
                     <svg className="w-10 h-10 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 13.5v-.01c-.13-.06-1.14-.56-1.32-.63-.18-.06-.31-.1-.44.1-.14.19-.5.63-.61.76-.11.13-.23.14-.36.08-.13-.06-.82-.3-1.56-.96-.58-.51-.97-1.14-1.08-1.32-.12-.19 0-.29.07-.38.06-.06.13-.15.2-.23.06-.07.08-.13.13-.21.04-.08.02-.16-.01-.22-.04-.06-.44-1.06-.61-1.46-.16-.39-.32-.34-.44-.34h-.38c-.13 0-.34.05-.51.24s-.68.66-.68 1.62c0 .96.69 1.88.79 2.01.1.13 1.37 2.09 3.31 2.93 1.65.71 2.14.77 2.92.65.65-.1 1.43-.59 1.63-1.16.2-.56.2-.1.14-.11z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.55 3.76 1.48 5.3L2 22l4.89-1.28A9.957 9.957 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zM12 20.31c-1.63 0-3.19-.43-4.52-1.22l-.32-.18-3.37.88.9-3.28-.2-.33a8.307 8.307 0 01-1.28-4.45c0-4.59 3.73-8.32 8.32-8.32 4.59 0 8.32 3.73 8.32 8.32s-3.73 8.32-8.32 8.32z"/></svg>
                     <div>
                       <h4 className="font-bold text-gray-800 flex items-center gap-1.5">WhatsApp HelpLine <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" /></h4>
                       <p className="text-gray-500 text-sm mt-0.5">Available 24 hours / 7 days</p>
                     </div>
                   </div>
                </a>

                <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                   <div className="flex items-center gap-4">
                     <svg className="w-10 h-10 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06 0 .13-.01.2z"/></svg>
                     <div>
                       <h4 className="font-bold text-gray-800 flex items-center gap-1.5">Telegram HelpLine <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" /></h4>
                       <p className="text-gray-500 text-sm mt-0.5">Available 24 hours / 7 days</p>
                     </div>
                   </div>
                </a>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* ADMIN VIEW */}
        {currentView === "admin" && (
          <div className="space-y-6 bg-gradient-to-br from-sky-100 to-indigo-200 p-4 sm:p-6 rounded-2xl border border-blue-200/50 shadow-md">
            <div className="bg-red-50 p-4 sm:p-6 rounded-xl border border-red-100 text-red-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  {i18n.adminPanelTitle}
                </h2>
                <p className="opacity-80">{i18n.adminPanelSub}</p>
              </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-gray-200">
              {[
                { id: "overview", label: "Overview" },
                { id: "orders", label: "User Orders 🛒" },
                { id: "tickets", label: "Live Chat 💬", badge: adminUnreadTickets > 0 ? adminUnreadTickets : undefined },
                { id: "topups", label: "Top Ups" },
                { id: "withdrawals", label: "Withdrawals" },
                { id: "failed", label: "Failed" },
                { id: "users", label: "Users" },
                { id: "services", label: "Services" },
                { id: "courses", label: "Manage Courses" },
                { id: "subscriptions", label: "Gemini Subscriptions" },
                { id: "settings", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setAdminTab(tab.id as any); setAdminSubTab("pending"); }}
                  className={`px-4 py-2 font-bold text-sm whitespace-nowrap rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
                    adminTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {adminTab === "settings" && (
              <>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-500" /> Advertisement Banners
                  </h3>
              <div className="flex flex-col gap-6">
                {/* Banner List */}
                <div className="space-y-4">
                  {adminBannerSettings.banners.map((banner, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative bg-gray-50">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => {
                            const newBanners = [...adminBannerSettings.banners];
                            newBanners.splice(index, 1);
                            setAdminBannerSettings({ ...adminBannerSettings, banners: newBanners });
                          }}
                          className="text-red-500 hover:text-red-700 bg-white border border-red-200 p-1 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {banner.imageUrl ? (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Banner {index + 1} Image Preview:</p>
                          <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="max-h-32 rounded-lg border border-gray-200 object-cover" />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner {index + 1} Image (Max 500KB)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 500000) {
                                  toast("Image is too large. Please upload an image smaller than 500KB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newBanners = [...adminBannerSettings.banners];
                                  newBanners[index].imageUrl = reader.result as string;
                                  setAdminBannerSettings({...adminBannerSettings, banners: newBanners});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE] bg-white text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Link URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com/promotion"
                          value={banner.linkUrl}
                          onChange={(e) => {
                            const newBanners = [...adminBannerSettings.banners];
                            newBanners[index].linkUrl = e.target.value;
                            setAdminBannerSettings({...adminBannerSettings, banners: newBanners});
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE] bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setAdminBannerSettings({
                      ...adminBannerSettings,
                      banners: [...adminBannerSettings.banners, { imageUrl: "", linkUrl: "" }]
                    });
                  }}
                  className="w-full md:w-auto self-start border border-[#2AABEE] text-[#2AABEE] px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Banner
                </button>

                <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
                  <input
                    type="checkbox"
                    id="bannerActive"
                    checked={adminBannerSettings.isActive}
                    onChange={(e) => setAdminBannerSettings({...adminBannerSettings, isActive: e.target.checked})}
                    className="w-4 h-4 text-[#2AABEE] rounded focus:ring-[#2AABEE]"
                  />
                  <label htmlFor="bannerActive" className="text-sm font-bold text-gray-800 cursor-pointer">
                    Enable Banners on Application
                  </label>
                </div>
                <button
                  disabled={isPublishingBanner}
                  onClick={async () => {
                    setIsPublishingBanner(true);
                    try {
                      // Remove empty banners
                      const cleanBanners = adminBannerSettings.banners.filter(b => b.imageUrl.trim() !== "");
                      
                      const finalConfig = {
                        ...adminBannerSettings,
                        banners: cleanBanners,
                      };
                      
                      setAdminBannerSettings({...adminBannerSettings, banners: cleanBanners}); // Update local state
                      
                      await setDoc(doc(db, "settings", "banner"), finalConfig);
                      toast("Banner settings updated successfully! It is now live.");
                    } catch (e: any) {
                      toast("Error updating banner: " + e.message);
                    } finally {
                      setIsPublishingBanner(false);
                    }
                  }}
                  className={`w-full md:w-auto self-start bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition shadow-sm ${isPublishingBanner ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-600"}`}
                >
                  {isPublishingBanner ? "Publishing..." : "Publish Banners"}
                </button>
              </div>
            </div>

            {/* Binance Settings Tool */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 fill-current text-[#f0b90b]" viewBox="-52.785 -88 457.47 528"><path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/></svg>
                Binance Pay Settings
              </h3>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Binance Pay ID</label>
                  <input
                    type="text"
                    value={adminBinanceConfig.id}
                    onChange={(e) => setAdminBinanceConfig({...adminBinanceConfig, id: e.target.value})}
                    placeholder="Enter Binance Pay ID..."
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#f0b90b]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Custom QR Code Image (Optional)</label>
                  <p className="text-xs text-gray-500 mb-2">If left blank, App will generate an auto-QR code using the ID above. But you can upload a screenshot of your Binance QR logic to override.</p>
                  
                  {adminBinanceConfig.qrUrl && (
                    <div className="relative inline-block border border-gray-200 rounded-lg p-2 mb-3 bg-gray-50">
                      <img src={adminBinanceConfig.qrUrl} alt="Binance Config QR" className="max-w-[150px] aspect-square object-contain" />
                      <button
                        onClick={() => setAdminBinanceConfig({...adminBinanceConfig, qrUrl: ""})}
                        className="absolute -top-3 -right-3 text-red-500 bg-white border border-red-200 rounded-full p-2 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 1000000) {
                          toast("Image is too large. Limit is 1MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                           setAdminBinanceConfig({...adminBinanceConfig, qrUrl: reader.result as string});
                        }
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#f0b90b] text-sm"
                  />
                </div>

                <button
                  disabled={isPublishingBinance}
                  onClick={async () => {
                    setIsPublishingBinance(true);
                    try {
                      await setDoc(doc(db, "settings", "binance"), adminBinanceConfig);
                      toast("Binance Pay settings saved!");
                    } catch(err: any) {
                      toast("Failed to save: " + err.message);
                    } finally {
                      setIsPublishingBinance(false);
                    }
                  }}
                  className={`w-full md:w-auto self-start bg-[#f0b90b] text-gray-900 px-6 py-2.5 rounded-lg font-bold transition shadow hover:bg-[#d6a507] ${isPublishingBinance ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isPublishingBinance ? "Saving..." : "Save Binance Settings"}
                </button>
              </div>
            </div>

            <AdminDashboardButtons />

            <AdminApiKeys />
            </>
            )}

            {adminTab === "users" && (
            <>
            <AdminUserManagement />

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#2AABEE]" /> Add Balance to User
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="User ID (UID)"
                  value={adminAddBalanceUid}
                  onChange={(e) => setAdminAddBalanceUid(e.target.value)}
                  className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                />
                <input
                  type="number"
                  placeholder="Amount (USD)"
                  value={adminAddBalanceAmount}
                  onChange={(e) =>
                    setAdminAddBalanceAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full md:w-1/4 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                />
                <button
                  onClick={handleAdminAddBalance}
                  className="w-full md:w-1/4 bg-[#2AABEE] text-white py-2 rounded-lg font-bold hover:bg-blue-500 transition shadow-sm"
                >
                  Add Balance
                </button>
              </div>
            </div>
            </>
            )}

            {adminTab === "tickets" && (
              <AdminTickets />
            )}

            {adminTab === "services" && (
            <>
            <AdminChildPanel />

            <AdminSMMPricing socialMarkupPercent={socialMarkupPercent} />
            </>
            )}

            {adminTab === "overview" && (
              <>
                <AdminDataOverview />
                
                {/* Active Users Analytics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Live Users
                    </div>
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      {activeUsersStats.live}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Daily Active
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {activeUsersStats.daily}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Weekly Active
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {activeUsersStats.weekly}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Monthly Active
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {activeUsersStats.monthly}
                    </div>
                  </div>
                </div>

                {/* Financial Stats Analytics */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Daily Top Up / Withdraw
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">+${adminTxStats.topupDaily.toFixed(2)}</span>
                      <span className="text-sm font-bold text-orange-500">-${adminTxStats.withdrawDaily.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Weekly Top Up / Withdraw
                    </div>
                     <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">+${adminTxStats.topupWeekly.toFixed(2)}</span>
                      <span className="text-sm font-bold text-orange-500">-${adminTxStats.withdrawWeekly.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-sm text-gray-500 font-medium mb-1">
                      Monthly Top Up / Withdraw
                    </div>
                     <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">+${adminTxStats.topupMonthly.toFixed(2)}</span>
                      <span className="text-sm font-bold text-orange-500">-${adminTxStats.withdrawMonthly.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {adminTab === "orders" && (
              <AdminOrdersManagement adminTxs={adminTxs} />
            )}

            {(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Search transactions by ID, UID, or Email..." 
                  value={adminSearchTxId}
                  onChange={(e) => setAdminSearchTxId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                />
              </div>
            )}

            {(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="flex gap-2 mb-4 bg-gray-100 p-1.5 rounded-xl w-full max-w-[400px]">
                <button
                  onClick={() => setAdminSubTab("pending")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${adminSubTab === "pending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Pending {adminTab === "topups" ? "Top Ups" : "Withdrawals"}
                </button>
                <button
                  onClick={() => setAdminSubTab("paid")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${adminSubTab === "paid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Paid History
                </button>
              </div>
            )}

            {(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Pending Transactions Management */}
                {adminSubTab === "pending" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-gray-800">Pending {adminTab === "topups" ? "Top Ups" : "Withdrawals"}</h3>
                  </div>
                  <div className="divide-y divide-gray-100 overflow-y-auto flex-1 h-full min-h-0">
                  {adminTxs
                    .filter((tx) => tx.status === "pending" && (adminTab === "topups" ? (tx.type === "topup" && tx.details?.method === "binance_manual") : tx.type === "withdraw"))
                    .filter((tx) => 
                       !adminSearchTxId || 
                       tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userNumericId?.toString().includes(adminSearchTxId) ||
                       tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                    )
                    .length === 0 ? (
                    <div className="p-4 text-center text-gray-500 italic">
                      No pending {adminTab === "topups" ? "top ups" : "withdrawals"} found
                    </div>
                  ) : (
                    adminTxs
                      .filter((tx) => tx.status === "pending" && (adminTab === "topups" ? (tx.type === "topup" && tx.details?.method === "binance_manual") : tx.type === "withdraw"))
                      .filter((tx) => 
                       !adminSearchTxId || 
                       tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userNumericId?.toString().includes(adminSearchTxId) ||
                       tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                    )
                    .map((adminTx) => (
                      <div
                        key={`admin-pending-${adminTx.id}`}
                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white uppercase ${adminTx.type === 'topup' ? 'bg-blue-500' : 'bg-orange-500'}`}>{adminTx.type}</span>
                            <span className="text-gray-500">Req:</span> ${adminTx.amountUSD.toFixed(2)} USD
                            {adminTx.type === 'withdraw' && (
                              <span className="text-base font-black text-green-600 block sm:inline sm:ml-4 bg-green-50 px-2 py-1 rounded inline-block mt-1 sm:mt-0">
                                Payout:{" "}
                                {adminTx.details?.method === "Binance" ||
                                adminTx.details?.method === "BSC-USDT" ||
                                adminTx.details?.method === "crypto"
                                  ? `$${(adminTx.details?.payoutUsd || adminTx.amountUSD).toFixed(2)}`
                                  : `${(adminTx.details?.payoutBdt || adminTx.amountUSD * WITHDRAW_RATE).toLocaleString()} BDT`}
                              </span>
                            )}
                          </p>
                          {adminTx.details && (
                            <div className="flex gap-2 items-center mt-1">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase transition">
                                {adminTx.details.method}
                              </span>
                              <span 
                                onClick={() => {
                                  const textToCopy = adminTx.details?.account || adminTx.details?.orderId;
                                  if(textToCopy) {
                                      navigator.clipboard.writeText(textToCopy);
                                      toast("Copied to clipboard: " + textToCopy);
                                  }
                                }}
                                className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                                title="Click to copy account details"
                              >
                                {adminTx.details.account || adminTx.details.orderId}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            <span 
                              className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-200 transition"
                              title="Click to copy Transaction ID"
                              onClick={() => {
                                if (adminTx.id) {
                                  navigator.clipboard.writeText(adminTx.id);
                                  toast("Transaction ID copied: " + adminTx.id);
                                }
                              }}
                            >
                              ID: {adminTx.id}
                            </span>
                            <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">
                              {adminTx.userNumericId
                                ? `UID: ${adminTx.userNumericId}`
                                : "UID: N/A"}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {adminTx.userEmail ||
                                adminTx.userId.slice(0, 8) + "..."}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold leading-none flex items-center gap-1 border border-orange-200">
                              <Timer className="w-3 h-3" />
                              Wait: {getTimeElapsedString(adminTx.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={async () => {
                              try {
                                if (adminTx.type === "topup" && adminTx.status !== "paid") {
                                  // Credit balance to user
                                  const targetUserRef = doc(db, "users", adminTx.userId);
                                  const targetUserDoc = await getDoc(targetUserRef);
                                  if (targetUserDoc.exists()) {
                                    await updateDoc(targetUserRef, {
                                      balanceUSD: increment(adminTx.amountUSD),
                                      total_deposited: increment(adminTx.amountUSD),
                                      last_update: Date.now()
                                    });

                                    // Referral Bonus logic
                                    const referredBy = targetUserDoc.data().referredBy;
                                    if (referredBy) {
                                      try {
                                        const referrerRef = doc(db, "users", referredBy);
                                        const referrerDoc = await getDoc(referrerRef);
                                        if (referrerDoc.exists()) {
                                          const bonusAmount = adminTx.amountUSD * 0.01;
                                          await updateDoc(referrerRef, {
                                            balanceUSD: increment(bonusAmount),
                                            total_deposited: increment(bonusAmount),
                                            referralEarnings: increment(bonusAmount),
                                            last_update: Date.now()
                                          });
                                          const refTxRef = doc(collection(db, "transactions"));
                                          await setDoc(refTxRef, {
                                            userId: referredBy,
                                            type: "referral_bonus",
                                            txType: "Credit",
                                            amountUSD: bonusAmount,
                                            status: "paid",
                                            details: { fromUserId: targetUserDoc.id },
                                            createdAt: Date.now(),
                                          });
                                        }
                                      } catch (e) {
                                        console.error("Error processing referral bonus", e);
                                      }
                                    }
                                  }
                                }
                                
                                if (adminTx.status !== "paid") {
                                    await updateDoc(
                                        doc(db, "transactions", adminTx.id),
                                        { status: "paid" },
                                    );
                                    toast("Marked as paid");
                                } else {
                                    toast("Already paid");
                                }
                              } catch(err) {
                                console.error(err);
                                toast("Error marking as paid");
                              }
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition shadow-sm w-full sm:w-auto"
                          >
                            Mark as Paid
                          </button>
                          <button
                            onClick={async () => {
                              askConfirmation(
                                "Are you sure you want to reject this request?",
                                async () => {
                                  try {
                                    if (adminTx.type === "withdraw") {
                                      // refund balance
                                      await updateDoc(doc(db, "users", adminTx.userId), {
                                        balanceUSD: increment(adminTx.amountUSD),
                                        total_spent: increment(-adminTx.amountUSD)
                                      });
                                    }
                                    await updateDoc(doc(db, "transactions", adminTx.id), {
                                      status: "rejected"
                                    });
                                    toast("Transaction rejected successfully");
                                  } catch (e) {
                                    console.error(e);
                                    toast("Error rejecting transaction");
                                  }
                                }
                              );
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition shadow-sm w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
              </div>
              )}
              
              {adminTab === "topups" && adminSubTab === "paid" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                    <h3 className="font-bold text-gray-800">
                      Paid Topups History
                    </h3>
                  </div>
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1 h-full min-h-0">
                {adminTxs
                  .filter((tx) => (tx.status === "paid" || tx.status === "completed" || tx.status === "success") && tx.type === "topup")
                  .filter((tx) => 
                     !adminSearchTxId || 
                     tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                     tx.userNumericId?.toString().includes(adminSearchTxId) ||
                     tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                     tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                  )
                  .length === 0 ? (
                  <div className="p-4 text-center text-gray-500 italic">
                    No paid topups found
                  </div>
                ) : (
                  adminTxs
                    .filter((tx) => (tx.status === "paid" || tx.status === "completed" || tx.status === "success") && tx.type === "topup")
                    .filter((tx) => 
                       !adminSearchTxId || 
                       tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userNumericId?.toString().includes(adminSearchTxId) ||
                       tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                    )
                    .map((adminTx) => (
                      <div
                        key={`admin-paid-topup-${adminTx.id}`}
                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      >
                        <div>
                          <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white uppercase bg-blue-500`}>{adminTx.type}</span>
                            <span className="text-gray-500">Req:</span> ${adminTx.amountUSD.toFixed(2)} USD
                          </p>
                          {adminTx.details && (
                            <div className="flex gap-2 items-center mt-1">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase transition">
                                {adminTx.details.method}
                              </span>
                              <span 
                                onClick={() => {
                                  const textToCopy = adminTx.details?.account || adminTx.details?.orderId;
                                  if(textToCopy) {
                                      navigator.clipboard.writeText(textToCopy);
                                      toast("Copied to clipboard: " + textToCopy);
                                  }
                                }}
                                className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                                title="Click to copy account details"
                              >
                                {adminTx.details.account || adminTx.details.orderId}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            <span 
                              className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                              title="Click to copy Transaction ID"
                              onClick={() => {
                                if (adminTx.id) {
                                  navigator.clipboard.writeText(adminTx.id);
                                  toast("Transaction ID copied: " + adminTx.id);
                                }
                              }}
                            >
                              ID: {adminTx.id}
                            </span>
                            <span className="font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-xs">
                              {adminTx.userNumericId
                                ? `UID: ${adminTx.userNumericId}`
                                : "UID: N/A"}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {adminTx.userEmail ||
                                adminTx.userId.slice(0, 8) + "..."}
                            </span>
                            <span className="text-xs text-gray-400">
                              Created:{" "}
                              {new Date(adminTx.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
              </div>
              )}

              {adminTab === "withdrawals" && adminSubTab === "paid" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                    <h3 className="font-bold text-gray-800">
                      Paid Withdrawals History
                    </h3>
                  </div>
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1 h-full min-h-0">
                {adminTxs
                  .filter((tx) => (tx.status === "paid" || tx.status === "success" || tx.status === "completed") && tx.type === "withdraw")
                  .filter((tx) => 
                     !adminSearchTxId || 
                     tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                     tx.userNumericId?.toString().includes(adminSearchTxId) ||
                     tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                     tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                  )
                  .length === 0 ? (
                  <div className="p-4 text-center text-gray-500 italic">
                    No paid withdrawals found
                  </div>
                ) : (
                  adminTxs
                    .filter((tx) => (tx.status === "paid" || tx.status === "success" || tx.status === "completed") && tx.type === "withdraw")
                    .filter((tx) => 
                       !adminSearchTxId || 
                       tx.id?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userNumericId?.toString().includes(adminSearchTxId) ||
                       tx.userId?.toLowerCase().includes(adminSearchTxId.toLowerCase()) ||
                       tx.userEmail?.toLowerCase().includes(adminSearchTxId.toLowerCase())
                    )
                    .map((adminTx) => (
                      <div
                        key={`admin-paid-withdraw-${adminTx.id}`}
                        className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      >
                        <div>
                          <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white uppercase ${adminTx.type === 'topup' ? 'bg-blue-500' : 'bg-orange-500'}`}>{adminTx.type}</span>
                            <span className="text-gray-500">Req:</span> ${adminTx.amountUSD.toFixed(2)} USD
                            {adminTx.type === 'withdraw' && (
                              <span className="text-base font-black text-green-600 block sm:inline sm:ml-4 bg-green-50 px-2 py-1 rounded inline-block mt-1 sm:mt-0">
                                Payout:{" "}
                                {adminTx.details?.method === "Binance" ||
                                adminTx.details?.method === "BSC-USDT" ||
                                adminTx.details?.method === "crypto"
                                  ? `$${(adminTx.details?.payoutUsd || adminTx.amountUSD).toFixed(2)}`
                                  : `${(adminTx.details?.payoutBdt || adminTx.amountUSD * WITHDRAW_RATE).toLocaleString()} BDT`}
                              </span>
                            )}
                          </p>
                          {adminTx.details && (
                            <div className="flex gap-2 items-center mt-1">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase transition">
                                {adminTx.details.method}
                              </span>
                              <span 
                                onClick={() => {
                                  const textToCopy = adminTx.details?.account || adminTx.details?.orderId;
                                  if(textToCopy) {
                                      navigator.clipboard.writeText(textToCopy);
                                      toast("Copied to clipboard: " + textToCopy);
                                  }
                                }}
                                className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                                title="Click to copy account details"
                              >
                                {adminTx.details.account || adminTx.details.orderId}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            <span 
                              className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                              title="Click to copy Transaction ID"
                              onClick={() => {
                                if (adminTx.id) {
                                  navigator.clipboard.writeText(adminTx.id);
                                  toast("Transaction ID copied: " + adminTx.id);
                                }
                              }}
                            >
                              ID: {adminTx.id}
                            </span>
                            <span className="font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-xs">
                              {adminTx.userNumericId
                                ? `UID: ${adminTx.userNumericId}`
                                : "UID: N/A"}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {adminTx.userEmail ||
                                adminTx.userId.slice(0, 8) + "..."}
                            </span>
                            <span className="text-xs text-gray-400">
                              Created:{" "}
                              {new Date(adminTx.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
            )}
            
            {/* End of Transactions 3-Column Grid */}
            </div>
            )}

            {adminTab === "failed" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px] mb-6 mt-6">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-800">
                    Failed & Canceled Transactions
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 overflow-y-auto flex-1 h-full min-h-0">
                {adminTxs
                  .filter((tx) => tx.status === "failed" || tx.status === "canceled" || tx.status === "rejected" || tx.status === "cancelled")
                  .length === 0 ? (
                  <div className="p-4 text-center text-gray-500 italic">
                    No failed or canceled transactions found
                  </div>
                ) : (
                  adminTxs
                    .filter((tx) => tx.status === "failed" || tx.status === "canceled" || tx.status === "rejected" || tx.status === "cancelled")
                    .map((adminTx) => (
                    <div
                      key={`admin-failed-${adminTx.id}`}
                      className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white uppercase bg-red-500`}>{adminTx.type}</span>
                          <span className="text-gray-500">Req:</span> ${adminTx.amountUSD?.toFixed(2) || 0} USD
                        </p>
                        {adminTx.details && (
                          <div className="flex gap-2 items-center mt-1">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase transition">
                              {adminTx.details.method || adminTx.details.provider || "N/A"}
                            </span>
                            <span 
                              onClick={() => {
                                const textToCopy = adminTx.details?.account || adminTx.details?.orderId || "N/A";
                                if(textToCopy && textToCopy !== "N/A") {
                                    navigator.clipboard.writeText(textToCopy);
                                    toast("Copied to clipboard: " + textToCopy);
                                }
                              }}
                              className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                              title="Click to copy account details"
                            >
                              {adminTx.details.account || adminTx.details.orderId || "N/A"}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 items-center mt-3">
                          <span 
                            className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                            title="Click to copy Transaction ID"
                            onClick={() => {
                              if (adminTx.id) {
                                navigator.clipboard.writeText(adminTx.id);
                                toast("Transaction ID copied: " + adminTx.id);
                              }
                            }}
                          >
                            ID: {adminTx.id}
                          </span>
                          <span className="font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-xs">
                            {adminTx.userNumericId
                              ? `UID: ${adminTx.userNumericId}`
                              : "UID: N/A"}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {adminTx.userEmail ||
                              adminTx.userId?.slice(0, 8) + "..."}
                          </span>
                          <span className="text-xs text-gray-400">
                            Updated:{" "}
                            {new Date(adminTx.updatedAt || adminTx.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 capitalize">
                          {adminTx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

            {adminTab === "settings" && (
              <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Markup Settings
              </h3>
              <div className="flex flex-col gap-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram Accounts Markup (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Services Markup (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={socialMarkupPercent}
                    onChange={(e) => setSocialMarkupPercent(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <button 
                  onClick={async () => {
                     try {
                        await setDoc(doc(db, "settings", "markup"), { telegram: markupPercent, social: socialMarkupPercent });
                        toast("Settings saved!");
                     } catch(err) {
                        toast("Failed to save.");
                     }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  {i18n.saveBtn}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">{i18n.markupHelp}</p>
            </div>
            </>
            )}

            {adminTab === "services" && (
            <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-800">
                  {i18n.botStatusTitle}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colCountry}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colCode}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colStock}
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        {i18n.colBase}
                      </th>
                      <th className="px-4 py-3 font-medium text-red-600 font-bold">
                        {i18n.colWeb} (+{markupPercent}%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {countries.map((c, idx) => (
                      <tr key={`${c.id || "c"}-${idx}`} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {c.flag || getFlag(c.country, c.code)} {c.country}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.code}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${c.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {c.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          ${c.basePrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          $
                          {(
                            c.basePrice +
                            (c.basePrice * markupPercent) / 100
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {i18n.autoSellTitle}
              </h3>
              <p className="text-gray-600 mb-4">{i18n.autoSellSub}</p>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm text-gray-500 border border-gray-200">
                status: offline
                <br />
                endpoint: /api/seller/sync
                <br />
                connected_nodes: 0
              </div>
            </div>
            </>
            )}

            {adminTab === "courses" && (
              <div className="space-y-6">
                {/* Header & Add Button */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      📚 Course & Product Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add, edit, delete courses or update pricing, old price, discounts, features, and cover images.
                    </p>
                  </div>
                  {!adminEditingCourse && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleBulkAiGenerateProductDetails}
                        disabled={bulkGenerating}
                        className="bg-gradient-to-r from-blue-600 to-[#2AABEE] text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 cursor-pointer"
                      >
                        {bulkGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>✨ Bulk AI Generate All Descriptions</span>
                      </button>

                      <button
                        onClick={() => {
                          setAdminEditingCourse("new");
                          setAdminCourseForm({
                            id: "",
                            category: "Language & Skills",
                            title: "",
                            description: "",
                            oldPrice: 1000,
                            price: 150,
                            rating: 5,
                            badge: "Hot Offer",
                            featuresString: "",
                            imageUrl: ""
                          });
                        }}
                        className="bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-sm text-sm cursor-pointer"
                      >
                        <span>➕ Add New Product</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Progress Banner */}
                {bulkGenerating && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 w-full sm:w-auto">
                      <h4 className="font-extrabold text-blue-900 text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        Bulk Generating AI Descriptions... ({bulkProgress.current} / {bulkProgress.total})
                      </h4>
                      <p className="text-xs text-blue-700 font-bold truncate max-w-md md:max-w-xl">
                        Current: <span className="font-mono text-gray-800 bg-white/80 px-1.5 py-0.5 rounded border border-blue-100">{bulkProgress.title}</span>
                      </p>
                    </div>
                    <div className="w-full sm:w-64 bg-blue-100 h-3 rounded-full overflow-hidden border border-blue-200 relative">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Create or Edit Form */}
                {adminEditingCourse && (
                  <div className="bg-white p-6 rounded-xl border-2 border-blue-400 shadow-md">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                      {adminEditingCourse === "new" ? "Add New Course/Product" : `Edit Course/Product (ID: ${adminEditingCourse.id})`}
                    </h4>
                    <form onSubmit={handleSaveCourse} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {adminEditingCourse === "new" && (
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Product ID (Unique, e.g. 13)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 13"
                              value={adminCourseForm.id}
                              onChange={(e) => setAdminCourseForm({ ...adminCourseForm, id: e.target.value })}
                              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                          <select
                            value={adminCourseForm.category}
                            onChange={(e) => setAdminCourseForm({ ...adminCourseForm, category: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          >
                            <option value="Language & Skills">Language & Skills</option>
                            <option value="AI & Reels">AI & Reels</option>
                            <option value="Entertainment & Video">Entertainment & Video</option>
                            <option value="E-Commerce Course">E-Commerce Course</option>
                            <option value="Animation Course">Animation Course</option>
                            <option value="ASMR & Reels">ASMR & Reels</option>
                            <option value="Premium Bundle">Premium Bundle</option>
                            <option value="Software Bundle">Software Bundle</option>
                            <option value="Maps & Assets">Maps & Assets</option>
                            <option value="Government Tendering">Government Tendering</option>
                            <option value="YouTube Course">YouTube Course</option>
                            <option value="Tool">Tool (Automation Software)</option>
                            <option value="Subscription">VIP Subscription / Monthly Pass</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Badge Title (e.g. Best Seller)</label>
                          <input
                            type="text"
                            placeholder="e.g. Trending"
                            value={adminCourseForm.badge}
                            onChange={(e) => setAdminCourseForm({ ...adminCourseForm, badge: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Original Price (৳ for Courses/Reels, or $ for Tools/Subscriptions)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={adminCourseForm.oldPrice}
                            onChange={(e) => setAdminCourseForm({ ...adminCourseForm, oldPrice: Number(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Discount Price (৳ for Courses/Reels, or $ for Tools/Subscriptions)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={adminCourseForm.price}
                            onChange={(e) => setAdminCourseForm({ ...adminCourseForm, price: Number(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Rating (1 - 5 Stars)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="5"
                            value={adminCourseForm.rating}
                            onChange={(e) => setAdminCourseForm({ ...adminCourseForm, rating: Number(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Enter course title in Bengali/English"
                          value={adminCourseForm.title}
                          onChange={(e) => setAdminCourseForm({ ...adminCourseForm, title: e.target.value })}
                          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-bold text-gray-700">Product Description / Details (Especially for Tools & Subscriptions)</label>
                          <button
                            type="button"
                            onClick={handleAiGenerateProductDetails}
                            disabled={generatingProductDetails}
                            className="text-xs bg-gradient-to-r from-blue-600 to-[#2AABEE] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
                          >
                            {generatingProductDetails ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" /> ✨ AI Generate Details & Features
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Enter details, description or long information of the product"
                          value={adminCourseForm.description}
                          onChange={(e) => setAdminCourseForm({ ...adminCourseForm, description: e.target.value })}
                          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Features (comma separated)</label>
                        <textarea
                          rows={2}
                          placeholder="Feature 1, Feature 2, Feature 3, Feature 4"
                          value={adminCourseForm.featuresString}
                          onChange={(e) => setAdminCourseForm({ ...adminCourseForm, featuresString: e.target.value })}
                          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Custom Image Cover (Option 1: Upload Image file)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 500000) {
                                toast("Image is too large. Keep it under 500KB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAdminCourseForm({ ...adminCourseForm, imageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Option 2: Image URL (Or keep blank to use default template covers)</label>
                        <input
                          type="text"
                          placeholder="https://example.com/image.png"
                          value={adminCourseForm.imageUrl.startsWith("data:") ? "" : adminCourseForm.imageUrl}
                          onChange={(e) => setAdminCourseForm({ ...adminCourseForm, imageUrl: e.target.value })}
                          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>

                      {adminCourseForm.imageUrl && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-bold text-gray-500 mb-2">Image Cover Preview:</p>
                          <img src={adminCourseForm.imageUrl} alt="Cover Preview" className="max-h-32 object-cover rounded border" />
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => setAdminEditingCourse(null)}
                          className="bg-gray-100 text-gray-700 py-2.5 px-5 rounded-xl font-bold hover:bg-gray-200 transition text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white py-2.5 px-6 rounded-xl font-bold hover:bg-blue-700 transition text-sm cursor-pointer shadow-md"
                        >
                          Save Product
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Courses Listing grid/table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-extrabold text-gray-800">Products & Courses List ({coursesList.length > 0 ? coursesList.length : premiumProducts.length})</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-600">ID</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Cover</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Product Title</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Category</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Badge</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Pricing</th>
                          <th className="px-4 py-3 font-bold text-gray-600 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(coursesList.length > 0 ? coursesList : premiumProducts).map((prod) => {
                          const discountPercent = prod.oldPrice > 0 ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;
                          return (
                            <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                              <td className="px-4 py-3 text-xs font-bold text-gray-400">{prod.id}</td>
                              <td className="px-4 py-3">
                                <div className="w-12 h-10 rounded border border-gray-150 overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {renderProductCoverMockup(prod)}
                                </div>
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate font-semibold text-gray-900" title={prod.title}>
                                {prod.title}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-500">
                                {prod.category}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {prod.badge}
                                </span>
                              </td>
                              <td className="px-4 py-3 leading-tight">
                                <div className="text-xs text-gray-400 line-through">{prod.oldPrice}৳ (${Number((prod.oldPrice / TOPUP_RATE).toFixed(2)).toFixed(2)} USD)</div>
                                <div className="font-extrabold text-red-600">{prod.price}৳ (${Number((prod.price / TOPUP_RATE).toFixed(2)).toFixed(2)} USD)</div>
                                <div className="text-[10px] font-bold text-green-700 bg-green-50 px-1 py-0.2 rounded inline-block mt-1">{discountPercent}% OFF</div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setAdminEditingCourse(prod);
                                      setAdminCourseForm({
                                        id: String(prod.id),
                                        category: prod.category || "Language & Skills",
                                        title: prod.title || "",
                                        description: prod.description || "",
                                        oldPrice: prod.oldPrice || 0,
                                        price: prod.price || 0,
                                        rating: prod.rating || 5,
                                        badge: prod.badge || "Trending",
                                        featuresString: Array.isArray(prod.features) ? prod.features.join(", ") : "",
                                        imageUrl: prod.imageUrl || ""
                                      });
                                    }}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-md transition"
                                    title="Edit Course"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(String(prod.id))}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-md transition"
                                    title="Delete Course"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === "subscriptions" && (() => {
              const expiringSoonCount = allSubscriptions.filter(s => s.status === "active" && isSubscriptionExpiringSoon(s.expiresAt)).length;
              const activeCount = allSubscriptions.filter(s => s.status === "active" && s.expiresAt > Date.now()).length;
              const expiredCount = allSubscriptions.filter(s => s.status === "expired" || (s.status !== "pending" && s.status !== "canceled" && s.expiresAt <= Date.now())).length;

              const filteredSubs = allSubscriptions.filter((sub) => {
                // Search term match
                const searchLower = adminSubSearch.toLowerCase();
                const matchesSearch = 
                  sub.userName?.toLowerCase().includes(searchLower) ||
                  sub.userEmail?.toLowerCase().includes(searchLower) ||
                  sub.geminiEmail?.toLowerCase().includes(searchLower) ||
                  sub.id?.toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;

                // Filter status match
                if (adminSubFilter === "active") return sub.status === "active" && sub.expiresAt > Date.now();
                if (adminSubFilter === "expired") return sub.status === "expired" || (sub.status !== "pending" && sub.status !== "canceled" && sub.expiresAt <= Date.now());
                if (adminSubFilter === "expiring") return sub.status === "active" && isSubscriptionExpiringSoon(sub.expiresAt);
                return true;
              });

              return (
                <div className="space-y-6">
                  {/* Warning Notification Banner for Expiring Subscriptions */}
                  {expiringSoonCount > 0 && (
                    <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">⚠️</span>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base">EXPIRING SUBSCRIPTIONS NOTIFICATION!</h4>
                          <p className="text-xs text-red-100">
                            {expiringSoonCount} subscription{expiringSoonCount > 1 ? "s are" : " is"} expiring in less than 24 hours. Check and ask them to renew soon!
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setAdminSubFilter("expiring"); }} 
                        className="bg-white text-red-700 font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-red-50 transition shadow-sm self-stretch sm:self-auto text-center cursor-pointer"
                      >
                        Filter Expiring Soon
                      </button>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Total Purchased</p>
                      <p className="text-2xl font-extrabold text-gray-800 mt-1">{allSubscriptions.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-green-500 uppercase">Active Plans</p>
                      <p className="text-2xl font-extrabold text-green-600 mt-1">{activeCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-amber-500 uppercase">Expiring (24h)</p>
                      <p className="text-2xl font-extrabold text-amber-600 mt-1">{expiringSoonCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-red-400 uppercase">Expired Plans</p>
                      <p className="text-2xl font-extrabold text-red-600 mt-1">{expiredCount}</p>
                    </div>
                  </div>

                  {/* Controls Banner */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                      <input
                        type="text"
                        placeholder="Search by User Name, Email, or Gemini Gmail..."
                        value={adminSubSearch}
                        onChange={(e) => setAdminSubSearch(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
                      />
                      {adminSubSearch && (
                        <button onClick={() => setAdminSubSearch("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
                      {(["all", "active", "expiring", "expired"] as const).map((filterVal) => (
                        <button
                          key={filterVal}
                          onClick={() => setAdminSubFilter(filterVal)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                            adminSubFilter === filterVal
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {filterVal === "expiring" ? "Expiring Soon" : filterVal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Layout of subscriptions */}
                  {filteredSubs.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-bold">No subscriptions matched your filters</p>
                      <p className="text-xs text-gray-400 mt-1">Try changing your filters or searching another keyword.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredSubs.map((sub) => {
                        const isExpSoon = sub.status === "active" && isSubscriptionExpiringSoon(sub.expiresAt);
                        const isOver = sub.status !== "pending" && sub.status !== "canceled" && sub.status !== "cancelled" && sub.expiresAt <= Date.now();
                        const countryFlag = geminiCountryFlags[sub.country] || "🌍";

                        const editableEmail = editingFamilyEmails[sub.id] !== undefined 
                          ? editingFamilyEmails[sub.id] 
                          : (sub.familyManagerEmail === "Not Assigned" ? "" : sub.familyManagerEmail || "");

                        const handleSave = async () => {
                          try {
                            await updateDoc(doc(db, "gemini_subscriptions", sub.id), {
                              familyManagerEmail: editableEmail.trim() || "Not Assigned"
                            });
                            toast.success("Family Manager Gmail updated!");
                          } catch (err) {
                            console.error("Error setting manager:", err);
                            toast.error("Failed to save email.");
                          }
                        };

                        return (
                          <div 
                            key={`gemini-sub-${sub.id}`} 
                            className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between transition-all ${
                              isExpSoon 
                                ? "border-amber-300 ring-2 ring-amber-100" 
                                : isOver 
                                ? "border-red-200 bg-red-50/10" 
                                : "border-gray-200"
                            }`}
                          >
                            <div>
                              {/* Header details */}
                              <div className="flex justify-between items-start gap-4 mb-3 pb-3 border-b border-gray-100">
                                <div>
                                  <span className="text-xs font-bold text-gray-400 block mb-0.5">SUBSCRIPTION ID: {sub.id}</span>
                                  <h4 className="font-extrabold text-gray-800 text-sm sm:text-base">
                                    Google Gemini Pro Premium
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    sub.status === "pending"
                                      ? "bg-amber-100 text-amber-800 animate-pulse border border-amber-200"
                                      : sub.status === "canceled" || sub.status === "cancelled"
                                      ? "bg-gray-100 text-gray-500 border border-gray-200"
                                      : isOver 
                                      ? "bg-red-100 text-red-800" 
                                      : isExpSoon 
                                      ? "bg-amber-100 text-amber-800 animate-pulse" 
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {sub.status === "pending" ? "Pending ⏳" : sub.status === "canceled" || sub.status === "cancelled" ? "Canceled ❌" : isOver ? "Expired" : isExpSoon ? "Expiring Soon ⚠️" : "Active"}
                                  </span>
                                  {isExpSoon && (
                                    <span className="block bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-1 animate-pulse tracking-wide">
                                      CRITICAL EXPIRY
                                    </span>
                                  )}
                                  <span className="block text-xs font-bold text-blue-600 mt-1">
                                    {sub.plan === "member_1m" ? "Gemini Member (1M)" :
                                     sub.plan === "member_3m" ? "Gemini Member (3M)" :
                                     sub.plan === "member_6m" ? "Gemini Member (6M)" :
                                     sub.plan === "member_12m" ? "Gemini Member (12M)" :
                                     sub.plan === "personal_12m" ? "Personal Plan (12M)" : "12-Month Plan"}
                                  </span>
                                </div>
                              </div>

                              {/* Inner stats columns */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs mb-4">
                                <div className="space-y-1 bg-gray-50/50 p-2 rounded-lg">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Details</p>
                                  <p className="font-bold text-gray-700">{sub.userName}</p>
                                  <p className="text-gray-500 truncate">{sub.userEmail}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{sub.userId}</p>
                                </div>

                                <div className="space-y-1 bg-gray-50/50 p-2 rounded-lg">
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Linked AI Account</p>
                                  <p className="font-bold text-indigo-900 truncate select-all">{sub.geminiEmail}</p>
                                  <p className="text-gray-500 select-all font-mono">Pass: {sub.geminiPassword}</p>
                                  {sub.geminiBackupCodes && sub.geminiBackupCodes !== "Not Required" && (
                                    <p className="text-red-600 font-bold select-all font-mono text-[10px] bg-red-50 p-1 rounded border border-red-100">
                                      🔑 Auth Key: {sub.geminiBackupCodes}
                                    </p>
                                  )}
                                  <p className="text-gray-700 font-semibold flex items-center gap-1">
                                    {countryFlag} {sub.country} <span className="text-gray-400 font-normal">(${sub.priceUSD} USD)</span>
                                  </p>
                                </div>

                                <div className="sm:col-span-2 space-y-1 bg-blue-50/30 p-2 rounded-lg border border-blue-100/30">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-blue-500 uppercase">
                                    <span>Timeframe Duration</span>
                                    {sub.status === "pending" ? (
                                      <span className="text-amber-600 font-extrabold animate-pulse">
                                        PENDING ACTIVATION
                                      </span>
                                    ) : sub.status === "canceled" || sub.status === "cancelled" ? (
                                      <span className="text-gray-500 font-bold">
                                        CANCELLED
                                      </span>
                                    ) : !isOver ? (
                                      <span className={isExpSoon ? "text-amber-600 font-extrabold" : "text-green-600 font-bold"}>
                                        {getSubscriptionRemainingText(sub.expiresAt).text}
                                      </span>
                                    ) : (
                                      <span className="text-red-600 font-bold">
                                        EXPIRED
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex justify-between font-medium text-gray-700">
                                    <span>Bought: {new Date(sub.createdAt).toLocaleString()}</span>
                                    {sub.status === "pending" ? (
                                      <span className="text-amber-600 italic">Starts upon activation ({sub.durationDays || 30} Days)</span>
                                    ) : sub.status === "canceled" || sub.status === "cancelled" ? (
                                      <span className="text-gray-500 italic">Refunded</span>
                                    ) : (
                                      <span>Expires: {new Date(sub.expiresAt).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 italic">Purchased {getSubscriptionDaysAgo(sub.createdAt)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Family Manager inputs & settings */}
                            <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50 mt-1">
                              <label className="block text-[11px] font-extrabold text-indigo-700 uppercase mb-1 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> Family Manager Gmail (add/edit)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  placeholder="e.g. manager@gmail.com"
                                  value={editableEmail}
                                  onChange={(e) => setEditingFamilyEmails({ ...editingFamilyEmails, [sub.id]: e.target.value })}
                                  className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-gray-800"
                                />
                                <button
                                  onClick={handleSave}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                              <p className="text-[10px] text-indigo-400 mt-1 font-medium">
                                This will show immediately in the member's Account panel.
                              </p>
                            </div>

                            {/* Mark as Active for Pending Subscriptions */}
                            {sub.status === "pending" && (
                              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                                  ⏳ Subscription needs Manual Setup
                                </span>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const activatedAt = Date.now();
                                        const duration = sub.durationDays || 30;
                                        const newExpiresAt = activatedAt + duration * 24 * 60 * 60 * 1000;
                                        await updateDoc(doc(db, "gemini_subscriptions", sub.id), {
                                          status: "active",
                                          activatedAt: activatedAt,
                                          expiresAt: newExpiresAt
                                        });
                                        toast.success("Subscription activated successfully!");
                                      } catch (err) {
                                        console.error("Error activating subscription:", err);
                                        toast.error("Failed to activate.");
                                      }
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center"
                                  >
                                    ✅ Mark as Active
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmModal({
                                        show: true,
                                        message: `Are you sure you want to cancel this subscription for ${sub.userName} (${sub.geminiEmail}) and refund $${sub.priceUSD.toFixed(2)} USD back to their wallet balance?`,
                                        onConfirm: async () => {
                                          try {
                                            // 1. Close confirm modal
                                            setConfirmModal(prev => ({ ...prev, show: false }));

                                            // 2. Refund the user's wallet
                                            await updateDoc(doc(db, "users", sub.userId), {
                                              balanceUSD: increment(sub.priceUSD),
                                              total_spent: increment(-sub.priceUSD),
                                              last_update: Date.now()
                                            });

                                            // 3. Create a refund transaction
                                            const txRef = doc(collection(db, "transactions"));
                                            await setDoc(txRef, {
                                              userId: sub.userId,
                                              type: "refund_gemini",
                                              txType: "Credit",
                                              amountUSD: sub.priceUSD,
                                              status: "success",
                                              details: { 
                                                title: `Refund: Google Gemini Subscription Cancelled (${sub.plan})`,
                                                category: "AI Subscription Refund", 
                                                country: sub.country, 
                                                plan: sub.plan, 
                                                email: sub.geminiEmail,
                                                reason: "Admin Cancelled / Refunded"
                                              },
                                              createdAt: Date.now(),
                                            });

                                            // 4. Mark subscription as canceled
                                            await updateDoc(doc(db, "gemini_subscriptions", sub.id), {
                                              status: "canceled"
                                            });

                                            toast.success("Subscription cancelled and user refunded successfully!");
                                          } catch (err) {
                                            console.error("Error cancelling subscription:", err);
                                            toast.error("Failed to cancel subscription.");
                                          }
                                        }
                                      });
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center"
                                  >
                                    ❌ Cancel & Refund
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200/60 z-[60] flex justify-around items-center px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl">
        <button onClick={() => { setCurrentView("dashboard"); }} className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${currentView === "dashboard" ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"}`}>
          <Home className={`w-[22px] h-[22px] mb-0.5 ${currentView === "dashboard" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className={`text-[10px] ${currentView === "dashboard" ? "font-bold" : "font-medium"}`}>{i18n.dashboardNav || "Home"}</span>
        </button>
        <button onClick={() => { requireAuth(() => { setTopupModal(true); setIsMobileMenuOpen(false); }); }} className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 text-slate-400 hover:text-slate-600`}>
          <div className="w-[22px] h-[22px] mb-0.5 rounded-full border-2 border-current flex items-center justify-center">
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </div>
          <span className="text-[10px] font-medium">{i18n.addFundsTitle || "Add Money"}</span>
        </button>
        <button onClick={() => requireAuth(() => { setCurrentView("records"); })} className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${currentView === "records" ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"}`}>
          <Bookmark className={`w-[22px] h-[22px] mb-0.5 ${currentView === "records" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className={`text-[10px] ${currentView === "records" ? "font-bold" : "font-medium"}`}>{i18n.recordsNav || "My Orders"}</span>
        </button>
        <button onClick={() => { setCurrentView("buy"); }} className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${currentView === "buy" ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"}`}>
          <LayoutGrid className={`w-[22px] h-[22px] mb-0.5 ${currentView === "buy" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className={`text-[10px] ${currentView === "buy" ? "font-bold" : "font-medium"}`}>{i18n.buyNav || "Buy Account"}</span>
        </button>
        <button onClick={() => requireAuth(() => { setCurrentView("profile"); })} className={`flex flex-col items-center flex-1 py-1 transition-all duration-300 ${currentView === "profile" ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"}`}>
          <User className={`w-[22px] h-[22px] mb-0.5 ${currentView === "profile" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className={`text-[10px] ${currentView === "profile" ? "font-bold" : "font-medium"}`}>{i18n.profileNav || "Account"}</span>
        </button>
      </div>

      {/* Floating Action Buttons */}
      {currentView !== "admin" && (
        <div className="fixed bottom-40 md:bottom-24 right-4 md:right-6 z-[70] flex flex-col items-end gap-3">
          {/* Tickets Button */}
          <div className="flex items-center shadow-xl rounded-full" style={{ filter: 'drop-shadow(0px 8px 16px rgba(42,171,238,0.25))' }}>
            <button onClick={() => setCurrentView("tickets")} className="flex items-center cursor-pointer group">
                <div className="bg-gradient-to-r from-blue-600 to-[#2AABEE] text-white px-3 py-1.5 rounded-l-full font-bold text-xs border border-blue-500/30 tracking-wide h-10 flex items-center -mr-3 pr-4 group-hover:-translate-x-1 transition-transform">
                  {lang === "bn" ? "সাপোর্ট চ্যাট ⚡" : "Live Chat ⚡"}
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-[#1d82b8] text-white p-2.5 rounded-full z-10 w-11 h-11 flex items-center justify-center transform group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(42,171,238,0.5)]">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
            </button>
          </div>
          
          {/* WhatsApp Button */}
          <div className="flex items-center shadow-xl rounded-full" style={{ filter: 'drop-shadow(0px 8px 16px rgba(37,211,102,0.25))' }}>
            <button onClick={() => window.open("https://wa.me/8801644627304", "_blank")} className="flex items-center cursor-pointer group">
                <div className="bg-gradient-to-r from-green-600 to-[#25D366] text-white px-3 py-1.5 rounded-l-full font-bold text-xs border border-green-500/30 tracking-wide h-10 flex items-center -mr-3 pr-4 group-hover:-translate-x-1 transition-transform">
                  Need Help?
                </div>
                <div className="bg-gradient-to-br from-green-500 to-[#1da851] text-white p-2.5 rounded-full z-10 w-11 h-11 flex items-center justify-center transform group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(37,211,102,0.5)]">
                  <Phone className="w-5 h-5 fill-current" />
                </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        <SuccessReceiptModal
          isOpen={successReceipt !== null}
          onClose={() => setSuccessReceipt(null)}
          lang={lang}
          receipt={successReceipt}
        />
        {p2pModal && renderP2pModal()}
        {topupModal && renderTopupModal()}
        {withdrawModal && renderWithdrawModal()}
        {purchasedNumber && renderPurchasedModal()}
        {confirmModal.show && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4 animate-bounce">
                <AlertTriangle className="h-6 w-6 text-amber-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmation</h3>
              <p className="text-sm text-gray-600 mb-6 font-semibold whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  id="confirm-modal-cancel"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-bold hover:bg-gray-200 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-modal-submit"
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-amber-500 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-amber-600 transition text-sm shadow-sm cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hamburger / Side Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[101] shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <TelemarketLogo className="h-8" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <button
                  onClick={() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("dashboard"); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Home className={`w-5 h-5 ${currentView === "dashboard" ? "text-blue-600" : "text-gray-400"}`} /> {i18n.dashboardNav || "Home"}
                </button>
                <button
                  onClick={() => { requireAuth(() => { setTopupModal(true); setIsMobileMenuOpen(false); }); }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition font-medium w-full text-left"
                >
                  <Plus className="w-5 h-5 text-gray-400" /> {i18n.addFundsTitle || "Add Money"}
                </button>
                <button
                  onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("records"); })}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "records" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Bookmark className={`w-5 h-5 ${currentView === "records" ? "text-blue-600" : "text-gray-400"}`} /> {i18n.recordsNav || "My Orders"}
                </button>
                <button
                  onClick={() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("buy"); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "buy" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <LayoutGrid className={`w-5 h-5 ${currentView === "buy" ? "text-blue-600" : "text-gray-400"}`} /> {i18n.buyNav || "Buy Account"}
                </button>
                <button
                  onClick={() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("courses"); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "courses" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Hash className={`w-5 h-5 ${currentView === "courses" ? "text-blue-600" : "text-gray-400"}`} /> {lang === "bn" ? "ভার্চুয়াল নাম্বার" : "Virtual Numbers"}
                </button>
                <button
                  onClick={() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("tools"); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "tools" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Wrench className={`w-5 h-5 ${currentView === "tools" ? "text-blue-600" : "text-gray-400"}`} /> {lang === "bn" ? "টুলস ও ভিআইপি সাবস্ক্রিপশন" : "Tools & VIP Subscription"}
                </button>
                <button
                  onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("profile"); })}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "profile" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <User className={`w-5 h-5 ${currentView === "profile" ? "text-blue-600" : "text-gray-400"}`} /> {i18n.profileNav || "My Account"}
                </button>
                
                <div className="my-2 border-t border-gray-100"></div>
                
                <button
                  onClick={() => requireAuth(() => { (window as any).triggerAdClick?.(); setIsMobileMenuOpen(false); setCurrentView("child-panel"); })}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "child-panel" ? "bg-rose-50 text-rose-700" : "hover:bg-rose-50 text-gray-700"}`}
                >
                  <Globe className={`w-5 h-5 ${currentView === "child-panel" ? "text-rose-500" : "text-rose-400"}`} /> {lang === "bn" ? "সাব পেইজ" : "Sub Page (Child Panel)"}
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setCurrentView("api"); }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition font-medium w-full text-left ${currentView === "api" ? "bg-orange-50 text-orange-700" : "hover:bg-orange-50 text-gray-700"}`}
                >
                  <FileText className={`w-5 h-5 ${currentView === "api" ? "text-orange-500" : "text-orange-400"}`} /> API Documentation
                </button>
              </div>

              {currentUser && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {currentUser.email?.[0]?.toUpperCase()}
                     </div>
                     <div className="overflow-hidden">
                       <p className="font-bold text-gray-800 truncate">{currentUser.email}</p>
                       <p className="text-xs text-gray-500">Balance: ${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}</p>
                     </div>
                  </div>
                  <button
                    onClick={() => { signOut(auth); setShowAuth(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
