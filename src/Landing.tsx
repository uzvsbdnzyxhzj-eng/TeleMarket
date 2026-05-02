import React from 'react';
import { Bot, ArrowRight, CheckCircle, Globe, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, t } from './i18n';
import TopTicker from './TopTicker';
import AdvertisementBanner from './AdvertisementBanner';
import { getFlag } from './utils';
import { TelemarketLogo } from './App';

interface LandingProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  countries?: any[];
  markupPercent?: number;
}

export default function Landing({ onGetStarted, lang, setLang, countries = [], markupPercent = 0 }: LandingProps) {
  const i18n = t[lang];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <TopTicker />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TelemarketLogo className="h-10 text-[#2AABEE]" />
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
              <Globe className="w-4 h-4 opacity-80" />
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs md:text-sm font-medium"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="es">Español (Spanish)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="tr">Türkçe (Turkish)</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
            <button 
              onClick={onGetStarted}
              className="bg-[#2AABEE] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm hidden md:block"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <AdvertisementBanner />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="w-full bg-white shadow-sm pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 md:pt-24 lg:pt-32 flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left"
            >
              <span className="inline-block bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6 border border-blue-100 shadow-sm tracking-wide">
                {i18n.landingBadge || '🚀 The Ultimate Auto-Delivery Marketplace'}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tighter">
                {i18n.landingHeadline || 'Premium Telegram Accounts. Instantly.'}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                {i18n.landingSub || 'The most advanced, fully automated marketplace for premium Telegram accounts.'}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#2AABEE] to-[#1a8bc5] hover:from-[#1a8bc5] hover:to-[#126b99] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  {i18n.landingCreateBtn || 'Create an Account'} <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 font-bold">
                <span className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100"><CheckCircle className="w-4 h-4 text-green-500"/> {(i18n.landingFeatures && i18n.landingFeatures[0]) || 'Verified Quality'}</span>
                <span className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><CheckCircle className="w-4 h-4 text-[#2AABEE]"/> {(i18n.landingFeatures && i18n.landingFeatures[1]) || 'Fully Automated'}</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="flex-1 w-full max-w-lg lg:max-w-none relative"
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative z-10 transform lg:rotate-2 hover:rotate-0 transition duration-500">
                <div className="bg-gray-50 border-b p-4 flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {countries.slice(0, 3).map((c, idx) => {
                       const price = (c.basePrice + (c.basePrice * markupPercent / 100)).toFixed(2);
                       const opacity = idx === 0 ? 'opacity-100' : idx === 1 ? 'opacity-80' : 'opacity-60';
                       const flag = getFlag(c.country, c.code);
                       return (
                         <div key={idx} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border ${opacity}`}>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-xl">{flag}</div>
                              <div>
                                <p className="font-bold">{c.country}</p>
                                <p className="text-xs text-gray-500">Stock: {c.stock} pcs</p>
                              </div>
                           </div>
                           <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">${price}</span>
                         </div>
                       )
                    })}
                    {countries.length === 0 && (
                      <div className="text-center text-gray-500 p-4">Loading real-time prices...</div>
                    )}
                    <div className="mt-4">
                       <div className="w-full bg-[#2AABEE] text-white text-center py-2 rounded-lg font-bold opacity-50 cursor-pointer">
                         {i18n.landingBuyAcc || 'Buy Account'}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee Payment Partners Section */}
        <div className="border-y border-gray-100 bg-white py-8 overflow-hidden relative">
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
           
           <div className="animate-marquee flex items-center gap-16 px-8">
              {/* Duplicate the items for seamless scrolling */}
              {[...Array(4)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-3">
                     <div className="bg-[#E2136E] text-white font-bold px-2 py-1 rounded shadow-sm text-sm tracking-widest flex items-center gap-1">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        bKash
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="bg-[#ED1C24] text-white font-bold px-2 py-1 rounded shadow-sm text-sm tracking-widest flex items-center gap-1">
                        Nagad
                     </div>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-2xl">
                     <svg className="w-8 h-8 text-[#F7931A] fill-current" viewBox="0 0 24 24"><path d="M14.4 12c1.32-.48 2.28-1.56 2.28-3.12 0-2.4-1.92-3.72-4.92-3.72H6.6v15.6h3.48v-2.16h1.8c3.24 0 5.4-1.56 5.4-4.2 0-1.8-1.2-3.12-2.88-3.6V12zm-3.84-4.32h1.56c1.2 0 1.92.6 1.92 1.56s-.72 1.56-1.92 1.56h-1.56V7.68zm1.92 8.16h-1.92v-3.36h1.92c1.32 0 2.28.6 2.28 1.68s-.96 1.68-2.28 1.68z"/></svg>
                     Bitcoin
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-2xl">
                     <svg className="w-8 h-8 text-[#627EEA] fill-current" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.22l7.365 4.339 7.365-4.34L12.056 0z"/></svg>
                     Ethereum
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-2xl">
                     <svg className="w-8 h-8 text-[#26A17B] fill-current" viewBox="0 0 24 24"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM9.467 9.467H6v-3.2h12v3.2h-3.467v8.533H9.467V9.467z"/></svg>
                     USDT
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-2xl">
                     <svg className="w-8 h-8 text-[#F3BA2F] fill-current" viewBox="0 0 24 24"><path d="M12 2L6 8l1.5 1.5L12 5l4.5 4.5L18 8l-6-6zm0 20l-6-6 1.5-1.5L12 19l4.5-4.5L18 16l-6 6zM6 16H3v-2h3v2zm12 0h3v-2h-3v2zm-6-2l-4.5-4.5L12 5l4.5 4.5L12 14z"/></svg>
                     Binance
                  </div>
                </React.Fragment>
              ))}
           </div>
        </div>

        {/* Features */}
        <div className="py-20 bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                 <Zap className="w-6 h-6 text-blue-600" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-gray-900">{i18n.landingFeat1Title || 'Instant Automated Delivery'}</h3>
               <p className="text-gray-600 leading-relaxed">{i18n.landingFeat1Desc || 'Our platform is connected directly to seller bots. Once you purchase, the phone number and SMS codes are delivered instantly in your dashboard.'}</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                 <Shield className="w-6 h-6 text-green-600" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-gray-900">{i18n.landingFeat2Title || 'Fully Automatic Top-ups'}</h3>
               <p className="text-gray-600 leading-relaxed">{i18n.landingFeat2Desc || 'Top up your balance fully automatically 24/7. We support seamless integrations with local Mobile Banking (bKash) and Cryptos.'}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                 <Globe className="w-6 h-6 text-orange-600" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-gray-900">{i18n.landingFeat3Title || 'Affiliate Program'}</h3>
               <p className="text-gray-600 leading-relaxed">{i18n.landingFeat3Desc || 'Invite friends and earn 1% lifetime commissions on all their deposits up to $230 per user. Easy passive income.'}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12 text-center text-gray-500 text-sm">
         <p>{i18n.landingFooter || `© ${new Date().getFullYear()} TeleBot Shop. All rights reserved.`}</p>
      </footer>
    </div>
  );
}
