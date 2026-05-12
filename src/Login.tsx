import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, auth } from './firebase';
import { Mail, Lock, User as UserIcon, CheckSquare, Square, ShoppingCart, Cloud, Users, Trophy, Facebook, Instagram, Twitter, Video, Send, TrendingUp, DollarSign, Clock, Eye, Youtube, MessageCircle, MessageSquare, Ghost, Pin, Linkedin, Gamepad2, Coffee, HelpCircle, Twitch, Tv, Music, Headphones, Radio, Disc, PlaySquare, Crosshair, Target, Swords, Play, Heart, ShoppingBag, MapPin, Globe, Search, Mic, Citrus, Speaker } from 'lucide-react';
import { Language } from './i18n';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { TelemarketLogo } from './App';


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
          <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
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
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentIndex === idx ? 'bg-[#16a34a] w-8' : 'bg-gray-300'}`}
                />
             ))}
          </div>
       </div>
    </div>
  );
}

export default function Login({ lang, setLang, onBack, initialMode = 'login' }: { lang: Language, setLang: (l: Language) => void, onBack: () => void, initialMode?: 'login' | 'signup' | 'reset' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      localStorage.removeItem("skip_auto_login");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-in method is disabled. Please enable Google Sign-In or Email/Password in your Firebase Console.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (mode === 'signup') {
      if (!fullName) {
        setError('Please provide your full name');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
        setMode('login');
        setError('Account created securely! You are now signed in.');
        localStorage.removeItem("skip_auto_login");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.removeItem("skip_auto_login");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Please check your credentials and try again.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden font-sans" style={{ background: 'linear-gradient(to bottom, #ffffff, #F0FDF4)' }}>
      {/* Geometric Background Lines */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(22,163,74,0.5) 49%, rgba(22,163,74,0.5) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(22,163,74,0.5) 49%, rgba(22,163,74,0.5) 51%, transparent 52%)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <TelemarketLogo className="h-8 text-[#16a34a]" />
        </div>
        <button className="p-2 border-2 border-gray-200 rounded-lg bg-white shadow-sm flex flex-col gap-1.5 focus:outline-none">
          <span className="w-5 h-0.5 bg-gray-800"></span>
          <span className="w-5 h-0.5 bg-gray-800"></span>
          <span className="w-5 h-0.5 bg-gray-800"></span>
        </button>
      </header>

      <div className="relative z-10 flex flex-col max-w-lg mx-auto px-4 py-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4">
            Best & <span className="text-[#16a34a]">Cheap Provider</span> for Growth
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            TeleMarket is the most affordable SMM Panel and Marketplace, empowering your business to scale instantly. We offer <strong className="text-gray-900">20,000+ top-tier services</strong> across <strong className="text-gray-900">100+ categories</strong>—spanning social media growth, digital products, Telegram accounts, followers, likes, and more. Used worldwide, we deliver lightning-fast, high-quality results.
          </p>
        </div>

        {/* Right Side -> Form */}
        <div className="w-full relative">
          <div className="bg-transparent">
            {error && (
              <div className="bg-white/90 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-200 shadow-sm backdrop-blur-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <form onSubmit={mode === 'reset' ? handleResetPassword : handleEmailAuth} className="space-y-4">
              
              <AnimatePresence mode="popLayout">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] sm:text-base outline-none transition-all shadow-sm font-medium text-gray-800 placeholder:text-gray-500"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={mode === 'signup'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-[#16a34a]" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] sm:text-base outline-none transition-all shadow-sm font-medium text-gray-800 placeholder:text-gray-500"
                  placeholder="Username or Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode !== 'reset' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#16a34a]" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] sm:text-base outline-none transition-all shadow-sm font-medium text-gray-800 placeholder:text-gray-500"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between mt-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe ? (
                      <CheckSquare className="w-5 h-5 text-[#16a34a] bg-white rounded" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 bg-white rounded" />
                    )}
                    <span className="text-gray-800 font-medium">Remember me</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setMode('reset')} 
                    className="font-medium text-gray-800 hover:text-[#16a34a] transition-colors"
                  >
                    Forgot password ? <span className="block text-right text-[#16a34a] font-bold">Reset</span>
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-lg font-bold text-white bg-[#16a34a] hover:bg-[#15803d] transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Sign up' : 'Reset Password'
                  )}
                </button>
              </div>

              {mode !== 'reset' && (
                <>
                  <div className="mt-4 flex justify-center w-full max-w-[280px] mx-auto">
                     <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border-[1.5px] border-gray-800 rounded-lg shadow-sm text-gray-800 font-bold hover:bg-gray-50 transition-all focus:outline-none"
                      >
                        <span className="w-6 h-6 bg-[#D84B37] rounded-full text-white flex items-center justify-center font-bold text-sm">G</span>
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-sm">Sign in with Google</span>
                        </div>
                        <svg className="ml-auto w-4 h-4" viewBox="0 0 24 24">
                          <path d="M12.0003 12.2536V15.7486H17.7603C17.5143 16.8926 16.8363 18.0686 15.6543 18.8486L15.6323 18.9916L18.7323 21.3656L18.9473 21.3866C20.8983 19.5986 22.0003 16.9256 22.0003 13.8836C22.0003 13.3136 21.9483 12.7736 21.8483 12.2536H12.0003Z" fill="#4285F4"/>
                          <path d="M12.0003 21.9996C14.8143 21.9996 17.1753 21.0856 18.9473 19.5396L15.6543 17.0006C14.6973 17.6526 13.4483 18.0496 12.0003 18.0496C9.28135 18.0496 6.97435 16.2486 6.13635 13.8296L5.99835 13.8416L2.76635 16.3146L2.71835 16.4446C4.43135 19.8076 7.93535 21.9996 12.0003 21.9996Z" fill="#34A853"/>
                          <path d="M6.13642 13.8292C5.91842 13.1892 5.79442 12.5102 5.79442 11.8102C5.79442 11.1102 5.91842 10.4312 6.13042 9.79123L6.12442 9.63823L2.83642 7.10823L2.71842 7.17623C1.98642 8.65123 1.57642 10.1832 1.57642 11.8102C1.57642 13.4372 1.98642 14.9692 2.71842 16.4442L6.13642 13.8292Z" fill="#FBBC05"/>
                          <path d="M12.0003 5.57065C13.5353 5.57065 14.9083 6.09265 15.9913 7.04265L19.0143 4.07265C17.1683 2.37965 14.8083 1.62065 12.0003 1.62065C7.93535 1.62065 4.43135 3.81265 2.71835 7.17665L6.13035 9.79165C6.97435 7.37265 9.28135 5.57065 12.0003 5.57065Z" fill="#EA4335"/>
                        </svg>
                      </button>
                  </div>

                  <div className="mt-8 text-center pb-2">
                    <p className="text-gray-700 font-medium text-lg">
                      {mode === 'login' ? "Don't Have an Account? " : "Already have an account? "}
                      <button 
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="font-bold text-[#16a34a] hover:underline whitespace-nowrap"
                      >
                        {mode === 'login' ? 'Signup Now' : 'Sign In Now'}
                      </button>
                    </p>
                  </div>
                </>
              )}

              {mode === 'reset' && (
                <div className="mt-6 text-center">
                   <button 
                      type="button" 
                      onClick={() => setMode('login')} 
                      className="font-bold text-[#16a34a] hover:underline"
                   >
                      Back to Login
                   </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Render the Hero Image Section from screenshot */}
        <div className="my-8 flex justify-center w-full relative">
           <div className="relative w-[320px] h-[380px] sm:w-[450px] sm:h-[500px] flex items-end justify-center">
              {/* Green Backing Shape with stripes */}
              <div className="absolute inset-x-4 sm:inset-x-8 top-16 bottom-0 bg-[#16a34a] rounded-t-[60px] sm:rounded-t-[80px] rounded-b-[30px] overflow-hidden pointer-events-none">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 2px, transparent 2px, transparent 40px)' }} />
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD700 0, #FFD700 2px, transparent 2px, transparent 40px)' }} />
              </div>

              {/* Placeholder image for user to replace */}
              <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000" 
                 alt="SMM Hero" 
                 className="absolute bottom-0 w-[95%] h-[95%] object-cover object-top rounded-b-[30px] pointer-events-none drop-shadow-2xl"
                 style={{ maskImage: 'linear-gradient(to top, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}
              />

              {/* Decorative floating stats container (simulated from screenshot) */}
              <div className="absolute left-[-5px] sm:-left-6 bottom-12 bg-white backdrop-blur rounded-[20px] shadow-2xl border border-gray-100 p-4 w-[160px] sm:w-[200px] z-10">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] sm:text-xs font-bold text-gray-800">Follower Growth</h4>
                  <div className="flex gap-1 text-[#16a34a] opacity-50">
                    <div className="w-4 h-4 border rounded-full flex justify-center items-center text-[8px] border-[#16a34a]">□</div>
                    <div className="w-4 h-4 border rounded-full flex justify-center items-center text-[8px] border-[#16a34a]">↓</div>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900 mb-2 leading-none">16.2K <span className="block text-gray-500 font-bold text-[8px] sm:text-[9px] mt-0.5">New Followers</span></p>
                <div className="flex items-end gap-1.5 h-16 mt-2 relative">
                  {/* Chart guide lines */}
                  <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-0"></div>
                  <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-1/3"></div>
                  <div className="absolute left-0 w-full h-[1px] bg-gray-100 bottom-2/3"></div>
                  <div className="absolute left-0 w-full h-[1px] bg-gray-100 top-0"></div>
                  {/* Bars */}
                  <div className="bg-[#16a34a] w-full h-[40%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[20%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[80%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[30%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[90%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[60%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[100%] rounded-t z-10"></div>
                  <div className="bg-[#16a34a] w-full h-[50%] rounded-t z-10"></div>
                </div>
              </div>

              <div className="absolute right-[-5px] sm:-right-6 bottom-24 bg-white backdrop-blur rounded-[20px] shadow-2xl border border-gray-100 p-3 sm:p-4 w-[170px] sm:w-[240px] z-10">
                <div className="flex items-center gap-2 mb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[12px] font-bold">f</div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-tight">Facebook Real Followers</span>
                  </div>
                  <div className="bg-[#dcfce7] text-[#16a34a] text-[8px] font-bold px-1.5 py-0.5 rounded-full">In Progress</div>
                </div>
                <div className="flex gap-1 mb-2">
                  <div className="h-1.5 bg-[#16a34a] rounded-full w-[35%]"></div>
                  <div className="h-1.5 bg-[#16a34a] rounded-full w-[35%]"></div>
                  <div className="h-1.5 bg-gray-200 rounded-full w-[30%]"></div>
                </div>
                <p className="text-[7px] sm:text-[8px] text-gray-500 font-bold flex justify-between">
                  <span>Start Count: <span className="text-[#16a34a]">25143</span></span>
                  <span>Remain: <span className="text-[#16a34a]">1145</span></span>
                  <span className="opacity-0 sm:opacity-100">Time: <span className="text-[#16a34a]">2 Minutes</span></span>
                </p>
              </div>

              {/* Chat floating button indicator */}
              <div className="absolute right-[-10px] sm:-right-4 -bottom-6 w-14 h-14 bg-[#22c55e] rounded-full shadow-2xl flex items-center justify-center z-20 cursor-pointer hover:scale-105 transition-transform border-[3px] border-white">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
           </div>
        </div>
      </div>

      {/* Global & Fast Marketing Section */}
      <div className="relative z-10 w-full bg-white rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full mb-12">
               <div className="bg-[#16a34a] text-white rounded-[20px] p-5 sm:p-6 text-left shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 text-[#16a34a] shadow-sm">
                     <ShoppingCart className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl sm:text-3xl mb-1 tracking-tight">85,000+</h3>
                  <p className="text-sm text-green-200 font-medium leading-tight">Order Completed</p>
               </div>
               
               <div className="bg-[#16a34a] text-white rounded-[20px] p-5 sm:p-6 text-left shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 text-[#16a34a] shadow-sm">
                     <Cloud className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl sm:text-3xl mb-1 tracking-tight">20,000+</h3>
                  <p className="text-sm text-green-200 font-medium leading-tight">Active Services</p>
               </div>

               <div className="bg-[#16a34a] text-white rounded-[20px] p-5 sm:p-6 text-left shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 text-[#16a34a] shadow-sm">
                     <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl sm:text-3xl mb-1 tracking-tight">12,500+</h3>
                  <p className="text-sm text-green-200 font-medium leading-tight">Active Users</p>
               </div>

               <div className="bg-[#16a34a] text-white rounded-[20px] p-5 sm:p-6 text-left shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 text-[#16a34a] shadow-sm">
                     <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl sm:text-3xl mb-1 tracking-tight">#1</h3>
                  <p className="text-sm text-green-200 font-medium leading-tight">Smm Panel<br/>World Wide</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full border-t border-gray-100 pt-10">
               <div className="bg-gray-50 rounded-[20px] p-6 text-center border border-gray-100 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4">
                     <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Worldwide Access</h3>
                  <p className="text-sm text-gray-600">Available globally. Anyone, from any country, can use our platform easily.</p>
               </div>
               
               <div className="bg-gray-50 rounded-[20px] p-6 text-center border border-gray-100 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4">
                     <span className="text-2xl">💳</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Multiple Payments</h3>
                  <p className="text-sm text-gray-600">Pay securely using Crypto, Visa, Mastercard, and Mobile Banking.</p>
               </div>

               <div className="bg-gray-50 rounded-[20px] p-6 text-center border border-gray-100 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4">
                     <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">20K+ Services</h3>
                  <p className="text-sm text-gray-600">Over 100+ categories from Social Media to Digital Products, all delivered fast.</p>
               </div>
            </div>
        </div>
      </div>

      {/* Deep Dive Content Sections */}
      <div className="relative z-10 w-full bg-[#f8fafc] py-20 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto space-y-24">
          
          {/* Why TeleMarket */}
          <div className="space-y-6 text-center sm:text-left sm:flex sm:gap-12 sm:items-center">
             <div className="sm:w-1/2">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                  Why TeleMarket is the <span className="text-[#16a34a]">Best SMM Panel</span>
                </h2>
                <div className="w-16 h-1.5 bg-[#16a34a] rounded-full mx-auto sm:mx-0 mb-6"></div>
                <p className="text-gray-600 leading-relaxed">
                  TeleMarket is not only an SMM panel, it’s your ally on the road to dominating social media. Our company aims based on three principles: reliability, affordability, and exceptional customer service. 
                </p>
             </div>
             <div className="sm:w-1/2 space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <p className="text-gray-600 leading-relaxed text-sm">
                     Unlike other providers, TeleMarket gives preference to the long-term outcome of the client’s business. We ensure that our users achieve sustainable growth by providing services that will assist in establishing a strong and active community.
                   </p>
                </div>
                <div className="bg-[#16a34a] p-6 rounded-2xl shadow-md text-white">
                   <p className="font-medium leading-relaxed mb-4 text-sm">
                     That is why, when choosing TeleMarket, you do not just buy the service; you invest in cooperation with our company to achieve your social media objectives.
                   </p>
                   <button 
                     onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     className="bg-white text-[#16a34a] px-5 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-shadow"
                   >
                     Signup Now
                   </button>
                </div>
             </div>
          </div>

          {/* Basics border separated */}
          <div className="grid sm:grid-cols-2 gap-12 pt-16 border-t border-gray-200">
             <div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Basics of SMM panels</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">
                  SMM panels, as their name implies, provide growth services for social media profiles and can be adjusted to different types of users: from single influencers to large brands and businesses.
                </p>
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">What is an SMM Panel?</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">
                  An SMM (Social Media Marketing) panel is an internet marketing service that offers many social marketing services for cash. It is a service to purchase traffic for your Instagram, Facebook, Twitter, YouTube, TikTok, or any other account. 
                </p>
                <p className="text-gray-600 leading-relaxed text-sm">
                  SMM panels work as intermediary platforms that gather a network of services that can perform the bought services for the clients using automated systems and networks.
                </p>
             </div>
          </div>

          {/* Services Tailored Grid */}
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
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${social.bg} ${social.color} flex items-center justify-center mb-2 sm:mb-3`}>
                         <social.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="font-bold text-gray-800 text-xs sm:text-sm text-center leading-tight truncate w-full">{social.name}</span>
                   </div>
                ))}
             </div>
          </div>

                    <TestimonialSlider />

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
          
          <div className="mt-16 flex justify-center pb-20">
                <button 
                  onClick={() => { setMode('signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-[#16a34a] text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-green-600/30 hover:scale-105 hover:bg-[#15803d] transition-all"
                >
                  Signup Now
                </button>
             </div>
        </div>
      </div>
    </div>
  );
}

