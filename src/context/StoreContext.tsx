import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Reseller, ResellerSummary, PlatformSettings } from '../types/store';
import { Language, translations, Translations } from '../utils/translations';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CartItem extends OrderItem {}

interface StoreContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  resellerToken: string | null;
  reseller: Reseller | null;
  resellerMetrics: ResellerSummary | null;
  setResellerAuth: (token: string | null, reseller: Reseller | null, metrics?: ResellerSummary | null) => void;
  resellerLogout: () => void;
  adminToken: string | null;
  adminUser: { id: string; email: string; name: string; role: string } | null;
  setAdminAuth: (token: string | null, admin: any | null) => void;
  adminLogout: () => void;
  storeConfig: PlatformSettings | null;
  refreshConfig: () => Promise<void>;
  firebaseUser: any | null;
  isFirebaseLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('deez_lang') as Language) || 'en';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('deez_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [referralCode, setReferralCodeState] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref') || params.get('referral');
    if (refParam) {
      localStorage.setItem('deez_ref_code', refParam.trim().toUpperCase());
      return refParam.trim().toUpperCase();
    }
    return localStorage.getItem('deez_ref_code') || null;
  });

  const [resellerToken, setResellerToken] = useState<string | null>(() => {
    return localStorage.getItem('deez_reseller_token') || null;
  });
  const [reseller, setReseller] = useState<Reseller | null>(() => {
    try {
      const saved = localStorage.getItem('deez_reseller_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [resellerMetrics, setResellerMetrics] = useState<ResellerSummary | null>(null);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('deez_admin_token') || null;
  });
  const [adminUser, setAdminUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('deez_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [storeConfig, setStoreConfig] = useState<PlatformSettings | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const loginWithGoogle = async () => {
    showToast('Direct checkout and orders are active without login!', 'info');
    setIsAuthModalOpen(false);
  };

  const logoutUser = async () => {
    setFirebaseUser(null);
    showToast('Signed out.', 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('deez_lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('deez_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed saving cart', e);
    }
  }, [cart]);

  // URL query referral check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');
    if (ref) {
      const code = ref.trim().toUpperCase();
      setReferralCodeState(code);
      localStorage.setItem('deez_ref_code', code);
      showToast(`Shopping with DEEZ Reseller referral code: ${code}`, 'success');
    }
  }, []);

  const refreshConfig = async () => {
    try {
      const res = await fetch('/api/public/config');
      if (res.ok) {
        const data = await res.json();
        setStoreConfig(data);
      }
    } catch (err) {
      console.error('Failed fetching store config:', err);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`${product.title} is currently out of stock.`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more. Only ${product.stock} units available in stock.`, 'error');
          return prev;
        }
        showToast(`Updated "${product.title}" in your bag (${newQty})`, 'success');
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * product.price }
            : item
        );
      } else {
        showToast(`Added "${product.title}" to your shopping bag!`, 'success');
        return [
          ...prev,
          {
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: Math.min(quantity, product.stock),
            subtotal: Math.min(quantity, product.stock) * product.price,
            image: product.image,
            sku: product.sku
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast('Item removed from shopping bag', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('deez_cart');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const setReferralCode = (code: string | null) => {
    if (code) {
      const clean = code.trim().toUpperCase();
      setReferralCodeState(clean);
      localStorage.setItem('deez_ref_code', clean);
    } else {
      setReferralCodeState(null);
      localStorage.removeItem('deez_ref_code');
    }
  };

  const setResellerAuth = (token: string | null, resellerData: Reseller | null, metrics?: ResellerSummary | null) => {
    setResellerToken(token);
    setReseller(resellerData);
    if (metrics !== undefined) setResellerMetrics(metrics);

    if (token && resellerData) {
      localStorage.setItem('deez_reseller_token', token);
      localStorage.setItem('deez_reseller_user', JSON.stringify(resellerData));
    } else {
      localStorage.removeItem('deez_reseller_token');
      localStorage.removeItem('deez_reseller_user');
      setResellerMetrics(null);
    }
  };

  const resellerLogout = () => {
    setResellerAuth(null, null, null);
    showToast('Logged out from reseller portal.', 'info');
  };

  const setAdminAuth = (token: string | null, admin: any | null) => {
    setAdminToken(token);
    setAdminUser(admin);
    if (token && admin) {
      localStorage.setItem('deez_admin_token', token);
      localStorage.setItem('deez_admin_user', JSON.stringify(admin));
    } else {
      localStorage.removeItem('deez_admin_token');
      localStorage.removeItem('deez_admin_user');
    }
  };

  const adminLogout = () => {
    setAdminAuth(null, null);
    showToast('Logged out from DEEZ Control Panel.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        referralCode,
        setReferralCode,
        resellerToken,
        reseller,
        resellerMetrics,
        setResellerAuth,
        resellerLogout,
        adminToken,
        adminUser,
        setAdminAuth,
        adminLogout,
        storeConfig,
        refreshConfig,
        firebaseUser,
        isFirebaseLoading,
        loginWithGoogle,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
