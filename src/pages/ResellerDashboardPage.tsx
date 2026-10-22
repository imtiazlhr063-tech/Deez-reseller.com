import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, CommissionLedgerEntry, PayoutRequest, ResellerSummary } from '../types/store';
import {
  Users,
  Copy,
  Check,
  Share2,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageCircle,
  ExternalLink,
  PlusCircle,
  ArrowUpRight,
  CreditCard,
  LogOut,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface ResellerDashboardProps {
  onSelectProduct: (product: Product) => void;
  onOpenCustomerCheckout: () => void;
  onNavigate: (route: string) => void;
}

export const ResellerDashboardPage: React.FC<ResellerDashboardProps> = ({
  onSelectProduct,
  onOpenCustomerCheckout,
  onNavigate
}) => {
  const { reseller, resellerToken, resellerLogout, showToast, setReferralCode } = useStore();
  const [metrics, setMetrics] = useState<ResellerSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ledger, setLedger] = useState<CommissionLedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'commissions' | 'payouts' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payout request modal / form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank Transfer'>('EasyPaisa');
  const [payoutTitle, setPayoutTitle] = useState(reseller?.paymentDetails?.accountTitle || reseller?.fullName || '');
  const [payoutNumber, setPayoutNumber] = useState(reseller?.paymentDetails?.accountNumber || reseller?.mobileNumber || '');
  const [payoutBank, setPayoutBank] = useState(reseller?.paymentDetails?.bankName || '');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Profile editing
  const [profileAddress, setProfileAddress] = useState(reseller?.address || '');
  const [profileSocial, setProfileSocial] = useState(reseller?.socialLink || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (reseller && reseller.referralCode) {
      setReferralCode(reseller.referralCode);
    }
  }, [reseller]);

  useEffect(() => {
    loadDashboardData();
  }, [resellerToken]);

  const loadDashboardData = async () => {
    if (!resellerToken) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${resellerToken}` };

      const [resMe, resOrders, resComms, resProducts] = await Promise.all([
        fetch('/api/reseller/me', { headers }),
        fetch('/api/reseller/orders', { headers }),
        fetch('/api/reseller/commissions', { headers }),
        fetch('/api/public/products')
      ]);

      if (resMe.ok) {
        const data = await resMe.json();
        setMetrics(data.metrics);
        if (data.reseller?.paymentDetails) {
          setPayoutMethod(data.reseller.paymentDetails.method || 'EasyPaisa');
          setPayoutTitle(data.reseller.paymentDetails.accountTitle || data.reseller.fullName);
          setPayoutNumber(data.reseller.paymentDetails.accountNumber || data.reseller.mobileNumber);
          setPayoutBank(data.reseller.paymentDetails.bankName || '');
        }
      }

      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data);
      }

      if (resComms.ok) {
        const data = await resComms.json();
        setLedger(data.ledger || []);
        setPayouts(data.payouts || []);
      }

      if (resProducts.ok) {
        const data = await resProducts.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading reseller data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!reseller) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-stone-700 text-sm">Please log in to access your reseller dashboard.</p>
        <button
          onClick={() => onNavigate('/reseller/portal')}
          className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Go to Reseller Login
        </button>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/shop?ref=${reseller.referralCode}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      showToast('Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(reseller.referralCode);
      setCopiedCode(true);
      showToast('Referral code copied!', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareWhatsAppGeneral = () => {
    const text = encodeURIComponent(
      `✨ Explore 100% Halal & Luxury DEEZ Cosmetics! Kashmiri Saffron Glow Serums, Velvet Lipsticks & Kohl Kajal. Cash on Delivery across Pakistan. Order through my link: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareProductWhatsApp = (prod: Product) => {
    const prodUrl = `${window.location.origin}/shop?ref=${reseller.referralCode}&prod=${prod.slug}`;
    const text = encodeURIComponent(
      `💄 *${prod.title}*\n${prod.description.substring(0, 110)}...\nPrice: PKR ${prod.price.toLocaleString()} (Cash on Delivery across Pakistan)\nOrder here: ${prodUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(payoutAmount, 10);
    if (!amt || amt < 500) {
      showToast('Minimum payout request amount is PKR 500.', 'error');
      return;
    }

    if (!payoutTitle.trim() || !payoutNumber.trim()) {
      showToast('Please enter your account title and number.', 'error');
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await fetch('/api/reseller/payout-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resellerToken}`
        },
        body: JSON.stringify({
          amount: amt,
          method: payoutMethod,
          accountTitle: payoutTitle,
          accountNumber: payoutNumber,
          bankName: payoutMethod === 'Bank Transfer' ? payoutBank : ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request');
      }

      showToast(data.message, 'success');
      setPayoutAmount('');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Payout error', 'error');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/reseller/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resellerToken}`
        },
        body: JSON.stringify({
          address: profileAddress,
          socialLink: profileSocial,
          paymentDetails: {
            method: payoutMethod,
            accountTitle: payoutTitle,
            accountNumber: payoutNumber,
            bankName: payoutBank
          }
        })
      });

      if (res.ok) {
        showToast('Profile and payment details updated successfully!', 'success');
        loadDashboardData();
      } else {
        showToast('Error updating profile', 'error');
      }
    } catch (err) {
      showToast('Error saving profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#EDE8E0] rounded-xl flex items-center justify-center text-[#8C6D46] font-bold text-lg font-serif-luxury">
            {reseller.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900">{reseller.fullName}</h1>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  reseller.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : reseller.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {reseller.status}
              </span>
            </div>
            <div className="text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
              <span>ID: <strong className="font-mono text-stone-700">{reseller.id}</strong></span>
              <span>·</span>
              <span>Code: <strong className="font-mono text-[#8C6D46]">{reseller.referralCode}</strong></span>
              <span>·</span>
              <span>{reseller.city}, {reseller.province}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 border border-[#DDD6CC] rounded-xl hover:bg-[#FAF8F5] text-stone-600 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={resellerLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-stone-700 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Status Warning if Pending */}
      {reseller.status === 'Pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Application Pending DEEZ Admin Approval:</strong>
            <p className="mt-0.5">
              Your reseller account is awaiting review by our Lahore operations team. You can still preview your referral links and catalog. Selling privileges and commission confirmations will activate once approved.
            </p>
          </div>
        </div>
      )}

      {/* Quick Referral Link Bar */}
      <div className="bg-[#1C1917] text-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#E8D7C8] font-bold">
              Your Personal Referral Link (5% Commission)
            </span>
            <p className="text-xs text-stone-300 mt-0.5">
              When customers order through this link, 5% of their product subtotal is automatically attributed to you.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsAppGeneral}
              className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-stone-900 border border-stone-700 text-xs text-stone-200 px-3 py-2 rounded-lg font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-white text-stone-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code Only'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-stone-900">
            {metrics?.totalOrders || 0}
          </p>
          <div className="text-[11px] text-stone-500 flex gap-2">
            <span>{metrics?.deliveredOrders || 0} delivered</span>
            <span>·</span>
            <span>{metrics?.pendingOrders || 0} pending</span>
          </div>
        </div>

        {/* Eligible Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Eligible Sales</span>
            <ShoppingBag className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-stone-900">
            PKR {(metrics?.eligibleSales || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500">Excludes shipping & returns</p>
        </div>

        {/* Confirmed Commission */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Confirmed Earnings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            PKR {(metrics?.confirmedCommission || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500">
            PKR {(metrics?.pendingCommission || 0).toLocaleString()} in pending transit
          </p>
        </div>

        {/* Outstanding Withdrawable */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Withdrawable Balance</span>
            <DollarSign className="w-4 h-4 text-[#8C6D46]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[#8C6D46]">
            PKR {(metrics?.outstandingCommission || 0).toLocaleString()}
          </p>
          <div className="text-[11px] text-stone-500">
            PKR {(metrics?.paidCommission || 0).toLocaleString()} already paid
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E7E2DA] flex gap-4 text-xs font-semibold overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & 5% Rules' },
          { id: 'products', label: 'Products & WhatsApp Share' },
          { id: 'orders', label: `My Customer Orders (${orders.length})` },
          { id: 'commissions', label: `Commission Ledger (${ledger.length})` },
          { id: 'payouts', label: 'Request Payout' },
          { id: 'profile', label: 'Payment & Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[#1C1917] text-[#1C1917] font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Direct Customer Order CTA */}
          <div className="bg-[#FAF8F5] border border-[#E7E2DA] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Want to book an order for a customer yourself?</h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Take your customer's delivery address, select products in our shop, and checkout with Cash on Delivery. Your reseller code is automatically applied.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#E8D7C8]" />
              <span>Book Order for Customer</span>
            </button>
          </div>

          {/* 5% Formula Demonstration */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              5% Reseller Commission Structure & Pakistani COD Reconciliation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2DA] space-y-1">
                <span className="font-bold text-stone-900">1. Eligible Product Base</span>
                <p className="text-stone-600">
                  Commission is calculated strictly on the product subtotal. Shipping fees (PKR 199) and taxes are excluded.
                </p>
                <p className="text-[#8C6D46] font-mono font-semibold pt-1">
                  Subtotal PKR 2,450 × 5% = PKR 123
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2DA] space-y-1">
                <span className="font-bold text-stone-900">2. COD Reconciliation</span>
                <p className="text-stone-600">
                  Once Trax, TCS or Leopards delivers the parcel and remits collected funds, DEEZ marks the COD reconciled and confirms your commission.
                </p>
                <p className="text-emerald-700 font-semibold pt-1">
                  Status: Confirmed & Withdrawable
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2DA] space-y-1">
                <span className="font-bold text-stone-900">3. Direct Mobile Payouts</span>
                <p className="text-stone-600">
                  Withdraw your earnings straight to EasyPaisa, JazzCash, or your Pakistani bank account once you reach PKR 500.
                </p>
                <p className="text-stone-900 font-semibold pt-1">
                  Disbursed within 24-48 business hours
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Products & WhatsApp Sharing */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-stone-600">
            <span>Browse DEEZ Catalog with your referral tag attached</span>
            <span>{products.length} products available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map(prod => {
              const commissionEarned = Math.round(prod.price * 0.05);

              return (
                <div key={prod.id} className="bg-white rounded-2xl border border-[#E7E2DA] p-4 flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-20 h-20 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#8C6D46]">{prod.category}</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2">{prod.title}</h4>
                      <p className="text-xs font-mono font-bold text-stone-950 mt-1">
                        PKR {prod.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                    <span className="text-emerald-800 font-medium">Your 5% Profit:</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      +PKR {commissionEarned}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleShareProductWhatsApp(prod)}
                      className="flex-1 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/shop?ref=${reseller.referralCode}&prod=${prod.slug}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(url);
                          showToast(`Link for ${prod.title} copied!`, 'success');
                        }
                      }}
                      className="p-2 border border-[#DDD6CC] hover:bg-[#FAF8F5] text-stone-700 rounded-lg text-xs"
                      title="Copy product link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. My Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E2DA] text-stone-500 text-xs">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-800">No Orders Placed Yet</p>
              <p className="mt-1">Share your referral link on WhatsApp to generate your first customer order!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">5% Commission</th>
                      <th className="py-3 px-4">Parcel Status</th>
                      <th className="py-3 px-4">COD Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-mono font-bold text-[#8C6D46]">{order.id}</td>
                        <td className="py-3 px-4 text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-stone-900">{order.customerName} ({order.city})</td>
                        <td className="py-3 px-4 font-mono font-medium">PKR {order.productSubtotal.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          PKR {order.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            order.cod.reconciliationStatus === 'Reconciled' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {order.cod.reconciliationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Commission Ledger */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E7E2DA] flex justify-between items-center text-xs">
              <h3 className="font-bold text-stone-900">Audit-Verified Commission Transaction Ledger</h3>
              <span className="text-stone-500">Includes credits, COD confirmations, and payouts</span>
            </div>
            {ledger.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">No transactions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Order / Ref</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]">
                    {ledger.map(entry => (
                      <tr key={entry.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.type === 'CONFIRM_DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            entry.type === 'CREDIT_PENDING' ? 'bg-amber-100 text-amber-800' :
                            entry.type === 'PAYOUT_DEBIT' ? 'bg-purple-100 text-purple-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{entry.orderId}</td>
                        <td className={`py-3 px-4 font-mono font-bold ${entry.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {entry.amount >= 0 ? `+PKR ${entry.amount}` : `-PKR ${Math.abs(entry.amount)}`}
                        </td>
                        <td className="py-3 px-4 text-stone-700 text-[11px]">{entry.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Request Payout */}
      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">Request Commission Payout</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Available Confirmed Balance:{' '}
                <strong className="text-emerald-700 font-mono text-sm">
                  PKR {(metrics?.outstandingCommission || 0).toLocaleString()}
                </strong>
              </p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Withdrawal Amount (Min PKR 500) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-stone-500">PKR</span>
                  <input
                    type="number"
                    min="500"
                    max={metrics?.outstandingCommission || 0}
                    required
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full pl-12 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Withdrawal Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EasyPaisa', 'JazzCash', 'Bank Transfer'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayoutMethod(m)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        payoutMethod === m
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-[#FAF8F5] text-stone-700 border-[#DDD6CC] hover:bg-[#EDE8E0]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Account Title *</label>
                <input
                  type="text"
                  required
                  value={payoutTitle}
                  onChange={e => setPayoutTitle(e.target.value)}
                  placeholder="Account holder's full name"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {payoutMethod === 'Bank Transfer' ? 'IBAN or Account Number *' : 'Mobile Account Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={payoutNumber}
                  onChange={e => setPayoutNumber(e.target.value)}
                  placeholder={payoutMethod === 'Bank Transfer' ? 'PK00BAHL0000000000' : '03001234567'}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>

              {payoutMethod === 'Bank Transfer' && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={payoutBank}
                    onChange={e => setPayoutBank(e.target.value)}
                    placeholder="e.g. Meezan Bank, HBL, Allied Bank"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submittingPayout || (metrics?.outstandingCommission || 0) < 500}
                className="w-full py-3 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-stone-300"
              >
                <span>{submittingPayout ? 'Submitting Request...' : 'Submit Payout Request'}</span>
                <Send className="w-3.5 h-3.5 text-[#E8D7C8]" />
              </button>
            </form>
          </div>

          {/* Past Payouts Table */}
          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-stone-900">Payout Requests History</h3>
            {payouts.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No withdrawal requests made yet.</p>
            ) : (
              <div className="space-y-3">
                {payouts.map(p => (
                  <div key={p.id} className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-stone-900">PKR {p.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-stone-600 text-[11px] flex justify-between">
                      <span>{p.method} · {p.accountNumber}</span>
                      <span>{new Date(p.requestedAt).toLocaleDateString()}</span>
                    </div>
                    {p.transactionReference && (
                      <p className="text-[10px] text-stone-500 font-mono">Ref: {p.transactionReference}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Profile & Payment Details */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-stone-900">Update Profile & Default Payment Info</h3>
            <p className="text-xs text-stone-500">Keep your bank details current for prompt commission disbursal.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Delivery / Home Address</label>
              <textarea
                rows={2}
                value={profileAddress}
                onChange={e => setProfileAddress(e.target.value)}
                placeholder="Your city & street address"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Social Channel / Store Handle</label>
              <input
                type="text"
                value={profileSocial}
                onChange={e => setProfileSocial(e.target.value)}
                placeholder="instagram.com/sara_beauty_pk"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
              />
            </div>

            <div className="pt-2 border-t border-[#F0EBE3]">
              <h4 className="font-bold text-stone-900 mb-2">Default Payout Account</h4>
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Default Method</label>
                  <select
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  >
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer (1Link Pakistan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Account Title</label>
                  <input
                    type="text"
                    value={payoutTitle}
                    onChange={e => setPayoutTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Account Number / Mobile Wallet</label>
                  <input
                    type="text"
                    value={payoutNumber}
                    onChange={e => setPayoutNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer disabled:bg-stone-400"
            >
              {savingProfile ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
