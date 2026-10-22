import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, CheckCircle2, Shield, LogOut, User as UserIcon } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    firebaseUser,
    loginWithGoogle,
    logoutUser,
    isFirebaseLoading,
    lang
  } = useStore();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E7E2DA] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-linear-to-b from-[#FAF8F5] to-[#F3EFEA] border-b border-[#E7E2DA]">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#8C6D46]/10 text-[#8C6D46]">
              DEEZ Authentication & Cloud Sync
            </span>
          </div>
          <h2 className="text-xl font-serif-luxury font-bold text-[#1C1917]">
            {firebaseUser ? (lang === 'ur' ? 'آپ کا اکاؤنٹ' : 'Your Account') : (lang === 'ur' ? 'سائن ان کریں' : 'Sign in to DEEZ')}
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {firebaseUser
              ? (lang === 'ur' ? 'آپ کا ڈیٹا کلاؤڈ ڈیٹابیس سے محفوظ طور پر جڑا ہوا ہے' : 'Your session is synced with Firebase Firestore database.')
              : (lang === 'ur' ? 'آرڈرز اور پسندیدہ پراڈکٹس کو کلاؤڈ میں محفوظ رکھنے کے لیے سائن ان کریں' : 'Sign in to save your orders, profile, and track deliveries across devices.')}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {firebaseUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-[#E7E2DA]">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full object-cover border border-[#8C6D46]/30 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#8C6D46]/15 flex items-center justify-center text-[#8C6D46] font-bold">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-[#1C1917] truncate">
                      {firebaseUser.displayName || 'DEEZ Customer'}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 truncate">{firebaseUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Firebase Auth Verified
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Database Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Firestore Cloud Connected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">User ID:</span>
                  <span className="font-mono text-[10px] text-stone-700 truncate max-w-[180px]">{firebaseUser.uid}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  logoutUser();
                  setIsAuthModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-medium text-sm hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
                <span>{lang === 'ur' ? 'لاگ آؤٹ' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={loginWithGoogle}
                disabled={isFirebaseLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-[#DDD6CC] hover:bg-stone-50 hover:border-stone-400 text-stone-800 font-medium text-sm shadow-xs transition-all cursor-pointer group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-semibold text-stone-900 group-hover:text-black">
                  {lang === 'ur' ? 'گوگل سے لاگ ان کریں' : 'Continue with Google'}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-stone-200"></div>
                <span className="shrink mx-3 text-stone-400 text-xs uppercase tracking-wider">
                  {lang === 'ur' ? 'یا' : 'Cloud Persistence'}
                </span>
                <div className="grow border-t border-stone-200"></div>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#8C6D46] shrink-0 mt-0.5" />
                <div className="text-[12px] text-stone-700 leading-relaxed">
                  <p className="font-medium text-[#1C1917]">
                    {lang === 'ur' ? 'محفوظ کلاؤڈ ڈیٹا بیس' : 'Google Cloud Firestore Storage'}
                  </p>
                  <p className="text-stone-500 mt-0.5">
                    {lang === 'ur'
                      ? 'آپ کے تمام پراڈکٹس، ری سیلر ڈیٹا اور آرڈرز خود بخود فائر بیس میں محفوظ رہتے ہیں۔'
                      : 'All products, resellers, catalog updates, and customer orders are permanently persisted in Firestore.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
