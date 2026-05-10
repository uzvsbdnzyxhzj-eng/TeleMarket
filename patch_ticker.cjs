const fs = require('fs');
let c = fs.readFileSync('src/TopTicker.tsx', 'utf8');

const importTarget = "import { Smartphone, Send, Bitcoin } from 'lucide-react';";
const importReplacement = "import { Smartphone, Send, Bitcoin, Youtube, Facebook, Instagram, Zap } from 'lucide-react';";
c = c.replace(importTarget, importReplacement);

const itemsTarget = `<div className="flex gap-16 md:gap-32 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2AABEE]" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Fresh Telegram Accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Virtual Numbers for Telegram Accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Crypto Payments Accepted</span>
              </div>
            </div>`;

const itemsReplacement = `<div className="flex gap-16 md:gap-32 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2AABEE]" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Fresh Telegram Accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Premium SMM Services</span>
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
                <Facebook className="w-4 h-4 text-blue-500 fill-blue-500" />
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Boost YouTube, Facebook & More</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Virtual Numbers for Telegram Accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs md:text-sm font-medium tracking-wide">Crypto Payments Accepted</span>
              </div>
            </div>`;

c = c.replace(itemsTarget, itemsReplacement);
fs.writeFileSync('src/TopTicker.tsx', c);
console.log("Patched ticker");
