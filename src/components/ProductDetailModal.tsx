import React, { useState } from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Check, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onProceedToCheckout: () => void;
  onSelectRelated?: (prod: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onClose,
  onProceedToCheckout,
  onSelectRelated
}) => {
  const { addToCart, lang, t, referralCode, showToast } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'usage' | 'reviews'>('details');

  if (!product) return null;

  // Set initial image and variant
  const currentImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const displayImage = activeImage || currentImages[0];

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const currentVariant = selectedVariant || (variants.length > 0 ? variants[0] : '');

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    onProceedToCheckout();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shop?ref=${referralCode || 'DEEZ'}&prod=${product.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Product referral link copied! Share on WhatsApp to earn 5% commission.', 'success');
    }
  };

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FAF8F5] border border-[#E7E2DA] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Product Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-[#F5F2EB] border border-[#E7E2DA] shadow-xs relative">
                <img
                  src={displayImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {product.isPlaceholder && (
                  <div className="absolute top-3 left-3 bg-amber-100/90 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    Development Sample Catalog
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery if multiple images */}
              {currentImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        displayImage === img ? 'border-[#8C6D46] shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 bg-white p-3.5 rounded-xl border border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8C6D46] shrink-0" />
                  <span>2-4 Days Delivery via TCS / Trax</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>

            {/* Right: Product Purchase Module */}
            <div className="flex flex-col space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span className="uppercase tracking-wider font-semibold text-[#8C6D46]">
                    {product.category?.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    {product.sizeOrWeight && (
                      <span className="bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E7E2DA]">
                        {product.sizeOrWeight}
                      </span>
                    )}
                    <span>SKU: {product.sku}</span>
                  </div>
                </div>

                <h1 className={`text-xl sm:text-2xl font-serif-luxury font-bold text-stone-900 leading-snug ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {lang === 'ur' && product.titleUrdu ? product.titleUrdu : product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-stone-800">{product.rating}</span>
                  <span className="text-xs text-stone-400">· {product.reviewCount} customer reviews</span>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="p-4 bg-white rounded-2xl border border-[#E7E2DA]">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold font-mono tabular-nums text-stone-950">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-stone-400 font-mono line-through">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs flex items-center justify-between">
                  <span className="text-emerald-800 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {product.stock > 0 ? `${product.stock} units in Lahore Central Warehouse` : 'Out of Stock'}
                  </span>
                  <span className="text-stone-400">Cash on Delivery</span>
                </div>
              </div>

              {/* Variant selector if available */}
              {variants.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-stone-700">Select Option / Shade:</label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          currentVariant === v
                            ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                            : 'bg-white text-stone-700 border-[#DDD6CC] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-stone-700">Quantity:</label>
                  <div className="flex items-center border border-[#DDD6CC] rounded-lg bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-950 text-sm font-semibold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-mono font-bold text-stone-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-stone-600 hover:text-stone-950 text-sm font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      onClose();
                    }}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 bg-[#EDE8E0] hover:bg-[#E2DDD3] text-stone-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#8C6D46]" />
                    <span>{t.addToBag}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="py-3 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Buy Now (COD)</span>
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full py-2.5 px-3 text-stone-700 hover:text-stone-950 text-xs font-medium rounded-xl border border-[#DDD6CC] hover:bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#8C6D46]" />
                  <span>Share Product Link & Earn 5% Commission</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details / Ingredients / Usage / Reviews Tabs */}
          <div className="pt-6 border-t border-[#E7E2DA]">
            <div className="flex border-b border-[#E7E2DA] gap-6 text-xs font-semibold overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'details' ? 'border-b-2 border-[#1C1917] text-[#1C1917]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Description & Benefits
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'ingredients' ? 'border-b-2 border-[#1C1917] text-[#1C1917]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.ingredients}
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'usage' ? 'border-b-2 border-[#1C1917] text-[#1C1917]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.howToUse}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'reviews' ? 'border-b-2 border-[#1C1917] text-[#1C1917]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Verified Reviews ({product.reviewCount})
              </button>
            </div>

            <div className="pt-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  {lang === 'ur' && product.descriptionUrdu ? (
                    <p className="font-urdu text-stone-800 bg-white p-4 rounded-xl border border-[#E7E2DA] leading-loose">
                      {product.descriptionUrdu}
                    </p>
                  ) : (
                    <p className="leading-relaxed text-stone-700">{product.description}</p>
                  )}
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E7E2DA]">
                  <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
                    Ingredients (Verified Botanical Content)
                  </h4>
                  <p className="font-mono text-xs text-stone-600 leading-normal">{product.ingredients || 'Natural plant extracts and skin-safe cosmetic bases.'}</p>
                  <p className="text-[11px] text-emerald-800">
                    Formulated without parabens, sulfates, phthalates, synthetic bleaches, or heavy metals. 100% Halal certified.
                  </p>
                </div>
              )}

              {activeTab === 'usage' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E7E2DA]">
                  <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Directions For Use</h4>
                  <p>{product.usageInstructions || 'Apply gently onto cleansed skin as part of your daily skincare routine.'}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-xl border border-[#E7E2DA] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900">Mahnoor R. (Gulberg, Lahore)</span>
                      <span className="text-stone-400">Verified Buyer</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-700 pt-1">
                      "Absolutely stunning quality. Sits so nicely on my skin during Lahore's humid weather. Delivered in 2 days by Trax with Cash on Delivery!"
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#E7E2DA] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900">Farhan A. (DHA Karachi)</span>
                      <span className="text-stone-400">Verified Buyer</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-700 pt-1">
                      "Ordered through a friend's reseller referral code. The packaging is authentic and luxury grade. 10/10 recommendation."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#E7E2DA] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                You May Also Like
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectRelated) onSelectRelated(rel);
                    }}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E7E2DA] hover:border-[#8C6D46] cursor-pointer transition-colors"
                  >
                    <img src={rel.image} alt={rel.title} className="w-12 h-12 object-cover rounded-lg border" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{rel.title}</p>
                      <p className="font-mono text-xs text-[#8C6D46] font-bold">PKR {rel.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
