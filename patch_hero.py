import re

with open('src/Login.tsx', 'r') as f:
    content = f.read()

hero_slider_code = """
const heroSlides = [
  { image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000", app: "Instagram", user: "Real Followers", icon: Instagram, color: "text-pink-600", bg: "bg-pink-100" },
  { image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=800&h=1000", app: "YouTube", user: "Subscribers", icon: Youtube, color: "text-red-600", bg: "bg-red-100" },
  { image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800&h=1000", app: "Facebook", user: "Page Likes", icon: Facebook, color: "text-blue-600", bg: "bg-blue-100" },
  { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800&h=1000", app: "TikTok", user: "Real Views", icon: Video, color: "text-black", bg: "bg-gray-200" },
  { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800&h=1000", app: "Telegram", user: "Group Members", icon: Send, color: "text-sky-500", bg: "bg-sky-100" },
  { image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800&h=1000", app: "X/Twitter", user: "Retweets", icon: Twitter, color: "text-gray-900", bg: "bg-gray-200" },
  { image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800&h=1000", app: "Spotify", user: "Monthly Listeners", icon: Music, color: "text-green-500", bg: "bg-green-100" },
  { image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800&h=1000", app: "LinkedIn", user: "Connections", icon: Linkedin, color: "text-blue-700", bg: "bg-blue-100" },
  { image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800&h=1000", app: "Twitch", user: "Live Viewers", icon: Twitch, color: "text-purple-600", bg: "bg-purple-100" },
  { image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800&h=1000", app: "Pinterest", user: "Board Saves", icon: Pin, color: "text-red-500", bg: "bg-red-100" },
  { image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800&h=1000", app: "Reddit", user: "Upvotes", icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-100" },
  { image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800&h=1000", app: "Discord", user: "Server Members", icon: Gamepad2, color: "text-indigo-500", bg: "bg-indigo-100" },
];

function HeroImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="my-8 flex justify-center w-full relative overflow-hidden">
       <div className="relative w-[320px] h-[380px] sm:w-[450px] sm:h-[500px] flex items-end justify-center">
          {/* Green Backing Shape with stripes */}
          <div className="absolute inset-x-4 sm:inset-x-8 top-16 bottom-0 bg-[#16a34a] rounded-t-[60px] sm:rounded-t-[80px] rounded-b-[30px] overflow-hidden pointer-events-none">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 2px, transparent 2px, transparent 40px)' }} />
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD700 0, #FFD700 2px, transparent 2px, transparent 40px)' }} />
          </div>

          <div className="absolute bottom-0 w-[95%] h-[95%] overflow-hidden rounded-b-[30px] rounded-t-[30px]">
             <div 
                className="flex h-full transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
             >
                {heroSlides.map((slide, idx) => (
                   <img 
                      key={idx}
                      src={slide.image} 
                      alt="SMM Hero" 
                      className="w-full h-full object-cover object-top shrink-0 pointer-events-none"
                      style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 60%, transparent 100%)' }}
                   />
                ))}
             </div>
          </div>

          {/* Decorative floating stats container */}
          <div className="absolute left-[-5px] sm:-left-6 bottom-12 bg-white backdrop-blur rounded-[20px] shadow-2xl border border-gray-100 p-4 w-[160px] sm:w-[200px] z-10">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[10px] sm:text-xs font-bold text-gray-800">Growth Rate</h4>
              <div className="flex gap-1 text-[#16a34a] opacity-50">
                <div className="w-4 h-4 border rounded-full flex justify-center items-center text-[8px] border-[#16a34a]">□</div>
                <div className="w-4 h-4 border rounded-full flex justify-center items-center text-[8px] border-[#16a34a]">↓</div>
              </div>
            </div>
            <AnimatePresence mode="wait">
               <motion.p 
                  key={currentIndex}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="text-sm font-black text-gray-900 mb-2 leading-none"
               >
                  {Math.floor(Math.random() * 20 + 5)}.{Math.floor(Math.random() * 9)}K <span className="block text-gray-500 font-bold text-[8px] sm:text-[9px] mt-0.5">New {heroSlides[currentIndex].user}</span>
               </motion.p>
            </AnimatePresence>
            <div className="flex items-end gap-1.5 h-16 mt-2 relative">
              <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-0"></div>
              <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-1/3"></div>
              <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-2/3"></div>
              <div className="absolute left-0 w-full h-[1px] bg-gray-100 top-0"></div>
              {[40, 20, 80, 30, 90, 60, 100, 50].map((h, i) => (
                <div key={i} className="bg-[#16a34a] w-full rounded-t z-10" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className="absolute right-[-5px] sm:-right-6 bottom-24 bg-white backdrop-blur rounded-[20px] shadow-2xl border border-gray-100 p-3 sm:p-4 w-[170px] sm:w-[240px] z-10">
            <div className="flex items-center gap-2 mb-3 justify-between">
              <div className="flex items-center gap-2">
                 <AnimatePresence mode="wait">
                    <motion.div 
                       key={currentIndex} 
                       initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                       className={`w-5 h-5 sm:w-6 sm:h-6 ${heroSlides[currentIndex].bg} rounded-full flex items-center justify-center ${heroSlides[currentIndex].color}`}
                    >
                       {React.createElement(heroSlides[currentIndex].icon, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" })}
                    </motion.div>
                 </AnimatePresence>
                 <AnimatePresence mode="wait">
                    <motion.span 
                       key={currentIndex}
                       initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                       className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight"
                    >
                       {heroSlides[currentIndex].app} {heroSlides[currentIndex].user}
                    </motion.span>
                 </AnimatePresence>
              </div>
              <div className="bg-[#dcfce7] text-[#16a34a] text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0">In Progress</div>
            </div>
            <div className="flex gap-1 mb-2">
              <div className="h-1.5 bg-[#16a34a] rounded-full w-[35%]"></div>
              <div className="h-1.5 bg-[#16a34a] rounded-full w-[35%]"></div>
              <div className="h-1.5 bg-gray-200 rounded-full w-[30%]"></div>
            </div>
            <p className="text-[7px] sm:text-[8px] text-gray-500 font-bold flex justify-between">
              <span>Start Count: <span className="text-[#16a34a]">{Math.floor(Math.random() * 50000 + 10000)}</span></span>
              <span>Remain: <span className="text-[#16a34a]">{Math.floor(Math.random() * 5000 + 1000)}</span></span>
              <span className="opacity-0 sm:opacity-100">Time: <span className="text-[#16a34a]">2 Minutes</span></span>
            </p>
          </div>

          <div className="absolute right-[-10px] sm:-right-4 -bottom-6 w-14 h-14 bg-[#22c55e] rounded-full shadow-2xl flex items-center justify-center z-20 cursor-pointer hover:scale-105 transition-transform border-[3px] border-white">
             <MessageSquare className="w-6 h-6 text-white" />
          </div>
       </div>
    </div>
  );
}

"""

if "function HeroImageSlider()" not in content:
    content = content.replace("export default function Login", hero_slider_code + "\nexport default function Login")

pattern_to_remove = r"\{\/\*\s*Render the Hero Image Section from screenshot\s*\*\/\}.*?(?=\<\/div>\n\n\s*\{\/\*\s*Global \& Fast Marketing Section)"

replacement = """{/* Render the Hero Image Section from screenshot */}
        <HeroImageSlider />
"""

newcontent = re.sub(pattern_to_remove, replacement, content, flags=re.DOTALL)

with open('src/Login.tsx', 'w') as f:
    f.write(newcontent)
    print("Replaced successfully!")
