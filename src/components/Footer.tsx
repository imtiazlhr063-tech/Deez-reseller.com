import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  onOpenPolicy: (type: 'shipping' | 'return' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy }) => {
  const { lang, t, storeConfig } = useStore();

  return (
    <footer className="bg-[#1C1917] text-[#EDE8E0] pt-14 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Trust Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-stone-800 text-xs">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#8C6D46] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">{t.nationwideCod}</h4>
              <p className="text-stone-400 mt-0.5">TCS, Trax & Leopards delivery across 250+ Pakistani cities.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8C6D46] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">{t.authenticFormulas}</h4>
              <p className="text-stone-400 mt-0.5">Certified 100% Halal, paraben-free organic botanical extracts.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#8C6D46] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">5% Reseller Network</h4>
              <p className="text-stone-400 mt-0.5">Empowering Pakistani entrepreneurs with verified COD commissions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[#8C6D46] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Hassle-Free Returns</h4>
              <p className="text-stone-400 mt-0.5">7-day replacement warranty on damaged or incorrect items.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="font-serif-luxury text-lg font-bold text-white tracking-wider">DEEZ COSMETICS</h3>
            <p className="text-stone-400 leading-relaxed">
              Crafted in Lahore for South Asian beauty. Blending timeless Kashmiri botanical wisdom with contemporary high-performance cosmetic science.
            </p>
            {lang === 'ur' ? (
              <p className="text-stone-400 font-urdu text-sm">
                دیز کاسمیٹکس — خالص اجزاء، بے مثال نکھار اور قابلِ اعتماد معیار۔
              </p>
            ) : (
              <p className="text-stone-400 text-xs">
                Pure artisanal ingredients, uncompromised radiance, and trusted Pakistani craftsmanship.
              </p>
            )}
          </div>

          {/* Catalog */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white">Collections</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  Saffron Glow Serums
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  Velvet Matte Lipsticks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  Midnight Kohl & Eye Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  Botanical Hydration Creams
                </button>
              </li>
            </ul>
          </div>

          {/* Reseller & Support */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white">Reseller & Support</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('/reseller/portal')} className="hover:text-white text-[#E8D7C8] font-semibold transition-colors cursor-pointer">
                  Join Reseller Program (5% Commission)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors cursor-pointer">
                  Track Cash on Delivery Parcel
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors cursor-pointer">
                  Nationwide Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('return')} className="hover:text-white transition-colors cursor-pointer">
                  Returns & Exchange Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate Head Office */}
          <div className="space-y-2 text-stone-400">
            <h4 className="font-bold uppercase tracking-wider text-white">Head Office</h4>
            <p>Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan</p>
            <p className="text-stone-300 font-mono">WhatsApp: {storeConfig?.whatsappNumber || '03034507537'}</p>
            <p className="text-stone-300">Email: {storeConfig?.supportEmail || 'support@deezcosmetics.pk'}</p>
            <p className="text-[11px] text-stone-500 pt-2">Hours: Mon - Sat, 10:00 AM - 8:00 PM PKT</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} DEEZ Cosmetics Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-stone-300 transition-colors">
              Reseller Terms
            </button>
            <span>·</span>
            <button onClick={() => onOpenPolicy('shipping')} className="hover:text-stone-300 transition-colors">
              COD Terms
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/deez-control')}
              className="text-stone-400 hover:text-stone-200 font-mono transition-colors"
            >
              Control Panel
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
