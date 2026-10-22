import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, Menu, X, User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { lang, setLang, t, cartCount, setIsCartOpen, reseller, adminUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2DA]">
      {/* Slim Top Announcement Banner with Upper Corner Language Toggle */}
      <div className="bg-[#1C1917] text-[#FAF8F5] text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-stone-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex-1 text-center sm:text-left font-medium tracking-wide truncate">
            <span>✨ {lang === 'ur' ? 'پورے پاکستان میں کیش آن ڈیلیوری · 3,500 روپے سے زائد پر مفت ڈیلیوری' : 'Free Nationwide Delivery across Pakistan on orders over PKR 3,500 · 100% Cash on Delivery (COD)'}</span>
          </div>

          {/* Upper Corner Language Switch Button */}
          <div className="shrink-0 flex items-center bg-stone-800/90 hover:bg-stone-800 rounded-full p-0.5 border border-stone-700 shadow-xs">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#FAF8F5] text-[#1C1917] shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Switch to English"
            >
              English
            </button>
            <span className="text-stone-600 text-[10px] px-0.5">|</span>
            <button
              type="button"
              onClick={() => setLang('ur')}
              className={`px-2.5 py-0.5 rounded-full font-urdu text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'ur'
                  ? 'bg-[#8C6D46] text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="اردو میں تبدیل کریں"
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <button
          onClick={() => handleNav('/')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-xl sm:text-2xl font-serif-luxury font-bold tracking-tight text-[#1C1917] group-hover:text-[#8C6D46] transition-colors whitespace-nowrap shrink-0">
            DEEZ COSMETICS
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase text-[#8C6D46] font-semibold">
            {lang === 'ur' ? 'خالص پاکستانی برانڈ' : 'PAKISTAN'}
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single Line, 4-5 items) */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium tracking-wide text-stone-700">
          <button
            onClick={() => handleNav('/shop')}
            className={`cursor-pointer hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/shop' ? 'text-[#1C1917] font-semibold underline underline-offset-8 decoration-1 decoration-[#8C6D46]' : ''
            }`}
          >
            {t.navShop}
          </button>

          <button
            onClick={() => handleNav('/track-order')}
            className={`cursor-pointer hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/track-order' ? 'text-[#1C1917] font-semibold underline underline-offset-8 decoration-1 decoration-[#8C6D46]' : ''
            }`}
          >
            {t.navTrackOrder}
          </button>

          <button
            onClick={() => handleNav(reseller ? '/reseller/dashboard' : '/reseller/portal')}
            className={`cursor-pointer hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 ${
              currentRoute.startsWith('/reseller') ? 'text-[#8C6D46] font-semibold underline underline-offset-8 decoration-1 decoration-[#8C6D46]' : ''
            }`}
          >
            {reseller ? `Reseller (${reseller.fullName.split(' ')[0]})` : t.navResellerPortal}
          </button>

          <button
            onClick={() => handleNav('/about')}
            className={`cursor-pointer hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/about' ? 'text-[#1C1917] font-semibold underline underline-offset-8 decoration-1 decoration-[#8C6D46]' : ''
            }`}
          >
            {t.navAbout}
          </button>

          {/* Admin shortcut if logged in */}
          {adminUser && (
            <button
              onClick={() => handleNav('/deez-control')}
              className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Language Switcher & Cart Bag) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#EDE8E0] rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en' ? 'bg-[#FAF8F5] text-[#1C1917] shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ur')}
              className={`px-2 py-1 rounded font-urdu text-[11px] transition-colors ${
                lang === 'ur' ? 'bg-[#FAF8F5] text-[#1C1917] shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              اردو
            </button>
          </div>


          {/* Reseller account icon / quick link */}
          <button
            onClick={() => handleNav(reseller ? '/reseller/dashboard' : '/reseller/portal')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 py-1.5 px-2.5 rounded-lg border border-[#DDD6CC] hover:bg-[#EDE8E0] transition-colors"
            title="DEEZ Reseller Portal"
          >
            <User className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span className="whitespace-nowrap">{reseller ? reseller.referralCode : 'Reseller (5%)'}</span>
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#1C1917] text-[#FAF8F5] hover:bg-[#322E2B] transition-colors py-2 px-3.5 rounded-lg text-xs font-medium"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 text-[#E8D7C8]" />
            <span className="hidden sm:inline whitespace-nowrap">Bag</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center bg-[#8C6D46] text-white text-[10px] font-bold w-5 h-5 rounded-full ml-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-950 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E2DA] bg-[#FAF8F5] px-4 pt-3 pb-6 flex flex-col gap-3 text-sm">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between py-2 border-b border-[#E7E2DA] text-xs">
            <span className="font-medium text-stone-600">Language / زبان:</span>
            <div className="flex items-center bg-[#EDE8E0] rounded-lg p-0.5 font-medium">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded transition-colors ${
                  lang === 'en' ? 'bg-[#FAF8F5] text-[#1C1917] shadow-xs font-semibold' : 'text-stone-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('ur')}
                className={`px-3 py-1 rounded font-urdu transition-colors ${
                  lang === 'ur' ? 'bg-[#8C6D46] text-white shadow-xs font-bold' : 'text-stone-600'
                }`}
              >
                اردو
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNav('/shop')}
            className="text-left py-2 font-medium text-stone-800 hover:text-[#8C6D46]"
          >
            {t.navShop}
          </button>
          <button
            onClick={() => handleNav('/track-order')}
            className="text-left py-2 font-medium text-stone-800 hover:text-[#8C6D46]"
          >
            {t.navTrackOrder}
          </button>
          <button
            onClick={() => handleNav(reseller ? '/reseller/dashboard' : '/reseller/portal')}
            className="text-left py-2 font-medium text-[#8C6D46]"
          >
            {reseller ? `Reseller Dashboard (${reseller.fullName})` : 'Join Reseller Program (5% Commission)'}
          </button>
          <button
            onClick={() => handleNav('/about')}
            className="text-left py-2 font-medium text-stone-800 hover:text-[#8C6D46]"
          >
            {t.navAbout}
          </button>
          <button
            onClick={() => handleNav('/deez-control')}
            className="text-left py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border-t border-[#E7E2DA] pt-3"
          >
            Staff & Admin Panel
          </button>
        </div>
      )}
    </header>
  );
};
