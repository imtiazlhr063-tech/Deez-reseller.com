import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { storeConfig } = useStore();

  const rawPhone = (storeConfig?.whatsappNumber?.trim() || '03034507537');

  if (!rawPhone || rawPhone.toUpperCase().includes('PLACEHOLDER')) {
    return null;
  }

  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (digits.length < 10) {
    return null;
  }

  // If local Pakistani format starting with '03...', convert to international '923...'
  const intlNumber = digits.startsWith('0') ? '92' + digits.slice(1) : digits;

  const defaultMsg = storeConfig?.whatsappWelcomeMessage || 'Assalam-o-Alaikum DEEZ Cosmetics! I would like to inquire about your products.';
  const encodedText = encodeURIComponent(defaultMsg);
  const whatsappUrl = `https://wa.me/${intlNumber}?text=${encodedText}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group cursor-pointer border-2 border-white/40"
      aria-label="Chat with DEEZ Cosmetics on WhatsApp"
      title="Chat with DEEZ Cosmetics on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
      <span className="hidden sm:inline-block text-xs font-semibold pr-1 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        WhatsApp DEEZ Support
      </span>
    </button>
  );
};
