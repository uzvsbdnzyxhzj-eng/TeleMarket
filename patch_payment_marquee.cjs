const fs = require('fs');

let content = fs.readFileSync('src/Login.tsx', 'utf8');

const paymentMethodsCode = `const paymentMethods = [
  { 
    name: 'bKash', 
    render: () => (
      <div className="flex items-center gap-2">
        <span className="text-[#E2136E] font-medium text-xl tracking-tight">bKash</span>
        <div className="bg-[#E2136E] w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 transform -rotate-[20deg] translate-y-0.5 -translate-x-0.5 scale-110">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
        </div>
      </div>
    )
  },
  { 
    name: 'Nagad', 
    render: () => (
      <div className="flex items-center gap-1.5 ml-1">
        <div className="w-8 h-8 relative shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full text-[#F7931E]" fill="currentColor">
            <path d="M12 2C8 2 4 6 4 10c0 4.5 8 12 8 12s8-7.5 8-12c0-4-4-8-8-8zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
        </div>
        <span className="text-[#ED1C24] font-black text-xl">নগদ</span>
      </div>
    )
  },
  { 
    name: 'Rocket', 
    render: () => (
      <div className="flex flex-col items-center justify-center relative w-full h-full -mt-1">
        <div className="flex items-center justify-center z-10 w-full mb-[-4px]">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#8C2889] transform rotate-45 translate-y-1 scale-x-[1.3] scale-y-[0.8]" fill="currentColor">
             <path d="M12 2l-6 10h12L12 2z" />
             <path d="M7 12v6h10v-6H7z" />
             <path fill="white" d="M10 13l2-2 2 2H10z"/>
          </svg>
        </div>
        <span className="text-[#8C2889] font-black text-xl leading-none scale-x-125 translate-y-1">রকেট</span>
        <span className="text-[5px] text-[#8C2889] font-bold leading-none mt-[6px] tracking-tighter">ডাচ-বাংলা ব্যাংক</span>
      </div>
    )
  },
  { 
    name: 'Upay', 
    render: () => (
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center">
           <div className="text-[#0057B8] font-black text-2xl leading-none tracking-tighter">U</div>
           <div className="w-2.5 h-2.5 rounded-b-full bg-[#FFB81C] -mt-0.5"></div>
        </div>
        <span className="text-black font-bold text-base leading-none mt-1">উপায়</span>
      </div>
    )
  },
  { 
    name: 'Cellfin', 
    render: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center -space-x-1 pl-1">
           <div className="bg-[#00897B] text-white text-[12px] font-bold px-1 rounded-sm mr-1.5 transform skew-x-[-15deg] pr-2 shadow-sm relative z-10 shrink-0">C</div>
           <span className="text-[#00897B] font-bold text-lg sm:text-xl transform skew-x-[-15deg] pr-1 tracking-tight">সেলফিন</span>
        </div>
        <span className="text-[5px] font-bold text-[#00897B] mt-[2px]">ইসলামী ব্যাংক</span>
      </div>
    )
  },
  { 
    name: 'Cryptomus', 
    render: () => (
      <div className="flex items-center gap-1.5 ml-1">
        <div className="w-5 h-5 relative shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className="text-gray-900">
            <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
            <path d="M12 12l9-5" />
            <path d="M12 12v10" />
            <path d="M12 12L3 7" />
          </svg>
        </div>
        <span className="text-gray-900 font-bold text-lg tracking-tight">cryptomus</span>
      </div>
    )
  },
  { 
    name: 'PAYEER', 
    render: () => (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#0082C6] font-black text-2xl tracking-tighter -ml-1">P</span>
        <span className="text-[#00A7D3] font-black text-2xl tracking-tighter">A</span>
        <span className="text-[#00A6D3] font-black text-2xl tracking-tighter">Y</span>
        <span className="text-[#0082C6] font-black text-2xl tracking-tighter">EER</span>
        <span className="text-[#0082C6] text-[8px] font-black leading-none mb-4 -mr-1">®</span>
      </div>
    )
  },
  { 
    name: 'Binance Pay', 
    render: () => (
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 ml-1.5 shrink-0">
           <svg viewBox="0 0 24 24" fill="#F0B90B">
             <path d="M11.999 0l-5.61 5.61h0L1.402 10.598h0L11.999 21.196l10.597-10.598L11.999 0zm0 3.966l3.327 3.327-3.327 3.328-3.328-3.328L11.999 3.966zm0 9.475l-2.662-2.662-2.662 2.662L11.999 18.76l5.324-5.319-2.662-2.662-2.662 2.662z"/>
           </svg>
        </div>
        <span className="font-bold text-[#1E2329] text-sm md:text-base -tracking-wider uppercase">Binance Pay</span>
      </div>
    )
  },
  { 
    name: 'Perfect Money', 
    render: () => (
      <div className="flex items-center gap-1.5 pl-1.5 w-full">
        <div className="w-7 h-7 rounded-full bg-[#E50000] flex items-center justify-center shrink-0">
           <span className="text-white text-[11px] font-black leading-none">PM</span>
        </div>
        <div className="flex flex-col items-start translate-y-0.5">
          <span className="text-black font-extrabold text-xs tracking-tight leading-none text-left">Perfect Money</span>
          <span className="text-[#E50000] text-[5px] font-bold">the internet of finance</span>
        </div>
      </div>
    )
  },
  { 
    name: 'Paytm', 
    render: () => (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#002E6E] font-black text-2xl tracking-tighter">Pay</span>
        <span className="text-[#00BAF2] font-black text-2xl tracking-tighter">tm</span>
      </div>
    )
  },
  { 
    name: 'VISA', 
    render: () => (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#1434CB] font-black text-3xl italic tracking-tighter pr-4 translate-y-[-2px]">VISA</span>
      </div>
    )
  },
  { 
    name: 'Mastercard', 
    render: () => (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex -space-x-4">
          <div className="w-9 h-9 rounded-full bg-[#EB001B] opacity-90 mix-blend-multiply flex-shrink-0"></div>
          <div className="w-9 h-9 rounded-full bg-[#F79E1B] opacity-90 mix-blend-multiply flex-shrink-0 relative">
             <div className="absolute inset-0 max-w-full max-h-full flex justify-center -space-x-[12px] opacity-100 mix-blend-normal">
             </div>
          </div>
        </div>
        <span className="text-black text-[12px] font-bold mt-1 tracking-tight">mastercard</span>
      </div>
    )
  }
];`;

const startGrid = '<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">';

if (content.includes(startGrid)) {
   const startIdx = content.indexOf(startGrid);
   // We find the index of endGrid starting from startIdx
   const endIdx = content.indexOf('</div>', content.indexOf('.map((', startIdx)) + 6;
   
   if (endIdx !== -1) {
      const toReplace = content.substring(startIdx, endIdx);
      
      const replacement = `<style>{\`
               @keyframes customMarquee {
                 0% { transform: translateX(0); }
                 100% { transform: translateX(calc(-50% - 8px)); }
               }
               .animate-custom-marquee {
                 animation: customMarquee 25s linear infinite;
                 will-change: transform;
               }
               .animate-custom-marquee:hover {
                 animation-play-state: paused;
               }
               .mask-edges {
                 mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                 -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
               }
             \`}</style>
             <div className="relative flex overflow-hidden w-full mask-edges py-2">
                <div className="flex animate-custom-marquee gap-4 shrink-0 whitespace-nowrap items-center">
                   {[...paymentMethods, ...paymentMethods, ...paymentMethods].map((method, idx) => (
                      <div key={idx} className="w-[160px] sm:w-[180px] shrink-0 bg-white py-4 px-2 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow relative overflow-hidden h-20 sm:h-20 bg-gradient-to-br from-white to-gray-50/50 cursor-pointer">
                         {method.render()}
                      </div>
                   ))}
                </div>
             </div>`;

      content = content.replace(toReplace, replacement);

      // Now insert paymentMethods at global scope, just before `const testimonials = [`
      if (!content.includes('const paymentMethods = [')) {
          content = content.replace('const testimonials = [', paymentMethodsCode + '\\n\\nconst testimonials = [');
      }

      fs.writeFileSync('src/Login.tsx', content);
      console.log('Successfully patched marquee');
   } else {
      console.log('Could not find end of grid block');
   }
} else {
   console.log('Could not find grid container');
}
