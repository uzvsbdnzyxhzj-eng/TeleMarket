const fs = require('fs');

let content = fs.readFileSync('src/Login.tsx', 'utf8');

const paymentLogos = `
const paymentMethods = [
  { name: 'bKash', color: 'text-pink-600', text: 'bKash', border: 'border-gray-100' },
  { name: 'Nagad', color: 'text-orange-500', text: 'নগদ', border: 'border-gray-100' },
  { name: 'Rocket', color: 'text-purple-600', text: 'রকেট', border: 'border-gray-100' },
  { name: 'Upay', color: 'text-blue-600', text: 'উপায়', border: 'border-gray-100' },
  { name: 'Cellfin', color: 'text-green-600', text: 'সেলফিন', border: 'border-gray-100' },
  { name: 'Cryptomus', color: 'text-gray-900', text: 'cryptomus', border: 'border-gray-100' },
  { name: 'PAYEER', color: 'text-blue-500', text: 'PAYEER', border: 'border-gray-100' },
  { name: 'Binance Pay', color: 'text-yellow-500', text: 'BINANCE PAY', border: 'border-gray-100' },
  { name: 'Perfect Money', color: 'text-red-600', text: 'Perfect Money', border: 'border-gray-100' },
  { name: 'Paytm', color: 'text-blue-400', text: 'Paytm', border: 'border-gray-100' },
  { name: 'VISA', color: 'text-blue-800', text: 'VISA', border: 'border-gray-100', italic: true },
  { name: 'Mastercard', color: 'text-red-500', text: 'mastercard', border: 'border-gray-100' },
];
`;

if (!content.includes('const paymentMethods')) {
    content = content.replace('const testimonials = [', paymentLogos + '\nconst testimonials = [');
}

const paymentSection = `           
          {/* Payment Methods Section */}
          <div className="mt-16 pb-20 max-w-4xl mx-auto px-4">
             <div className="text-center sm:text-left mb-6">
                 <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                   Payment Methods
                 </h2>
             </div>
             
             <div className="text-gray-600 leading-relaxed text-sm sm:text-base mb-8 space-y-4 text-center sm:text-left">
                <p>
                  At TeleMarket, we ensure the customer enjoys the convenience and security of the available payment options. Here are the security payment methods we accept: Credit/Debit Cards, PayPal, Bitcoin, etc.
                </p>
                <p>
                  Want to deposit money into your account or buy something online? You can rest assured that your payment data will be processed with accuracy. We ensure that we make the payments methods as versatile as possible to enable any user to start using SMM services from any part of the world.
                </p>
             </div>

             <div className="mb-12 flex justify-center sm:justify-start">
                <button 
                  onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-[#5222d0] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#4319b2] transition-colors shadow-lg shadow-purple-500/20"
                >
                  Create An account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {paymentMethods.map((method, idx) => (
                   <div key={idx} className={\`bg-white py-4 px-2 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow\`}>
                      <span className={\`font-black text-lg sm:text-xl \${method.color} \${method.italic ? 'italic tracking-tighter' : ''}\`}>
                         {method.text}
                      </span>
                   </div>
                ))}
             </div>
          </div>
`;

content = content.replace(/<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/g, '</button>\n             </div>\n' + paymentSection + '          </div>\n        </div>\n      </div>\n    </div>');

fs.writeFileSync('src/Login.tsx', content);
console.log('Done');
