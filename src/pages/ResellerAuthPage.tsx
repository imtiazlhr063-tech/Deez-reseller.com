import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Users, Lock, Phone, Mail, MapPin, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ResellerAuthPageProps {
  onSuccess: () => void;
  onOpenTerms: () => void;
}

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

export const ResellerAuthPage: React.FC<ResellerAuthPageProps> = ({ onSuccess, onOpenTerms }) => {
  const { setResellerAuth, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regProvince, setRegProvince] = useState('Punjab');
  const [regAddress, setRegAddress] = useState('');
  const [regSocial, setRegSocial] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessInfo, setRegSuccessInfo] = useState<any | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      showToast('Please enter your mobile/email and password.', 'error');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/reseller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setResellerAuth(data.token, data.reseller, data.metrics);
      showToast(`Welcome back, ${data.reseller.fullName}!`, 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Login error', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      showToast('You must accept the Reseller Terms & Conditions to register.', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/reseller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          mobileNumber: regMobile,
          email: regEmail,
          password: regPassword,
          city: regCity,
          province: regProvince,
          address: regAddress,
          socialLink: regSocial,
          acceptedTerms
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegSuccessInfo(data);
      showToast('Application registered successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration error', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setLoginIdentifier('03001234567');
    setLoginPassword('reseller123');
    showToast('Demo approved reseller credentials loaded (Sara Khan)!', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-bold text-[#8C6D46]">
          DEEZ Entrepreneurship Program
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
          DEEZ Cosmetics Reseller Portal
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Sell authentic luxury halal cosmetics across Pakistan with zero upfront capital. Earn 5% verified commissions with automated Cash on Delivery fulfillment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#EDE8E0] p-1 rounded-xl flex gap-1">
          <button
            onClick={() => {
              setMode('login');
              setRegSuccessInfo(null);
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Reseller Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setRegSuccessInfo(null);
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            New Reseller Registration
          </button>
        </div>
      </div>

      {/* Login Box */}
      {mode === 'login' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E7E2DA] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
            <h2 className="text-base font-semibold text-stone-900">Sign in to your Reseller Dashboard</h2>
            <button
              onClick={handleQuickDemoFill}
              className="text-[11px] font-semibold text-[#8C6D46] hover:underline cursor-pointer"
            >
              Fill Demo Reseller
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="03001234567 or email@domain.com"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-stone-400"
            >
              <span>{loginLoading ? 'Authenticating...' : 'Enter Reseller Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
            </button>
          </form>

          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2DA] text-[11px] text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">Quick Test Credentials:</p>
            <p>Mobile: <code className="bg-stone-200 px-1 rounded">03001234567</code> · Password: <code className="bg-stone-200 px-1 rounded">reseller123</code></p>
          </div>
        </div>
      )}

      {/* Registration Box */}
      {mode === 'register' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E7E2DA] p-6 sm:p-8 shadow-xs space-y-6">
          {regSuccessInfo ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-stone-900">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Your application has been registered with status <strong className="text-amber-800">Pending Review</strong>.
                DEEZ team will review and approve your selling privileges shortly.
              </p>

              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2DA] text-xs max-w-sm mx-auto text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Reseller ID:</span>
                  <span className="font-bold text-stone-900">{regSuccessInfo.resellerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Assigned Referral Code:</span>
                  <span className="font-bold text-[#8C6D46]">{regSuccessInfo.referralCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className="font-bold text-amber-700">{regSuccessInfo.status}</span>
                </div>
              </div>

              <button
                onClick={() => setMode('login')}
                className="mt-4 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="pb-2 border-b border-[#F0EBE3]">
                <h2 className="text-base font-semibold text-stone-900">Apply to Become a DEEZ Reseller</h2>
                <p className="text-xs text-stone-500">All Pakistani provinces and cities are welcome to join.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="e.g. Sara Khan"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={regMobile}
                    onChange={e => setRegMobile(e.target.value)}
                    placeholder="03001234567"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="sara@example.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Account Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Province *</label>
                  <select
                    value={regProvince}
                    onChange={e => setRegProvince(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  >
                    {PAKISTAN_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Rawalpindi"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Shop Name or Social Media Link (Optional)</label>
                <input
                  type="text"
                  value={regSocial}
                  onChange={e => setRegSocial(e.target.value)}
                  placeholder="e.g. instagram.com/sara_beauty_pk or WhatsApp Catalog"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8C6D46]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="rounded border-[#DDD6CC] text-[#8C6D46] focus:ring-[#8C6D46] mt-0.5"
                  />
                  <span>
                    I agree to the DEEZ Reseller Terms: 5% verified commission on eligible product sales, subject to COD delivery & reconciliation.{' '}
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="text-[#8C6D46] font-semibold underline"
                    >
                      Read full terms
                    </button>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 px-4 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-stone-400 pt-2"
              >
                <span>{regLoading ? 'Submitting Application...' : 'Register as DEEZ Reseller'}</span>
                <ArrowRight className="w-4 h-4 text-[#E8D7C8]" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
