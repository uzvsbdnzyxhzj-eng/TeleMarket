import re

with open('src/Login.tsx', 'r') as f:
    content = f.read()

pattern_to_remove = r"\{\/\*\s*Detail Facebook \& Reseller\s*\*\/\}.*?(?=<div className=\"mt-16 flex justify-center)"

replacement = """
          {/* How it Works section */}
          <div className="pt-24">
             <div className="text-center mb-16">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                   How Does <span className="text-[#16a34a]">TeleMarket</span> Work?
                 </h2>
                 <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed sm:text-lg">
                   TeleMarket helps you grow your social media with real, fast, and trusted services. Here’s how it works in just 7 easy steps.
                 </p>
             </div>

             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { step: '01', title: 'Create an Account', icon: UserIcon, desc: 'Sign up on TeleMarket for free. It takes only a few minutes and gives you full access to our panel.' },
                  { step: '02', title: 'Add Funds', icon: DollarSign, desc: 'Use safe payment methods like PayPal, cards, or local wallets. We support global payments seamlessly.' },
                  { step: '03', title: 'Browse Services', icon: Search, desc: 'Look through our wide list of SMM services. We offer likes, followers, views, and more for all major platforms.' },
                  { step: '04', title: 'Choose What You Need', icon: CheckSquare, desc: 'Pick the service you want. Our panel offers the cheapest SMM panel prices with full details listed for each service.' },
                  { step: '05', title: 'Place Your Order', icon: ShoppingCart, desc: 'Enter the required information and submit your order. Our system is user-friendly and works 24/7.' },
                  { step: '06', title: 'Get Fast Results', icon: TrendingUp, desc: 'Orders start quickly—most within minutes. TeleMarket is known as the fastest and most reliable SMM panel.' },
                  { step: '07', title: 'Order and Unwind', icon: Coffee, desc: 'With your order placed, relax! Just sit back and let us do the work while you watch your business expand.' },
                ].map((item, idx) => (
                   <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-100/50 hover:-translate-y-2 hover:border-green-200 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      <div className="w-20 h-20 rounded-[28px] bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center mb-6 shadow-sm transform group-hover:scale-110 transition-transform duration-500 relative z-10 border border-green-100">
                         <item.icon className="w-10 h-10" />
                      </div>
                      <div className="absolute top-4 left-6 text-7xl font-black text-gray-50/80 group-hover:text-green-50/50 transition-colors z-0 select-none tracking-tighter">
                         {item.step}
                      </div>
                      <h4 className="font-black text-gray-900 mb-3 text-xl relative z-10">{item.title}</h4>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed relative z-10">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>

"""

newcontent = re.sub(pattern_to_remove, replacement, content, flags=re.DOTALL)

with open('src/Login.tsx', 'w') as f:
    f.write(newcontent)
    print("Replaced successfully!")
