import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types/store';
import { X, CheckCircle2, Truck, ShieldCheck, Printer, ArrowRight, Phone, MapPin, Tag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
  onPrintInvoice?: (order: Order) => void;
}

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

const POPULAR_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Abbottabad',
  'Sargodha',
  'Sukkur'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onTrackOrder,
  onPrintInvoice
}) => {
  const { cart, cartSubtotal, clearCart, referralCode, setReferralCode, storeConfig, showToast, t } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [inputReferralCode, setInputReferralCode] = useState(referralCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const freeThreshold = storeConfig?.freeShippingThreshold || 3500;
  const standardShipping = storeConfig?.shippingFee || 199;
  const isFreeShipping = cartSubtotal >= freeThreshold;
  const shippingFee = isFreeShipping ? 0 : standardShipping;
  const totalAmount = cartSubtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !city.trim() || !address.trim()) {
      showToast('Please complete all required fields (Name, Phone, City, Address).', 'error');
      return;
    }

    if (customerPhone.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please enter a valid Pakistani mobile number (e.g. 03001234567).', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your shopping cart is empty.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          province,
          city,
          address,
          deliveryNotes,
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
          referralCode: inputReferralCode.trim() || referralCode || null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setConfirmedOrder(data.order);
      clearCart();
      onOrderSuccess(data.order);
      showToast(`Order ${data.order.id} placed successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error creating order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FAF8F5] border border-[#E7E2DA] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#8C6D46]" />
            <h2 className="text-base font-semibold text-stone-900">
              {confirmedOrder ? 'Order Confirmation' : 'Cash on Delivery (COD) Checkout'}
            </h2>
          </div>
          <button
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            className="p-1.5 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-[#EDE8E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {confirmedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-stone-900">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                  {t.orderSuccessMessage}
                </p>
              </div>

              {/* Order ID & COD Badge */}
              <div className="p-4 bg-white rounded-xl border border-[#E7E2DA] text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-medium">Order Number:</span>
                  <span className="font-mono font-bold text-sm text-[#8C6D46]">{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-medium">Customer:</span>
                  <span className="font-semibold text-stone-900">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-medium">Destination:</span>
                  <span className="text-stone-800">{confirmedOrder.address}, {confirmedOrder.city}, {confirmedOrder.province}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200">
                  <span className="text-stone-900 font-bold">Total Cash on Delivery:</span>
                  <span className="font-mono font-bold text-base text-stone-950">
                    PKR {confirmedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
                {confirmedOrder.referralCode && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>Attributed to Reseller: <strong>{confirmedOrder.referralCode}</strong></span>
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className="text-left text-xs bg-[#F5F2EB] p-4 rounded-xl space-y-2">
                <h4 className="font-semibold text-stone-900">Items Ordered:</h4>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-stone-700">
                    <span>{item.quantity}x {item.title}</span>
                    <span className="font-mono">PKR {item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onTrackOrder(confirmedOrder.id);
                  }}
                  className="flex-1 py-3 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Track This Parcel</span>
                  <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
                </button>

                {onPrintInvoice && (
                  <button
                    onClick={() => onPrintInvoice(confirmedOrder)}
                    className="py-3 px-4 bg-white border border-[#DDD6CC] hover:bg-[#EDE8E0] text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Summary Strip */}
              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Product Subtotal ({cart.length} items):</span>
                  <span className="font-mono font-semibold text-stone-900">PKR {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges (COD):</span>
                  <span className="font-mono font-medium text-stone-900">
                    {isFreeShipping ? <span className="text-emerald-700 font-bold">FREE</span> : `PKR ${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-950">
                  <span>Payable at Doorstep:</span>
                  <span className="font-mono text-base text-[#8C6D46]">PKR {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Details Form */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Customer & Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Ayesha Malik"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Mobile Number (for Courier SMS/Call) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Province *
                    </label>
                    <select
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    >
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      list="city-suggestions"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                    <datalist id="city-suggestions">
                      {POPULAR_CITIES.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Complete House, Street & Sector Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House / Apartment #, Street Name, Sector or Area, Landmark"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call before arrival, leave with security guard"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>

                {/* Reseller referral code optional field */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    DEEZ Reseller Referral Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputReferralCode}
                      onChange={e => setInputReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DEEZ-SARA-05"
                      className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-lg uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                    />
                    {inputReferralCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setReferralCode(inputReferralCode.trim().toUpperCase());
                          showToast(`Applied referral code: ${inputReferralCode}`, 'success');
                        }}
                        className="px-3 py-2 bg-[#EDE8E0] hover:bg-[#DDD6CC] text-xs font-semibold rounded-lg text-stone-800 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {referralCode && (
                    <p className="text-[11px] text-amber-800 mt-1 font-medium">
                      ✓ Active Referral: {referralCode} (5% Reseller benefit credited upon delivery)
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-200 flex items-start gap-3 text-xs text-stone-700">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-stone-900 block">Cash on Delivery (COD) Guarantee</strong>
                  <span>Pay exact amount of <strong>PKR {totalAmount.toLocaleString()}</strong> in cash to the delivery rider upon inspecting parcel package.</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:bg-stone-400"
              >
                <span>{isSubmitting ? 'Confirming Order...' : `Confirm Order (PKR ${totalAmount.toLocaleString()} COD)`}</span>
                <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
