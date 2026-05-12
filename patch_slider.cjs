const fs = require('fs');
let content = fs.readFileSync('src/Login.tsx', 'utf8');

const testimonialsCode = `
const testimonials = [
  { name: "Sarah J.", role: "Influencer", app: "Instagram", image: "https://i.pravatar.cc/150?img=1", quote: "Got 10k real followers in a week. Highly recommended for organic growth!" },
  { name: "Michael T.", role: "Content Creator", app: "YouTube", image: "https://i.pravatar.cc/150?img=11", quote: "Monetization achieved! Fast watch hours and real subscribers delivered." },
  { name: "Elena R.", role: "E-commerce Owner", app: "Facebook", image: "https://i.pravatar.cc/150?img=5", quote: "Boosted my page engagement incredibly, leading to 3x more sales." },
  { name: "David K.", role: "Streamer", app: "Twitch", image: "https://i.pravatar.cc/150?img=15", quote: "Viewer count stabilized during my streams. The best panel I have used." },
  { name: "Aisha F.", role: "Marketer", app: "TikTok", image: "https://i.pravatar.cc/150?img=20", quote: "Went viral on my 3rd video thanks to the high retention views!" },
  { name: "James L.", role: "Crypto Project", app: "Telegram", image: "https://i.pravatar.cc/150?img=33", quote: "Added 5,000 targeted members to my group without a single drop." },
  { name: "Chloe M.", role: "Brand Manager", app: "X/Twitter", image: "https://i.pravatar.cc/150?img=44", quote: "Trended locally within hours. Super fast delivery and great support." },
  { name: "Omar H.", role: "Consultant", app: "LinkedIn", image: "https://i.pravatar.cc/150?img=53", quote: "Professional connections grew fast. Very satisfied with the service quality." },
  { name: "Sophie W.", role: "Community Lead", app: "Discord", image: "https://i.pravatar.cc/150?img=30", quote: "Server members increased seamlessly. Active and real looking accounts." },
  { name: "Rahul S.", role: "Small Business", app: "WhatsApp", image: "https://i.pravatar.cc/150?img=12", quote: "Massive reach out to potential clients. Extremely effective marketing." }
];

function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full overflow-hidden mt-12 py-16 bg-white border border-gray-100 shadow-sm relative rounded-[40px]">
       <div className="text-center mb-10">
           <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
             Trusted by Content Creators
           </h2>
           <p className="text-gray-600 mt-2">See what our users have to say about their growth.</p>
       </div>
       <div className="max-w-6xl mx-auto px-4 relative overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}>
             {testimonials.map((t, idx) => (
               <div key={idx} className="w-full shrink-0 px-4 sm:w-1/2 md:w-1/3">
                  <div className="bg-gray-50 p-8 rounded-[24px] border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-white shadow-sm">
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                     </div>
                     <h4 className="font-black text-lg text-gray-900 leading-tight">{t.name}</h4>
                     <p className="text-sm text-[#16a34a] font-bold mb-4">{t.role} • {t.app}</p>
                     <p className="text-gray-600 italic leading-relaxed text-sm">"{t.quote}"</p>
                  </div>
               </div>
             ))}
          </div>
          
          <div className="flex justify-center mt-8 gap-2">
             {testimonials.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentIndex(idx)}
                  className={\`w-2.5 h-2.5 rounded-full transition-all \${currentIndex === idx ? 'bg-[#16a34a] w-8' : 'bg-gray-300'}\`}
                />
             ))}
          </div>
       </div>
    </div>
  );
}

`;

if (!content.includes('import React, { useState, useEffect }')) {
  // Ensure useEffect is available if it was just { useState }
  if (content.includes('import React, { useState } from')) {
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
  } else if (content.includes("import React from 'react';")) {
    content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';");
  }
}

if (!content.includes('function TestimonialSlider()')) {
  content = content.replace('export default function Login', testimonialsCode + 'export default function Login');
}

const insertTarget = '{/* How it Works section */}';
if (!content.includes('<TestimonialSlider />')) {
  content = content.replace(insertTarget, '<TestimonialSlider />\n\n          ' + insertTarget);
}

fs.writeFileSync('src/Login.tsx', content);
console.log('Testimonials added successfully.');
