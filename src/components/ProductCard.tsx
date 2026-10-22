import React from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, lang, t } = useStore();

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Product Image Showcase */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 bg-[#F5F2EB] overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quiet badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {product.isBestSeller && (
            <span className="bg-[#1C1917] text-[#FAF8F5] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#8C6D46] text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
              New Arrival
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-emerald-900/90 text-white text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded uppercase">
              Save {discountPercent}%
            </span>
          )}
          {product.isPlaceholder && (
            <span className="bg-amber-100/90 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
              Sample Catalog
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-850 text-white text-[10px] font-medium px-2 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Quick View overlay hint */}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-stone-900 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Size */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-[#8C6D46]">
              {product.category?.replace('-', ' ')}
            </span>
            {product.sizeOrWeight && (
              <span className="font-mono text-[11px] text-stone-500 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E7E2DA]">
                {product.sizeOrWeight}
              </span>
            )}
          </div>

          {/* Title based on selected language */}
          <h3
            onClick={() => onSelect(product)}
            className={`text-sm sm:text-base font-semibold text-stone-900 line-clamp-2 hover:text-[#8C6D46] cursor-pointer transition-colors leading-snug ${
              lang === 'ur' ? 'font-urdu text-base' : ''
            }`}
          >
            {lang === 'ur' && product.titleUrdu ? product.titleUrdu : product.title}
          </h3>

          {/* SKU & Rating */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-mono">SKU: {product.sku}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="font-mono font-medium text-stone-800">{product.rating}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-950">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 font-mono line-through">
                  PKR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-800 font-medium block">
              Cash on Delivery (COD)
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              product.stock > 0
                ? 'bg-[#1C1917] hover:bg-[#322E2B] text-white shadow-2xs'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E8D7C8]" />
            <span className="hidden sm:inline">{product.stock > 0 ? t.addToBag : t.outOfStock}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
