export type Language = 'en' | 'ur';

export interface Translations {
  brandName: string;
  tagline: string;
  navShop: string;
  navTrackOrder: string;
  navResellerPortal: string;
  navAbout: string;
  navContact: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaShop: string;
  heroCtaReseller: string;
  searchPlaceholder: string;
  categoryAll: string;
  categorySkincare: string;
  categoryLips: string;
  categoryEyes: string;
  categoryFragrance: string;
  addToBag: string;
  outOfStock: string;
  inStock: string;
  freeShippingAlert: string;
  freeShippingQualified: string;
  subtotal: string;
  shipping: string;
  total: string;
  checkoutCod: string;
  cashOnDeliveryNotice: string;
  orderNumber: string;
  trackYourOrder: string;
  resellerBenefit: string;
  earnFivePercent: string;
  joinResellerProgram: string;
  pkr: string;
  reviews: string;
  ingredients: string;
  howToUse: string;
  customerDetails: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  deliveryAddress: string;
  optionalNotes: string;
  placeCodOrder: string;
  referralCodeApplied: string;
  orderSuccessTitle: string;
  orderSuccessMessage: string;
  halalCrueltyFree: string;
  nationwideCod: string;
  authenticFormulas: string;
  support247: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'DEEZ COSMETICS',
    tagline: "Pakistan's Luxury Beauty & Reseller Platform",
    navShop: 'Shop Catalog',
    navTrackOrder: 'Track Order',
    navResellerPortal: 'Reseller Portal',
    navAbout: 'About Us',
    navContact: 'Contact',
    heroKicker: 'Pure Botanicals & South Asian Glamour',
    heroTitle: 'Luxury Formulations Crafted for Pakistani Skin',
    heroSubtitle: 'Infused with pure Kashmiri saffron, organic botanicals, and high-impact pigments. Cash on Delivery nationwide across 250+ cities.',
    heroCtaShop: 'Explore Collection',
    heroCtaReseller: 'Become a Reseller (5% Commission)',
    searchPlaceholder: 'Search serums, matte velvets, kajal, attars...',
    categoryAll: 'All Products',
    categorySkincare: 'Skincare & Elixirs',
    categoryLips: 'Velvet Lipsticks',
    categoryEyes: 'Kohl & Eyes',
    categoryFragrance: 'Botanical Mists',
    addToBag: 'Add to Bag',
    outOfStock: 'Sold Out',
    inStock: 'In Stock',
    freeShippingAlert: 'Add items worth PKR {amount} more for FREE Delivery!',
    freeShippingQualified: '🎉 Congratulations! You have unlocked FREE Nationwide Delivery.',
    subtotal: 'Product Subtotal',
    shipping: 'Courier Shipping',
    total: 'Total Payable (COD)',
    checkoutCod: 'Cash on Delivery Checkout',
    cashOnDeliveryNotice: 'Pay in cash when your parcel is delivered at your doorstep by our verified courier partner.',
    orderNumber: 'Order ID',
    trackYourOrder: 'Track Your Parcel',
    resellerBenefit: 'Earn 5% on every sale across Pakistan',
    earnFivePercent: 'Earn 5% Commission on Eligible Sales',
    joinResellerProgram: 'Register as a Reseller',
    pkr: 'PKR',
    reviews: 'verified reviews',
    ingredients: 'Active Ingredients',
    howToUse: 'How to Apply',
    customerDetails: 'Delivery Details',
    fullName: 'Full Name',
    phoneNumber: 'Mobile Number (e.g. 0300-1234567)',
    province: 'Province',
    city: 'City / District',
    deliveryAddress: 'Complete House / Street Address',
    optionalNotes: 'Special Delivery Instructions (Optional)',
    placeCodOrder: 'Confirm Order (Cash on Delivery)',
    referralCodeApplied: 'Reseller Referral Active',
    orderSuccessTitle: 'Order Confirmed!',
    orderSuccessMessage: 'Thank you for shopping with DEEZ Cosmetics. Your parcel is being packed for dispatch.',
    halalCrueltyFree: '100% Halal & Cruelty-Free',
    nationwideCod: 'Cash on Delivery Across Pakistan',
    authenticFormulas: 'Artisanal Botanicals & Kashmiri Saffron',
    support247: 'Dedicated WhatsApp Support'
  },
  ur: {
    brandName: 'دیز کاسمیٹکس',
    tagline: 'پاکستان کا معیاری بیوٹی اسٹور اور ری سیلر نیٹ ورک',
    navShop: 'پروڈکٹس دیکھیں',
    navTrackOrder: 'آرڈر ٹریک کریں',
    navResellerPortal: 'ری سیلر پورٹل',
    navAbout: 'ہمارے متعلق',
    navContact: 'رابطہ کریں',
    heroKicker: 'خالص نباتاتی اجزاء اور روایتی نفاست',
    heroTitle: 'پاکستانی جلد اور موسم کے عین مطابق شاہکار بیوٹی مصنوعات',
    heroSubtitle: 'خالص کشمیری زعفران، نامیاتی عرقیات اور شاندار رنگ۔ پورے پاکستان کے 250 سے زائد شہروں میں کیش آن ڈیلیوری دستیاب۔',
    heroCtaShop: 'خریداری شروع کریں',
    heroCtaReseller: 'ری سیلر بنیں (5 فیصد کمیشن)',
    searchPlaceholder: 'سیرم، میٹ لپ اسٹک، کاجل یا عطر تلاش کریں...',
    categoryAll: 'تمام مصنوعات',
    categorySkincare: 'جلد کی نگہداشت',
    categoryLips: 'ویلوٹ لپ اسٹکس',
    categoryEyes: 'خالص کاجل اور آنکھیں',
    categoryFragrance: 'قدرتی معطر مسٹ',
    addToBag: 'بیگ میں شامل کریں',
    outOfStock: 'اسٹاک ختم',
    inStock: 'دستیاب ہے',
    freeShippingAlert: 'مفت ڈیلیوری کے لیے مزید {amount} روپے کی خریداری فرمائیں!',
    freeShippingQualified: '🎉 مبارک ہو! آپ کو پورے پاکستان میں مفت ڈیلیوری کی سہولت مل گئی ہے۔',
    subtotal: 'مصنوعات کی قیمت',
    shipping: 'کورئیر ڈیلیوری چارجز',
    total: 'کل واجب الادا رقم (کیش آن ڈیلیوری)',
    checkoutCod: 'کیش آن ڈیلیوری چیک آؤٹ',
    cashOnDeliveryNotice: 'کورئیر رائیڈر کو پارسل موصول ہونے کے وقت نقد رقم ادا فرمائیں۔',
    orderNumber: 'آرڈر نمبر',
    trackYourOrder: 'اپنے پارسل کی معلومات',
    resellerBenefit: 'ہر آرڈر پر 5 فیصد کمیشن کمائیں',
    earnFivePercent: 'اہل مصنوعات پر 5 فیصد محفوظ منافع',
    joinResellerProgram: 'ری سیلر اکاؤنٹ بنائیں',
    pkr: 'روپے',
    reviews: 'تصدیق شدہ تاثرات',
    ingredients: 'قدرتی اور فعال اجزاء',
    howToUse: 'استعمال کا صحیح طریقہ',
    customerDetails: 'ڈیلیوری کی مکمل تفصیلات',
    fullName: 'گاہک کا پورا نام',
    phoneNumber: 'موبائل نمبر (مثلاً 03001234567)',
    province: 'صوبہ منتخب کریں',
    city: 'شہر / علاقہ',
    deliveryAddress: 'مکان کا نمبر، گلی اور مکمل پتہ',
    optionalNotes: 'ڈیلیوری کے لیے ہدایات (اختیاری)',
    placeCodOrder: 'آرڈر کی تصدیق کریں (کیش آن ڈیلیوری)',
    referralCodeApplied: 'ری سیلر ریفرل کوڈ لاگو ہے',
    orderSuccessTitle: 'آپ کا آرڈر موصول ہو گیا ہے!',
    orderSuccessMessage: 'دیز کاسمیٹکس منتخب کرنے کا شکریہ۔ آپ کا پارسل روانگی کے لیے تیار کیا جا رہا ہے۔',
    halalCrueltyFree: '100 فیصد حلال اور معیاری',
    nationwideCod: 'پورے پاکستان میں کیش آن ڈیلیوری',
    authenticFormulas: 'خالص کشمیری زعفران اور نامیاتی بوٹیاں',
    support247: 'واٹس ایپ پر فوری رہنمائی'
  }
};
