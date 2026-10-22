import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PolicyModalProps {
  type: 'shipping' | 'return' | 'terms' | 'about' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  const { lang, storeConfig } = useStore();
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FAF8F5] border border-[#E7E2DA] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            {type === 'shipping' && <Truck className="w-5 h-5 text-[#8C6D46]" />}
            {type === 'return' && <RotateCcw className="w-5 h-5 text-[#8C6D46]" />}
            {type === 'terms' && <Award className="w-5 h-5 text-[#8C6D46]" />}
            {type === 'about' && <ShieldCheck className="w-5 h-5 text-[#8C6D46]" />}

            <h2 className="text-base font-semibold text-stone-900">
              {type === 'shipping' && 'Nationwide Shipping & Cash on Delivery Policy'}
              {type === 'return' && '7-Day Return & Exchange Policy'}
              {type === 'terms' && 'DEEZ Reseller Program & 5% Commission Rules'}
              {type === 'about' && 'About DEEZ Cosmetics Pakistan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-stone-950 rounded-lg hover:bg-[#EDE8E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
          {type === 'shipping' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Nationwide Cash on Delivery (COD)</h3>
              <p>
                DEEZ Cosmetics operates through top-tier courier networks including Trax Logistics, TCS Express, and Leopards Courier. We deliver parcels to all major cities and remote towns across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad, AJK, and Gilgit-Baltistan.
              </p>
              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] space-y-2">
                <h4 className="font-semibold text-stone-900">Standard Delivery Timeline:</h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li><strong>Lahore / Karachi / Islamabad:</strong> 2 to 3 working days.</li>
                  <li><strong>Other Major Cities:</strong> 3 to 4 working days.</li>
                  <li><strong>Remote Tehsil / Districts:</strong> 4 to 6 working days.</li>
                </ul>
              </div>
              <p>
                Standard courier fee is PKR 199. Orders exceeding PKR 3,500 qualify for <strong>100% Free Shipping</strong>. You only pay in cash when the verified delivery rider delivers your sealed parcel.
              </p>
            </div>
          )}

          {type === 'return' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Hassle-Free 7-Day Exchange & Returns</h3>
              <p>
                At DEEZ Cosmetics, every product undergoes strict microbiological and quality inspection prior to dispatch. However, if your parcel arrives damaged or with an incorrect item, we offer an immediate replacement.
              </p>
              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] space-y-2">
                <h4 className="font-semibold text-stone-900">Return Eligibility Conditions:</h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li>Claim must be initiated via WhatsApp ({storeConfig?.whatsappNumber || '03034507537'}) within 7 days of parcel receipt.</li>
                  <li>Product must be unconsumed, in its original packaging with safety seal intact.</li>
                  <li>Photo/video proof of transit damage is requested for courier claims.</li>
                </ul>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Official DEEZ Reseller Guidelines & 5% Commission Rules</h3>
              <p>
                The DEEZ Cosmetics Reseller Program enables individuals and social commerce sellers across Pakistan to earn sustainable income by sharing genuine, Halal beauty products.
              </p>
              <div className="bg-white p-4 rounded-xl border border-[#E7E2DA] space-y-2">
                <h4 className="font-semibold text-stone-900">Automated 5% Commission Computation:</h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li><strong>Commission Base:</strong> Strictly calculated as: <code>Eligible Product Subtotal × 5%</code>.</li>
                  <li><strong>Exclusions:</strong> Courier shipping fees and taxes are strictly excluded from commission calculations.</li>
                  <li><strong>Examples:</strong> PKR 500 eligible product subtotal = PKR 25 commission; PKR 1,000 subtotal = PKR 50 commission; PKR 2,450 subtotal = PKR 123 commission.</li>
                  <li><strong>Confirmation:</strong> Commissions remain "Pending" upon checkout and are transitioned to "Confirmed" once the parcel is delivered and courier COD remittance has been formally reconciled by DEEZ management.</li>
                  <li><strong>Cancellations & Returns:</strong> Cancelled or returned parcels will reverse pending or unpaid commissions.</li>
                  <li><strong>Payouts:</strong> Minimum withdrawal threshold is PKR 500, disbursed directly via JazzCash, EasyPaisa, or Pakistani Bank Accounts.</li>
                </ul>
              </div>
            </div>
          )}

          {type === 'about' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-900 text-sm">Timeless Botanical Luxury from Lahore</h3>
              <p>
                DEEZ Cosmetics was founded with a singular conviction: South Asian skin deserves luxury cosmetic formulations tailored precisely to its undertones and Pakistan's climate.
              </p>
              <p>
                From hand-harvested organic Kashmiri Saffron and Motia Jasmine to nourishing almond-enriched Ayurvedic Kohl, we refuse to cut corners. Every formulation is 100% Halal, cruelty-free, and formulated without harsh bleaches or heavy metals.
              </p>
              {lang === 'ur' ? (
                <div className="font-urdu text-sm bg-white p-4 rounded-xl border border-[#E7E2DA] leading-loose text-stone-800">
                  دیز کاسمیٹکس کا مشن پاکستان میں خواتین اور تمام افراد کو خالص قدرتی خوبصورتی اور معاشی خود مختاری کے شاندار مواقع فراہم کرنا ہے۔
                </div>
              ) : (
                <div className="text-xs sm:text-sm bg-white p-4 rounded-xl border border-[#E7E2DA] leading-relaxed text-stone-700 italic">
                  DEEZ Cosmetics' mission is to empower individuals and entrepreneurs across Pakistan through pure natural botanicals, uncompromised quality, and sustainable earning opportunities.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
