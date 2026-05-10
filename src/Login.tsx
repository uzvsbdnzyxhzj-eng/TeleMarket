import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, auth } from './firebase';
import { Globe, ArrowLeft, Bot, Mail, Lock, User } from 'lucide-react';
import { t, Language } from './i18n';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { TelemarketLogo } from './App';

export default function Login({ lang, setLang, onBack, initialMode = 'login' }: { lang: Language, setLang: (l: Language) => void, onBack: () => void, initialMode?: 'login' | 'signup' | 'reset' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      localStorage.removeItem("skip_auto_login");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-in method is disabled. Please enable Google Sign-In or Email/Password in your Firebase Console (Authentication -> Sign-in method).');
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
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        return;
      }
      // Assuming any non-alphanumeric character is a special character
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError('Password must contain at least one special character');
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
        // Remove immediate signout and email verification block to make signup instant
        setMode('login');
        setError('Account created securely! You are now signed in.');
        localStorage.removeItem("skip_auto_login");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.removeItem("skip_auto_login");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled. Please enable it in your Firebase Console (Authentication -> Sign-in method).');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('Your password is too weak. Please use a stronger password with at least 8 characters, upper/lowercase, and special characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later or reset your password.');
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
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled. Please enable it in your Firebase Console.');
      } else {
        setError(err.message || 'Failed to send reset email');
      }
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
          <option value="bn">Bengali (বাংলা)</option>
          <option value="hi">Hindi (हिन्दी)</option>
          <option value="es">Spanish (Español)</option>
          <option value="ar">Arabic (العربية)</option>
          <option value="ru">Russian (Русский)</option>
          <option value="pt">Portuguese (Português)</option>
          <option value="fr">French (Français)</option>
          <option value="de">German (Deutsch)</option>
          <option value="zh">Chinese (中文)</option>
          <option value="ja">Japanese (日本語)</option>
          <option value="ko">Korean (한국어)</option>
          <option value="tr">Turkish (Türkçe)</option>
          <option value="id">Indonesian (Bahasa Indonesia)</option>
          <option value="ur">Urdu (اردو)</option>
          <option value="it">Italian (Italiano)</option>
          <option value="nl">Dutch (Nederlands)</option>
        </select>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <TelemarketLogo className="h-16 text-[#2AABEE] mb-4" />
        <p className="mt-2 text-center text-sm text-gray-600 font-medium whitespace-pre-wrap">
          {mode === 'login' ? 'Sign in to access your dashboard, top up funds, and buy Telegram accounts.' : mode === 'signup' ? 'Create an account to start buying and selling on TeleMarket.' : 'Reset your password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-100 transition-all">
              {error}
            </div>
          )}
          
          <form onSubmit={mode === 'reset' ? handleResetPassword : handleEmailAuth} className="space-y-4 mb-6">
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

            {mode !== 'reset' && (
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
                {mode === 'login' && (
                  <div className="mt-2 flex justify-end">
                    <button type="button" onClick={() => setMode('reset')} className="text-xs font-semibold text-[#2AABEE] hover:text-[#1C93D4]">
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#2AABEE] hover:bg-[#1C93D4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE] transition-all disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
            
            {mode !== 'reset' && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE]"
                  >
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 12.2536V15.7486H17.7603C17.5143 16.8926 16.8363 18.0686 15.6543 18.8486L15.6323 18.9916L18.7323 21.3656L18.9473 21.3866C20.8983 19.5986 22.0003 16.9256 22.0003 13.8836C22.0003 13.3136 21.9483 12.7736 21.8483 12.2536H12.0003Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12.0003 21.9996C14.8143 21.9996 17.1753 21.0856 18.9473 19.5396L15.6543 17.0006C14.6973 17.6526 13.4483 18.0496 12.0003 18.0496C9.28135 18.0496 6.97435 16.2486 6.13635 13.8296L5.99835 13.8416L2.76635 16.3146L2.71835 16.4446C4.43135 19.8076 7.93535 21.9996 12.0003 21.9996Z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.13642 13.8292C5.91842 13.1892 5.79442 12.5102 5.79442 11.8102C5.79442 11.1102 5.91842 10.4312 6.13042 9.79123L6.12442 9.63823L2.83642 7.10823L2.71842 7.17623C1.98642 8.65123 1.57642 10.1832 1.57642 11.8102C1.57642 13.4372 1.98642 14.9692 2.71842 16.4442L6.13642 13.8292Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.0003 5.57065C13.5353 5.57065 14.9083 6.09265 15.9913 7.04265L19.0143 4.07265C17.1683 2.37965 14.8083 1.62065 12.0003 1.62065C7.93535 1.62065 4.43135 3.81265 2.71835 7.17665L6.13035 9.79165C6.97435 7.37265 9.28135 5.57065 12.0003 5.57065Z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                </div>
              </div>
            )}
          </form>

          {mode === 'reset' && (
            <div className="mb-6 flex justify-center">
               <button type="button" onClick={() => setMode('login')} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                  Back to Login
               </button>
            </div>
          )}
          
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
