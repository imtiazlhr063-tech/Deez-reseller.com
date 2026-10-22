/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ResellerAuthPage } from './pages/ResellerAuthPage';
import { ResellerDashboardPage } from './pages/ResellerDashboardPage';
import { AdminControlPage } from './pages/AdminControlPage';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { PolicyModal } from './components/PolicyModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ToastContainer } from './components/ToastContainer';
import { Product, Order } from './types/store';

function MainRouter() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const { reseller } = useStore();

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [policyType, setPolicyType] = useState<'shipping' | 'return' | 'terms' | 'about' | null>(null);

  // Sync with browser navigation
  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Quick URL check for product slug or track
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/track-order') {
      setIsTrackOrderOpen(true);
    }
  }, []);

  const handleOpenTracking = (orderId?: string) => {
    setTrackingOrderId(orderId);
    setIsTrackOrderOpen(true);
  };

  const handlePrintInvoice = (order: Order) => {
    setInvoiceOrder(order);
  };

  // Render appropriate page content
  const renderPage = () => {
    if (currentRoute === '/deez-control') {
      return (
        <AdminControlPage
          onPrintInvoice={handlePrintInvoice}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    if (currentRoute.startsWith('/reseller')) {
      if (reseller && (currentRoute === '/reseller/dashboard' || currentRoute === '/reseller' || currentRoute === '/reseller/portal')) {
        return (
          <ResellerDashboardPage
            onSelectProduct={setSelectedProduct}
            onOpenCustomerCheckout={() => setIsCheckoutOpen(true)}
            onNavigate={navigate}
          />
        );
      }
      return (
        <ResellerAuthPage
          onSuccess={() => navigate('/reseller/dashboard')}
          onOpenTerms={() => setPolicyType('terms')}
        />
      );
    }

    if (currentRoute === '/shop') {
      return (
        <ShopPage
          onSelectProduct={setSelectedProduct}
        />
      );
    }

    if (currentRoute === '/track-order') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <h1 className="text-3xl font-serif-luxury font-bold text-stone-900">Track Your Cash on Delivery Parcel</h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Enter your Order ID (e.g. DZ-ORD-8821) or mobile number below to check courier dispatch status.
          </p>
          <button
            onClick={() => setIsTrackOrderOpen(true)}
            className="px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold rounded-xl"
          >
            Open Tracking Console
          </button>
        </div>
      );
    }

    if (currentRoute === '/about') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
          <span className="text-xs font-bold text-[#8C6D46] uppercase tracking-widest">Our Heritage</span>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
            About DEEZ Cosmetics Pakistan
          </h1>
          <div className="prose text-stone-700 text-sm leading-relaxed space-y-4">
            <p>
              DEEZ Cosmetics is a proudly Pakistani luxury beauty brand founded in Lahore. We formulate skincare, velvet matte lipsticks, kajals, and botanical mists specifically tailored for South Asian undertones and Pakistan's diverse climate conditions.
            </p>
            <p>
              From handpicked Kashmiri saffron and distilled Punjab Motia (Jasmine) to cold-pressed almond and castor oil kohl, our products honor ancient herbal wisdom while deploying clean modern cosmetic chemistry. Every item is 100% Halal certified and cruelty-free.
            </p>
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3">
              <h3 className="font-bold text-stone-900 text-base">Nationwide Reseller Empowerment</h3>
              <p className="text-xs text-stone-600">
                DEEZ provides an automated 5% commission reseller platform across Pakistan. Women, students, and home entrepreneurs earn sustainable monthly income with zero inventory risk. DEEZ manages customer dispatch via Cash on Delivery and reconciles all courier funds directly to reseller bank accounts and mobile wallets.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Default: Home Page
    return (
      <HomePage
        onSelectProduct={setSelectedProduct}
        onNavigate={navigate}
        onOpenPolicy={setPolicyType}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Header */}
      <Header
        onNavigate={navigate}
        currentRoute={currentRoute}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigate}
        onOpenPolicy={setPolicyType}
      />

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {}}
        onTrackOrder={handleOpenTracking}
        onPrintInvoice={handlePrintInvoice}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackingOrderId(undefined);
        }}
        initialOrderId={trackingOrderId}
      />

      <InvoiceModal
        order={invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      <PolicyModal
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

      {/* WhatsApp Floating Chat */}
      <FloatingWhatsApp />

      {/* Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
