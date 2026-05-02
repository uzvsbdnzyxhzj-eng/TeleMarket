import React from 'react';
import { Smartphone, Send, Bitcoin } from 'lucide-react';

export default function TopTicker() {
  return (
    <div className="bg-[#111827] text-gray-300 py-2.5 overflow-hidden border-b border-gray-800">
      <div className="relative flex w-full">
        <div className="animate-marquee flex gap-16 md:gap-32 px-4 w-max">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-16 md:gap-32 whitespace-nowrap">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
