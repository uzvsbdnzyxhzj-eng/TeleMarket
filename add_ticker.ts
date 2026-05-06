import fs from 'fs';

const cryptoPrices = `     
            {/* Crypto Ticker */}
            <div className="mt-8 overflow-hidden bg-gray-900 py-3 rounded-xl border border-gray-800 shadow-inner relative flex mb-10">
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>
              <div className="flex animate-marquee whitespace-nowrap min-w-max items-center">
                <span className="mx-6 font-mono text-sm tracking-widest text-[#f7931a] font-bold">₿ BTC/USDT $68,430 <span className="text-green-500">▲ 2.4%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#627eea] font-bold">⟠ ETH/USDT $3,850 <span className="text-green-500">▲ 1.8%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#1cd435] font-bold">₮ USDT/USD $1.00 <span className="text-gray-400">0.0%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#f3ba2f] font-bold">💰 BNB/USDT $590 <span className="text-green-500">▲ 0.5%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#14C8D4] font-bold">💧 TON/USDT $6.45 <span className="text-green-500">▲ 3.2%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#2AABEE] font-bold">✈️ NOT/USDT $0.012 <span className="text-red-500">▼ 1.1%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-purple-500 font-bold">🐕 SOL/USDT $165 <span className="text-green-500">▲ 4.4%</span></span>
              </div>
              <div className="flex animate-marquee whitespace-nowrap min-w-max items-center absolute top-3">
                <span className="mx-6 font-mono text-sm tracking-widest text-[#f7931a] font-bold">₿ BTC/USDT $68,430 <span className="text-green-500">▲ 2.4%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#627eea] font-bold">⟠ ETH/USDT $3,850 <span className="text-green-500">▲ 1.8%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#1cd435] font-bold">₮ USDT/USD $1.00 <span className="text-gray-400">0.0%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#f3ba2f] font-bold">💰 BNB/USDT $590 <span className="text-green-500">▲ 0.5%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#14C8D4] font-bold">💧 TON/USDT $6.45 <span className="text-green-500">▲ 3.2%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-[#2AABEE] font-bold">✈️ NOT/USDT $0.012 <span className="text-red-500">▼ 1.1%</span></span>
                <span className="mx-6 font-mono text-sm tracking-widest text-purple-500 font-bold">🐕 SOL/USDT $165 <span className="text-green-500">▲ 4.4%</span></span>
              </div>
            </div>`;

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('</a>\n              </div>\n            </div>\n          </div>\n        )}', '</a>\n              </div>\n              ' + cryptoPrices + '\n            </div>\n          </div>\n        )}');

fs.writeFileSync('src/App.tsx', content);

let cssContent = fs.readFileSync('src/index.css', 'utf8');
if(!cssContent.includes('animate-marquee')) {
  cssContent += `\n
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-marquee {
  animation: marquee 25s linear infinite;
}
`;
  fs.writeFileSync('src/index.css', cssContent);
}

console.log('Appended Crypto Ticker to App.tsx');
