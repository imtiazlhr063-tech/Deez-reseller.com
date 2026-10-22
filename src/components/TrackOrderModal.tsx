import React, { useState, useEffect } from 'react';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId
}) => {
  const { showToast } = useStore();
  const [query, setQuery] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId);
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleTrack = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      showToast('Please enter an Order ID (e.g. DZ-ORD-8821) or Mobile Number.', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/public/orders/track?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setOrders([]);
        showToast(data.error || 'No matching orders found', 'error');
      } else {
        setOrders(data);
      }
    } catch (err: any) {
      showToast('Error tracking parcel. Please try again.', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Placed': return 1;
      case 'Confirmed': return 2;
      case 'Dispatched': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FAF8F5] border border-[#E7E2DA] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#8C6D46]" />
            <h2 className="text-base font-semibold text-stone-900">Track Cash on Delivery Parcel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-[#EDE8E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-600" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. DZ-ORD-8821) or 11-digit Mobile"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-white border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:bg-stone-400"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Results */}
          {searched && orders.length === 0 && !loading && (
            <div className="text-center py-10 bg-white rounded-xl border border-[#E7E2DA] text-stone-500">
              <AlertCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-800">No Orders Found</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Please check your order number or phone number. Need urgent assistance? Reach out to DEEZ WhatsApp support.
              </p>
            </div>
          )}

          {orders.map(order => {
            const step = getStatusStep(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E7E2DA] p-5 sm:p-6 shadow-xs space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0EBE3]">
                  <div>
                    <span className="text-xs text-stone-600">Order ID:</span>
                    <h3 className="font-mono font-bold text-base text-[#8C6D46]">{order.id}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-600">Total COD Amount:</span>
                    <p className="font-mono font-bold text-sm text-stone-900">
                      PKR {order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 text-center text-[11px] font-medium text-stone-600 mb-2">
                      <span className={step >= 1 ? 'text-[#8C6D46] font-bold' : ''}>1. Placed</span>
                      <span className={step >= 2 ? 'text-[#8C6D46] font-bold' : ''}>2. Confirmed</span>
                      <span className={step >= 3 ? 'text-[#8C6D46] font-bold' : ''}>3. Dispatched</span>
                      <span className={step >= 4 ? 'text-emerald-700 font-bold' : ''}>4. Delivered</span>
                    </div>

                    <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#8C6D46] h-full transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Order marked as {order.orderStatus}</span>
                  </div>
                )}

                {/* Courier Dispatch Details */}
                {order.courier && order.courier.trackingNumber ? (
                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E7E2DA] space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-stone-900 font-semibold">
                      <Truck className="w-4 h-4 text-[#8C6D46]" />
                      <span>Assigned Courier: {order.courier.company || 'Standard Pakistan Courier'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 pt-1">
                      <span>Tracking Number:</span>
                      <span className="font-mono font-bold text-stone-900">{order.courier.trackingNumber}</span>
                    </div>
                    {order.courier.dispatchDate && (
                      <div className="flex justify-between text-stone-600">
                        <span>Dispatch Date:</span>
                        <span>{new Date(order.courier.dispatchDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2DA] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Order is being verified and packed at DEEZ Lahore Hub. Tracking number will appear once handed over to courier.</span>
                  </div>
                )}

                {/* Summary Info */}
                <div className="text-xs space-y-1 pt-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Recipient:</span>
                    <span className="text-stone-900 font-medium">{order.customerName} ({order.city}, {order.province})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items Count:</span>
                    <span className="text-stone-900">{order.items?.length || 1} product(s)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
