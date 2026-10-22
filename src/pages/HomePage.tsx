import React, { useState, useEffect } from 'react';
import { Product, CategoryConfig } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Users,
  Percent,
  Star,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Package
} from 'lucide-react';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (route: string) => void;
  onOpenPolicy: (type: 'shipping' | 'return' | 'terms' | 'about') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onNavigate,
  onOpenPolicy
}) => {
  const { lang, t, referralCode, storeConfig } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/public/products'),
        fetch('/api/public/categories')
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error('Failed fetching homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic product groupings loaded from real database
  const transparentSoaps = products.filter(p => p.category === 'transparent-soaps');
  const faceWashAndCleansers = products.filter(p => p.category === 'face-wash' || p.category === 'facial-cleansers');
  const scrubsAndExfoliation = products.filter(p => p.category === 'face-scrubs' || p.category === 'body-scrubs');
  const skincareEssentials = products.filter(p =>
    ['serums', 'face-creams', 'moisturizers', 'toners', 'face-masks', 'sunscreens'].includes(p.category)
  );
  const bodyCare = products.filter(p => ['body-lotions', 'body-wash'].includes(p.category));
  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNewArrival);
  const bundlesAndOffers = products.filter(p =>
    p.isSpecialOffer || p.category === 'combos-bundles' || (p.salePrice && p.salePrice < p.price)
  );

  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work across Pakistan?',
      a: 'We dispatch all parcels using certified courier partners (TCS, Trax Logistics, Leopards Courier). You do not pay anything online; you only pay the exact parcel amount in cash to the delivery rider upon delivery.'
    },
    {
      q: 'How does the DEEZ 5% Reseller Program operate?',
      a: 'Anyone in Pakistan can register for free as a DEEZ reseller. You receive a unique referral link and referral code. When a customer orders through your link, our system attributes 5% of their product subtotal to your account. DEEZ handles order packing, shipping, and cash collection. Once COD is reconciled, your commission becomes confirmed and withdrawable.'
    },
    {
      q: 'What is the minimum withdrawal for reseller earnings?',
      a: 'The minimum payout request is PKR 500. Resellers can withdraw earnings directly to EasyPaisa, JazzCash, or any Pakistani Bank Account.'
    },
    {
      q: 'How long does delivery take?',
      a: 'Major metropolitan hubs (Lahore, Karachi, Islamabad, Rawalpindi) receive parcels within 2 to 3 business days. Other cities and districts typically take 3 to 5 business days.'
    },
    {
      q: 'Are DEEZ products 100% Halal and safe for sensitive skin?',
      a: 'Yes. Every formulation is 100% Halal certified, cruelty-free, and formulated without harsh synthetic bleaches, mercury, or parabens. Ingredients like organic Kashmiri saffron and pure Sidr honey are laboratory-tested.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#F3EFEA] border-b border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8C6D46]">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D46]" />
                <span>{t.heroKicker}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold text-stone-950 leading-[1.12] tracking-tight text-balance">
                {lang === 'ur'
                  ? 'پاکستانی جلد اور موسم کے مطابق خالص شاہکار بیوٹی مصنوعات'
                  : 'Pure Luxury Beauty Formulations Crafted for Pakistani Skin'}
              </h1>

              {lang === 'ur' && (
                <p className="font-urdu text-sm sm:text-base text-stone-700 leading-relaxed max-w-xl">
                  خالص کشمیری زعفران، شفاف گلیسرین صابن، اور قدرتی عرقیات۔ پاکستان کے 250 سے زائد شہروں میں کیش آن ڈیلیوری دستیاب۔
                </p>
              )}

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-6 py-3.5 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>{t.heroCtaShop}</span>
                  <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
                </button>

                <button
                  onClick={() => onNavigate('/reseller/portal')}
                  className="px-5 py-3.5 bg-white hover:bg-[#EDE8E0] text-stone-800 text-xs sm:text-sm font-semibold rounded-xl border border-[#DDD6CC] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Percent className="w-4 h-4 text-[#8C6D46]" />
                  <span>{t.heroCtaReseller}</span>
                </button>
              </div>

              {referralCode && (
                <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-300/80 px-3.5 py-1.5 rounded-lg text-xs text-amber-900">
                  <span className="font-semibold">Reseller Referral Active:</span>
                  <span className="font-mono font-bold">{referralCode}</span>
                </div>
              )}
            </div>

            {/* Right Column: Hero Campaign Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-[#DDD6CC] bg-white group">
                <img
                  src={storeConfig?.heroBannerUrl || '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'}
                  alt="DEEZ Cosmetics Pakistani Luxury Botanicals Campaign"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-[#E8D7C8]">Featured Collection</span>
                    <p className="text-sm font-semibold">Artisanal Transparent Soaps & Saffron Glow Serums</p>
                    <p className="text-xs text-stone-300">100% Cash on Delivery across Pakistan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item Trust Strip */}
        <div className="border-t border-[#E7E2DA] bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-stone-800">
                <Truck className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>Cash on Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800">
                <ShieldCheck className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>100% Halal Certified</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800">
                <Percent className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>5% Reseller Network</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800">
                <Sparkles className="w-4 h-4 text-[#8C6D46] shrink-0" />
                <span>Kashmiri Saffron & Honey</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
              Browse Cosmetics Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4 text-[#8C6D46]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.slice(0, 15).map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/shop?category=${cat.slug}`)}
              className="p-3.5 bg-white rounded-2xl border border-[#E7E2DA] hover:border-[#8C6D46] hover:bg-[#FAF8F5] text-left transition-all duration-200 shadow-2xs group cursor-pointer"
            >
              <p className={`text-xs font-semibold text-stone-900 group-hover:text-[#8C6D46] transition-colors line-clamp-1 ${lang === 'ur' ? 'font-urdu text-sm' : ''}`}>
                {lang === 'ur' && cat.nameUrdu ? cat.nameUrdu : cat.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Transparent Soaps */}
      {transparentSoaps.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Crystal Purity
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Featured Transparent Soaps
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Artisanal plant-based glycerin bars infused with organic honey, saffron, and mountain botanicals.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=transparent-soaps')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Soaps</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transparentSoaps.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Face Wash and Cleansers */}
      {faceWashAndCleansers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Daily Purification
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Face Wash & Facial Cleansers
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Gentle, sulfate-free cleansers designed to remove pollution and oil while protecting natural moisture.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=face-wash')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>View Cleansers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faceWashAndCleansers.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Scrubs and Exfoliation */}
      {scrubsAndExfoliation.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Radiance Polishing
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Scrubs & Exfoliation
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Finely milled natural apricot kernels, walnut, and saffron for gentle bi-weekly skin renewal.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=face-scrubs')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>View Scrubs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrubsAndExfoliation.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Skincare Essentials (Serums & Creams) */}
      {skincareEssentials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Deep Nourishment
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Skincare Essentials (Serums & Creams)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Kashmiri saffron glow elixirs, peptide barrier creams, and hydrating essences.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=serums')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>View Skincare</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skincareEssentials.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Community Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Best Sellers
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=best-sellers')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Best Sellers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 8. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Fresh From Lab
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=new-arrivals')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore New Arrivals</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 9. Bundles & Special Offers */}
      {bundlesAndOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                Curated Gift Sets
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-0.5">
                Bundles & Special Offers
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop?category=special-offers')}
              className="text-xs font-semibold text-stone-700 hover:text-[#8C6D46] flex items-center gap-1 cursor-pointer"
            >
              <span>View Offers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundlesAndOffers.map(prod => (
              <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 10. Why Shop With DEEZ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
            The DEEZ Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            Why Shop with DEEZ Cosmetics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-stone-700">
          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#8C6D46]" />
            <h3 className="font-bold text-sm text-stone-900">100% Halal & Clean</h3>
            <p className="text-stone-500 leading-relaxed">
              Certified Halal formulations with zero animal fats, harsh bleaches, phthalates, or parabens.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-3">
            <Truck className="w-6 h-6 text-[#8C6D46]" />
            <h3 className="font-bold text-sm text-stone-900">Nationwide Cash on Delivery</h3>
            <p className="text-stone-500 leading-relaxed">
              Delivered directly to your door in 250+ cities across all Pakistani provinces with safe cash payment.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-3">
            <Sparkles className="w-6 h-6 text-[#8C6D46]" />
            <h3 className="font-bold text-sm text-stone-900">South Asian Undertones</h3>
            <p className="text-stone-500 leading-relaxed">
              Tailored specifically to resist humidity, warm undertones, and weather conditions in Pakistan.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-3">
            <Package className="w-6 h-6 text-[#8C6D46]" />
            <h3 className="font-bold text-sm text-stone-900">7-Day Replacement Guarantee</h3>
            <p className="text-stone-500 leading-relaxed">
              Hassle-free exchange guarantee on any damaged or unsealed parcel delivered by courier.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Reseller Program Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-12 border border-stone-800 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs uppercase tracking-widest text-[#E8D7C8] font-bold">
                Pakistan Reseller Network
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold leading-tight">
                Earn 5% Commission on Every Order with Zero Upfront Capital
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Register as an official DEEZ reseller. Share products with friends, family, and social media followers. When they order through your link, DEEZ handles fulfillment, collects the cash, and credits your 5% commission directly.
              </p>

              {/* Commission Calculation Examples Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-700/80">
                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Customer Sale (Subtotal):</span>
                    <span className="font-mono text-white font-bold">PKR 500</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-400 pt-2 border-t border-stone-800 mt-2">
                    <span className="font-medium">Your 5% Commission:</span>
                    <span className="font-mono font-bold text-sm">PKR 25</span>
                  </div>
                </div>

                <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-700/80">
                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Customer Sale (Subtotal):</span>
                    <span className="font-mono text-white font-bold">PKR 1,000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-400 pt-2 border-t border-stone-800 mt-2">
                    <span className="font-medium">Your 5% Commission:</span>
                    <span className="font-mono font-bold text-sm">PKR 50</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('/reseller/portal')}
                  className="px-6 py-3 bg-[#FAF8F5] text-[#1C1917] hover:bg-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#8C6D46]" />
                  <span>Register as DEEZ Reseller</span>
                </button>

                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="text-xs text-stone-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Read 5% Commission Terms
                </button>
              </div>
            </div>

            {/* Right Card: Feature Highlights */}
            <div className="lg:col-span-5 bg-stone-900 p-6 rounded-2xl border border-stone-700/60 space-y-4 text-xs">
              <h3 className="font-semibold text-white text-sm">How DEEZ Reseller Works:</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800 text-[#E8D7C8] font-mono font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h4 className="font-medium text-white">Register Free</h4>
                    <p className="text-stone-400">Get your unique Reseller ID and Referral Code immediately.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800 text-[#E8D7C8] font-mono font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h4 className="font-medium text-white">Share on WhatsApp & Social Media</h4>
                    <p className="text-stone-400">1-click WhatsApp share buttons for all products with your referral link.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800 text-[#E8D7C8] font-mono font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h4 className="font-medium text-white">DEEZ Delivers via Cash on Delivery</h4>
                    <p className="text-stone-400">We pack and deliver via TCS/Trax, collecting payment at customer doorstep.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-800 text-[#E8D7C8] font-mono font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h4 className="font-medium text-white">Withdraw Commission</h4>
                    <p className="text-stone-400">Withdraw confirmed commissions directly to EasyPaisa, JazzCash, or Bank.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 text-xs sm:text-sm font-semibold text-stone-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#8C6D46]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-[#F0EBE3] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. Contact & Support Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-stone-700">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-[#DDD6CC] flex items-center justify-center text-[#8C6D46]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Head Office</h3>
              <p className="text-stone-500">
                {storeConfig?.storeAddress || 'Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-[#DDD6CC] flex items-center justify-center text-[#8C6D46]">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Support Email</h3>
              <p className="text-stone-500">{storeConfig?.supportEmail || 'support@deezcosmetics.pk'}</p>
              <p className="text-[11px] text-stone-400">Response within 24 hours</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-[#DDD6CC] flex items-center justify-center text-[#8C6D46]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">WhatsApp Assistance</h3>
              <p className="text-stone-500 font-mono font-medium">
                {storeConfig?.whatsappNumber && storeConfig.whatsappNumber.trim() !== ''
                  ? storeConfig.whatsappNumber
                  : '03034507537'}
              </p>
              <p className="text-[11px] text-stone-400">Mon - Sat, 10:00 AM - 8:00 PM PKT</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
