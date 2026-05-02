import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, auth } from './firebase';
import { Globe, ArrowLeft, Bot, Mail, Lock, User } from 'lucide-react';
import { t, Language } from './i18n';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { TelemarketLogo } from './App';

export default function Login({ lang, setLang, onBack }: { lang: Language, setLang: (l: Language) => void, onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
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
    if (mode === 'signup' && !fullName) {
      setError('Please provide your full name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#2AABEE]/10 to-transparent"></div>

      <button 
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white shadow-sm px-3 py-2 rounded-lg border border-gray-200 z-10 transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold">Back</span>
      </button>

      <div className="absolute top-4 right-4 flex items-center gap-1 text-gray-700 bg-white shadow-sm px-2 py-1 flex-row rounded-lg border border-gray-200 z-10">
        <Globe className="w-4 h-4" />
        <select 
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-transparent border-none outline-none cursor-pointer text-sm font-bold focus:ring-0"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="es">Español (Spanish)</option>
          <option value="ar">العربية (Arabic)</option>
          <option value="ru">Русский (Russian)</option>
          <option value="pt">Português (Portuguese)</option>
          <option value="fr">Français (French)</option>
          <option value="de">Deutsch (German)</option>
          <option value="zh">中文 (Chinese)</option>
          <option value="ja">日本語 (Japanese)</option>
          <option value="ko">한국어 (Korean)</option>
          <option value="tr">Türkçe (Turkish)</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="ur">اردو (Urdu)</option>
        </select>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <TelemarketLogo className="h-16 text-[#2AABEE] mb-4" />
        <p className="mt-2 text-center text-sm text-gray-600 font-medium whitespace-pre-wrap">
          {mode === 'login' ? 'Sign in to access your dashboard, top up funds, and buy Telegram accounts.' : 'Create an account to start buying and selling on TeleMarket.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-100 transition-all">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2AABEE] focus:border-[#2AABEE] sm:text-sm"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2AABEE] focus:border-[#2AABEE] sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2AABEE] focus:border-[#2AABEE] sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#2AABEE] hover:bg-[#1C93D4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE] transition-all disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
              <button
                disabled={loading}
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE] disabled:opacity-70"
              >
                <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                Google
              </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setMode('signup')}
                  className="font-bold text-[#2AABEE] hover:text-[#1C93D4] hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setMode('login')}
                  className="font-bold text-[#2AABEE] hover:text-[#1C93D4] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
