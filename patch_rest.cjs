const fs = require('fs');
let code = fs.readFileSync('src/Login.tsx', 'utf8');

const targetStr = `          {/* Services Tailored Grid */}
          <div className="pt-16 border-t border-gray-200 text-center">
             <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
               Our Cost-effective Services Tailored to Your Needs
             </h2>
             <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
               Our social media marketing services at TeleMarket are cheap and give you the results you have always wanted. The strong foundation of our platform is the principles of quality, reliability, and satisfaction of our customers.
             </p>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {[ 
                  { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { name: 'TikTok', icon: Video, color: 'text-black', bg: 'bg-gray-200' },
                  { name: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
                  { name: 'X/Twitter', icon: Twitter, color: 'text-gray-900', bg: 'bg-gray-100' },
                  { name: 'Telegram', icon: Send, color: 'text-sky-500', bg: 'bg-sky-50' },
                  { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
                  { name: 'Threads', icon: MessageSquare, color: 'text-black', bg: 'bg-gray-100' },
                  { name: 'Snapchat', icon: Ghost, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                  { name: 'Pinterest', icon: Pin, color: 'text-red-600', bg: 'bg-red-50' },
                  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
                  { name: 'Discord', icon: Gamepad2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { name: 'Reddit', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Tumblr', icon: Coffee, color: 'text-slate-800', bg: 'bg-slate-100' },
                  { name: 'Quora', icon: HelpCircle, color: 'text-red-700', bg: 'bg-red-50' },
                  { name: 'Twitch', icon: Twitch, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { name: 'Kick', icon: Tv, color: 'text-green-500', bg: 'bg-green-50' },
                  { name: 'Spotify', icon: Music, color: 'text-green-500', bg: 'bg-green-50' },
                  { name: 'SoundCloud', icon: Headphones, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Audiomack', icon: Music, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { name: 'Deezer', icon: Radio, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { name: 'Tidal', icon: Disc, color: 'text-black', bg: 'bg-gray-200' },
                  { name: 'Vimeo', icon: PlaySquare, color: 'text-blue-400', bg: 'bg-blue-50' },
                  { name: 'Free Fire', icon: Crosshair, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { name: 'PUBG Mobile', icon: Target, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { name: 'Mobile Legends', icon: Swords, color: 'text-red-600', bg: 'bg-red-50' },
                  { name: 'Kwai', icon: Play, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Likee', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
                  { name: 'VK', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { name: 'OK.ru', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Lemon 8', icon: Citrus, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                  { name: 'Coub', icon: Speaker, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { name: 'Shopee', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { name: 'Lazada', icon: ShoppingCart, color: 'text-indigo-800', bg: 'bg-indigo-50' },
                  { name: 'Google', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
                  { name: 'Traffic', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { name: 'Yandex', icon: Search, color: 'text-red-600', bg: 'bg-red-50' },
                  { name: 'Reverbnation', icon: Mic, color: 'text-gray-800', bg: 'bg-gray-200' },
                ].map((social, idx) => (
                   <div key={idx} className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer hover:-translate-y-1">
                      <div className=\`w-10 h-10 sm:w-12 sm:h-12 rounded-full \${social.bg} \${social.color} flex items-center justify-center mb-2 sm:mb-3\`>
                         <social.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="font-bold text-gray-800 text-xs sm:text-sm text-center leading-tight truncate w-full">{social.name}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Detail Facebook & Reseller */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                   <Facebook className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Facebook Services</h3>
             </div>
             <p className="text-gray-600 leading-relaxed text-sm mb-6">
               If you want your Facebook posts to reach more people, our Facebook SMM Panel can help you get better results. We start by selecting the right audience based on their interests and online behavior. This helps make sure your posts reach people who are more likely to engage. By targeting the right users, your content has a higher chance of getting likes, comments, and shares.
             </p>
             <p className="text-gray-600 leading-relaxed text-sm">
               We also offer page improvement services that help your brand show up better. To make your page look more active, we use smart strategies like mock interactions. These help increase likes, shares, and comments to grow your organic reach. Choose our trusted Facebook SMM Panel to grow your business.
             </p>

             <div className="mt-12 pt-12 border-t border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-4">TeleMarket’s Reseller Opportunities</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  TeleMarket is an outstanding option for everyone who wants to start and develop a successful business. As a TeleMarket reseller, you acquire a vast array of our excellent and affordable social media marketing services.
                </p>
             </div>
          </div>

          {/* Why Choose SMM Panels grid */}
          <div className="pt-12">
             <h2 className="text-3xl font-black text-gray-900 text-center tracking-tight mb-12">
               Why Choose SMM Panels for Social Media Growth?
             </h2>
             <div className="grid sm:grid-cols-2 gap-8">
                {[ 
                  { title: 'Rapid Growth', icon: TrendingUp, desc: 'Useful for companies or personalities that want to make a strong start in social networks. Having more people interact gives an authoritative feel.' },
                  { title: 'Cost-Effective Solution', icon: DollarSign, desc: 'Relatively cheaper as compared to other forms of advertising. You can get great results with little money, perfect for a small marketing budget.' },
                  { title: 'Time-Saving', icon: Clock, desc: 'SMM panels help perform some tasks automatically, saving time so you can invest it in meaningful content production.' },
                  { title: 'Improved Social Proof', icon: Users, desc: 'High interaction rates improve social proof tremendously. Leads to more trust and credibility from prospecting customers.' },
                  { title: 'Increased Visibility', icon: Eye, desc: 'Increases the number of people interested in your posts and can positively affect algorithm ranking to help new people find your profile.' }
                ].map((feature, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                         <feature.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-black text-gray-900 mb-2">{feature.title}</h4>
                         <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-16 flex justify-center pb-20">
                <button 
                  onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-[#16a34a] text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-green-600/30 hover:scale-105 hover:bg-[#15803d] transition-all"
                >
                  Signup Now
                </button>
             </div>
          </div>`;

const replacement = `          {/* New Designed Container for the Rest of the Content */}
          <div className="relative -mx-4 px-4 sm:-mx-8 sm:px-8 py-16 sm:py-24 bg-gradient-to-br from-[#f0fdf4] via-green-50 to-white rounded-[40px] shadow-sm border border-green-100 overflow-hidden mt-16">
             {/* Decorative Background Elements */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                 <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse hidden sm:block"></div>
                 <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#16a34a] rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
                 <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-green-300/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
             </div>

             <div className="relative z-10 max-w-4xl mx-auto space-y-24">
                
                {/* Services Tailored Grid */}
                <div className="text-center">
                   <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                     Our Cost-effective Services Tailored to Your Needs
                   </h2>
                   <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
                     Our social media marketing services at TeleMarket are cheap and give you the results you have always wanted. The strong foundation of our platform is the principles of quality, reliability, and satisfaction of our customers.
                   </p>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-h-[600px] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                      {[ 
                        { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-white shadow' },
                        { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-white shadow' },
                        { name: 'TikTok', icon: Video, color: 'text-black', bg: 'bg-white shadow' },
                        { name: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-white shadow' },
                        { name: 'X/Twitter', icon: Twitter, color: 'text-gray-900', bg: 'bg-white shadow' },
                        { name: 'Telegram', icon: Send, color: 'text-sky-500', bg: 'bg-white shadow' },
                        { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500', bg: 'bg-white shadow' },
                        { name: 'Threads', icon: MessageSquare, color: 'text-black', bg: 'bg-white shadow' },
                        { name: 'Snapchat', icon: Ghost, color: 'text-yellow-500', bg: 'bg-white shadow' },
                        { name: 'Pinterest', icon: Pin, color: 'text-red-600', bg: 'bg-white shadow' },
                        { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-white shadow' },
                        { name: 'Discord', icon: Gamepad2, color: 'text-indigo-500', bg: 'bg-white shadow' },
                        { name: 'Reddit', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-white shadow' },
                        { name: 'Tumblr', icon: Coffee, color: 'text-slate-800', bg: 'bg-white shadow' },
                        { name: 'Quora', icon: HelpCircle, color: 'text-red-700', bg: 'bg-white shadow' },
                        { name: 'Twitch', icon: Twitch, color: 'text-purple-600', bg: 'bg-white shadow' },
                        { name: 'Kick', icon: Tv, color: 'text-green-500', bg: 'bg-white shadow' },
                        { name: 'Spotify', icon: Music, color: 'text-green-500', bg: 'bg-white shadow' },
                        { name: 'SoundCloud', icon: Headphones, color: 'text-orange-500', bg: 'bg-white shadow' },
                        { name: 'Audiomack', icon: Music, color: 'text-yellow-600', bg: 'bg-white shadow' },
                        { name: 'Deezer', icon: Radio, color: 'text-indigo-500', bg: 'bg-white shadow' },
                        { name: 'Tidal', icon: Disc, color: 'text-black', bg: 'bg-white shadow' },
                        { name: 'Vimeo', icon: PlaySquare, color: 'text-blue-400', bg: 'bg-white shadow' },
                        { name: 'Free Fire', icon: Crosshair, color: 'text-orange-600', bg: 'bg-white shadow' },
                        { name: 'PUBG Mobile', icon: Target, color: 'text-yellow-600', bg: 'bg-white shadow' },
                        { name: 'Mobile Legends', icon: Swords, color: 'text-red-600', bg: 'bg-white shadow' },
                        { name: 'Kwai', icon: Play, color: 'text-orange-500', bg: 'bg-white shadow' },
                        { name: 'Likee', icon: Heart, color: 'text-pink-500', bg: 'bg-white shadow' },
                        { name: 'VK', icon: Users, color: 'text-blue-600', bg: 'bg-white shadow' },
                        { name: 'OK.ru', icon: Users, color: 'text-orange-500', bg: 'bg-white shadow' },
                        { name: 'Lemon 8', icon: Citrus, color: 'text-yellow-500', bg: 'bg-white shadow' },
                        { name: 'Coub', icon: Speaker, color: 'text-blue-500', bg: 'bg-white shadow' },
                        { name: 'Shopee', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-white shadow' },
                        { name: 'Lazada', icon: ShoppingCart, color: 'text-indigo-800', bg: 'bg-white shadow' },
                        { name: 'Google', icon: MapPin, color: 'text-green-600', bg: 'bg-white shadow' },
                        { name: 'Traffic', icon: Globe, color: 'text-blue-500', bg: 'bg-white shadow' },
                        { name: 'Yandex', icon: Search, color: 'text-red-600', bg: 'bg-white shadow' },
                        { name: 'Reverbnation', icon: Mic, color: 'text-gray-800', bg: 'bg-white shadow' },
                      ].map((social, idx) => (
                         <div key={idx} className="flex flex-col items-center p-3 sm:p-4 bg-white/60 backdrop-blur-md rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-green-50 hover:shadow-md hover:border-green-200 transition-all cursor-pointer hover:-translate-y-1">
                            <div className=\`w-10 h-10 sm:w-12 sm:h-12 rounded-full \${social.bg} \${social.color} flex items-center justify-center mb-2 sm:mb-3\`>
                               <social.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="font-bold text-gray-800 text-xs sm:text-sm text-center leading-tight truncate w-full">{social.name}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Detail Facebook & Reseller */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-100 to-transparent opacity-60 rounded-bl-[100px] pointer-events-none"></div>
                   
                   <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-start">
                      <div className="sm:w-2/3">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                               <Facebook className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Facebook Services</h3>
                         </div>
                         <p className="text-gray-600 leading-relaxed text-sm mb-4">
                           If you want your Facebook posts to reach more people, our Facebook SMM Panel can help you get better results. We start by selecting the right audience based on their interests and online behavior. This helps make sure your posts reach people who are more likely to engage. By targeting the right users, your content has a higher chance of getting likes, comments, and shares.
                         </p>
                         <p className="text-gray-600 leading-relaxed text-sm">
                           We also offer page improvement services that help your brand show up better. To make your page look more active, we use smart strategies like mock interactions. These help increase likes, shares, and comments to grow your organic reach. Choose our trusted Facebook SMM Panel to grow your business.
                         </p>
                      </div>
                      
                      <div className="sm:w-1/3 bg-[#16a34a] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-6 sm:mt-0">
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                         <h3 className="text-lg font-black mb-3">TeleMarket’s Reseller</h3>
                         <p className="text-green-50 leading-relaxed text-sm">
                           TeleMarket is an outstanding option for everyone who wants to start and develop a successful business. As a TeleMarket reseller, you acquire a vast array of our excellent and affordable social media marketing services.
                         </p>
                      </div>
                   </div>
                </div>

                {/* Why Choose SMM Panels grid */}
                <div className="pt-4">
                   <h2 className="text-3xl font-black text-gray-900 text-center tracking-tight mb-12">
                     Why Choose SMM Panels for Social Media Growth?
                   </h2>
                   <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                      {[ 
                        { title: 'Rapid Growth', icon: TrendingUp, desc: 'Useful for companies or personalities that want to make a strong start in social networks. Having more people interact gives an authoritative feel.' },
                        { title: 'Cost-Effective Solution', icon: DollarSign, desc: 'Relatively cheaper as compared to other forms of advertising. You can get great results with little money, perfect for a small marketing budget.' },
                        { title: 'Time-Saving', icon: Clock, desc: 'SMM panels help perform some tasks automatically, saving time so you can invest it in meaningful content production.' },
                        { title: 'Improved Social Proof', icon: Users, desc: 'High interaction rates improve social proof tremendously. Leads to more trust and credibility from prospecting customers.' },
                        { title: 'Increased Visibility', icon: Eye, desc: 'Increases the number of people interested in your posts and can positively affect algorithm ranking to help new people find your profile.' }
                      ].map((feature, idx) => (
                         <div key={idx} className="bg-white/80 backdrop-blur p-6 rounded-[24px] shadow-sm border border-white hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 h-full relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 w-24 h-24 bg-green-50 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#16a34a] text-white flex items-center justify-center shadow-sm relative z-10">
                               <feature.icon className="w-5 h-5" />
                            </div>
                            <div className="relative z-10">
                               <h4 className="font-black text-gray-900 mb-2">{feature.title}</h4>
                               <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                   
                   <div className="mt-16 flex justify-center pb-8">
                      <button 
                        onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-[#16a34a] text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl shadow-green-600/30 hover:scale-105 hover:bg-[#15803d] transition-all flex items-center gap-2 group"
                      >
                        Signup Now
                        <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>

             </div>
          </div>`;

fs.writeFileSync('src/Login.tsx', code.replace(targetStr, replacement));
console.log("Replaced!");
