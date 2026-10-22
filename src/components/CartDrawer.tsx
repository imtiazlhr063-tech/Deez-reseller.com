import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    referralCode,
    storeConfig,
    t
  } = useStore();

  if (!isCartOpen) return null;

  const freeThreshold = storeConfig?.freeShippingThreshold || 3500;
  const standardShipping = storeConfig?.shippingFee || 199;
  const isFreeShipping = cartSubtotal >= freeThreshold;
  const amountNeeded = Math.max(0, freeThreshold - cartSubtotal);
  const shippingFee = isFreeShipping ? 0 : standardShipping;
  const grandTotal = cartSubtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E7E2DA] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E7E2DA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8C6D46]" />
              <h2 className="text-base font-semibold text-stone-900">Your Shopping Bag</h2>
              <span className="text-xs text-stone-600 font-mono">({cart.length} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-[#EDE8E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#F3EFEA] px-6 py-3 border-b border-[#E7E2DA] text-xs">
            {isFreeShipping ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You unlocked FREE Delivery across Pakistan!</span>
              </div>
            ) : (
              <div>
                <p className="text-stone-700">
                  Add <strong className="font-semibold text-stone-900">PKR {amountNeeded.toLocaleString()}</strong> more for FREE Shipping!
                </p>
                <div className="w-full bg-[#E5DFD5] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#8C6D46] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (cartSubtotal / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reseller referral indicator */}
          {referralCode && (
            <div className="bg-amber-50 px-6 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">Reseller Link:</span>
                <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">{referralCode}</span>
              </div>
              <span className="text-[11px] text-amber-700 font-medium">5% Reseller Attributed</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-stone-500">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-sm font-medium text-stone-800">Your shopping bag is empty</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Discover pure Kashmiri saffron elixirs, velvety matte lips, and organic beauty formulas.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3 bg-white border border-[#E7E2DA] rounded-xl shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={item.image || '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-[#8C6D46] font-medium font-mono tabular-nums mt-0.5">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#DDD6CC] rounded-md bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-950"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-950"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-900 font-mono tabular-nums">
                          PKR {item.subtotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-[#E7E2DA] bg-white px-6 py-5 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">
                    PKR {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t.shipping}</span>
                  <span className={`font-mono tabular-nums ${isFreeShipping ? 'text-emerald-700 font-semibold' : 'text-stone-900 font-medium'}`}>
                    {isFreeShipping ? 'FREE' : `PKR ${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-950">
                  <span>{t.total}</span>
                  <span className="font-mono tabular-nums text-base text-[#8C6D46]">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E7E2DA] flex items-center gap-2 text-[11px] text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Cash on Delivery nationwide. Inspect upon receiving.</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Checkout via Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
