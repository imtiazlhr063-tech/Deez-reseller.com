import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Order,
  Reseller,
  CommissionLedgerEntry,
  PayoutRequest,
  PlatformSettings,
  AdminUser,
  AuditLogEntry,
  ResellerSummary,
  CategoryConfig
} from '../src/types/store';

export interface SessionData {
  token: string;
  userId: string;
  role: 'admin' | 'reseller';
  email: string;
  name: string;
  expiresAt: number;
}

export interface StoreSchema {
  products: Product[];
  resellers: Reseller[];
  orders: Order[];
  commissionLedger: CommissionLedgerEntry[];
  payoutRequests: PayoutRequest[];
  settings: PlatformSettings;
  admins: AdminUser[];
  auditLogs: AuditLogEntry[];
  sessions: Record<string, SessionData>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'deez_store.json');

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'cat_1', name: 'Transparent Soaps', nameUrdu: 'شفاف صابن', slug: 'transparent-soaps', order: 1, isActive: true },
  { id: 'cat_2', name: 'Face Wash', nameUrdu: 'فیس واش', slug: 'face-wash', order: 2, isActive: true },
  { id: 'cat_3', name: 'Face Scrubs', nameUrdu: 'فیس سکرب', slug: 'face-scrubs', order: 3, isActive: true },
  { id: 'cat_4', name: 'Face Masks', nameUrdu: 'فیس ماسک', slug: 'face-masks', order: 4, isActive: true },
  { id: 'cat_5', name: 'Facial Cleansers', nameUrdu: 'فیشل کلینزر', slug: 'facial-cleansers', order: 5, isActive: true },
  { id: 'cat_6', name: 'Moisturizers', nameUrdu: 'موئسچرائزر', slug: 'moisturizers', order: 6, isActive: true },
  { id: 'cat_7', name: 'Face Creams', nameUrdu: 'فیس کریم', slug: 'face-creams', order: 7, isActive: true },
  { id: 'cat_8', name: 'Serums', nameUrdu: 'سیرمز', slug: 'serums', order: 8, isActive: true },
  { id: 'cat_9', name: 'Toners', nameUrdu: 'ٹونرز', slug: 'toners', order: 9, isActive: true },
  { id: 'cat_10', name: 'Sunscreens', nameUrdu: 'سن اسکرین', slug: 'sunscreens', order: 10, isActive: true },
  { id: 'cat_11', name: 'Body Lotions', nameUrdu: 'باڈی لوشن', slug: 'body-lotions', order: 11, isActive: true },
  { id: 'cat_12', name: 'Body Scrubs', nameUrdu: 'باڈی سکرب', slug: 'body-scrubs', order: 12, isActive: true },
  { id: 'cat_13', name: 'Body Wash', nameUrdu: 'باڈی واش', slug: 'body-wash', order: 13, isActive: true },
  { id: 'cat_14', name: 'Lip Care', nameUrdu: 'لپ کیئر', slug: 'lip-care', order: 14, isActive: true },
  { id: 'cat_15', name: 'Hair Care', nameUrdu: 'ہیئر کیئر', slug: 'hair-care', order: 15, isActive: true },
  { id: 'cat_16', name: 'Beauty and Personal Care', nameUrdu: 'بیوٹی اینڈ پرسنل کیئر', slug: 'beauty-personal-care', order: 16, isActive: true },
  { id: 'cat_17', name: 'Skincare Combos and Gift Bundles', nameUrdu: 'اسکن کیئر کمبوز اور گفٹ بنڈلز', slug: 'combos-bundles', order: 17, isActive: true },
  { id: 'cat_18', name: 'New Arrivals', nameUrdu: 'نئی آمد', slug: 'new-arrivals', order: 18, isActive: true, isSpecial: true },
  { id: 'cat_19', name: 'Best Sellers', nameUrdu: 'سب سے زیادہ فروخت ہونے والے', slug: 'best-sellers', order: 19, isActive: true, isSpecial: true },
  { id: 'cat_20', name: 'Special Offers', nameUrdu: 'خصوصی آفرز', slug: 'special-offers', order: 20, isActive: true, isSpecial: true }
];

const INITIAL_EXPANDED_PRODUCTS: Product[] = [
  {
    id: 'prod_soap_1',
    title: 'DEEZ Artisanal Transparent Botanical Honey & Glycerin Bar (125g)',
    titleUrdu: 'دیز قدرتی شفاف شہد اور گلیسرین صابن (125 گرام)',
    slug: 'artisanal-transparent-honey-glycerin-bar',
    category: 'transparent-soaps',
    price: 650,
    originalPrice: 800,
    stock: 95,
    sku: 'DZ-SOAP-01',
    image: '/src/assets/images/product_transparent_soap_1792646755587.jpg',
    images: [
      '/src/assets/images/product_transparent_soap_1792646755587.jpg',
      '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'
    ],
    description: 'A pure, crystal-clear transparent glycerin bar infused with natural raw Sidr honey and mountain botanical blossoms. Formulated at neutral pH to cleanse deeply without stripping moisture from delicate South Asian skin.',
    descriptionUrdu: 'خالص شفاف گلیسرین اور قدرتی بیری کے شہد سے تیار کردہ نفیس صابن جو جلد کی قدرتی نمی برقرار رکھتے ہوئے گہری صفائی فراہم کرتا ہے۔',
    ingredients: 'Pure Plant-derived Glycerin, Raw Sidr Honey, Sweet Almond Oil, Chamomile Flower Infusion, Vitamin E, Demineralized Water.',
    usageInstructions: 'Work into a rich, gentle lather between wet hands and massage over face and body. Rinse thoroughly with lukewarm water.',
    sizeOrWeight: '125g',
    variants: ['Classic Bar 125g', 'Double Pack (2x125g)'],
    featured: true,
    isBestSeller: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.9,
    reviewCount: 88,
    seoTitle: 'DEEZ Transparent Honey Glycerin Bar | Halal Luxury Soap Pakistan',
    seoDescription: 'Handcrafted transparent glycerin beauty soap with natural Sidr honey. Gentle on sensitive skin with Cash on Delivery across Pakistan.'
  },
  {
    id: 'prod_fw_1',
    title: 'DEEZ Aura Gentle Foaming Face Wash (150ml)',
    titleUrdu: 'دیز اورا جنٹل فومنگ فیس واش (150 ملی لیٹر)',
    slug: 'aura-gentle-foaming-face-wash',
    category: 'face-wash',
    price: 1350,
    originalPrice: 1600,
    stock: 70,
    sku: 'DZ-FW-01',
    image: '/src/assets/images/product_face_wash_1792646756929.jpg',
    images: [
      '/src/assets/images/product_face_wash_1792646756929.jpg'
    ],
    description: 'A sulfate-free, cloud-like self-foaming facial cleanser enriched with Rosa Damascena hydrosol and soothing Niacinamide. Dissolves excess oil, pollution, and sweat without disrupting the protective barrier.',
    descriptionUrdu: 'سلفیٹ سے پاک، نرم جھاگ والا فیس واش جو جلد کو بغیر خشک کیے گرد و غبار، اضافی چکنائی اور میک اپ کو نرمی سے صاف کرے۔',
    ingredients: 'Aqua, Rosa Damascena Hydrosol, Decyl Glucoside, Niacinamide (Vitamin B3), Panthenol (Pro-Vitamin B5), Aloe Barbadensis Leaf Juice, Citric Acid.',
    usageInstructions: 'Pump 1-2 clouds of foam onto damp palms, massage across face for 60 seconds in upward circular motions, and rinse clean.',
    sizeOrWeight: '150ml',
    variants: ['150ml Pump Bottle'],
    featured: true,
    isBestSeller: false,
    isNewArrival: true,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.8,
    reviewCount: 42,
    seoTitle: 'DEEZ Aura Foaming Face Wash | Gentle Hydrating Cleanser Pakistan',
    seoDescription: 'Sulfate-free foaming face wash with organic rose water and Vitamin B3. Ideal for daily Pakistani climate use.'
  },
  {
    id: 'prod_scrub_1',
    title: 'DEEZ Aurélia Gold Saffron & Apricot Exfoliating Scrub (100ml)',
    titleUrdu: 'دیز اوریلیا گولڈ زعفران اور خوبانی فیشل سکرب (100 ملی لیٹر)',
    slug: 'aurelia-gold-saffron-apricot-exfoliating-scrub',
    category: 'face-scrubs',
    price: 1750,
    originalPrice: 2100,
    stock: 50,
    sku: 'DZ-SCRUB-01',
    image: '/src/assets/images/product_exfoliating_scrub_1792646756262.jpg',
    images: [
      '/src/assets/images/product_exfoliating_scrub_1792646756262.jpg'
    ],
    description: 'A luxury micro-polishing cream exfoliator made with finely milled Hunza apricot kernels and Kashmiri saffron threads. Gently sweeps away dead surface cells and unclogs pores to reveal glowing, velvety radiance.',
    descriptionUrdu: 'ہنزہ کی قدرتی خوبانی کے باریک ذرات اور کشمیری زعفران سے بنا شاندار فیشل سکرب جو مردہ خلیات ہٹا کر چہرے کو بے داغ چمک بخشے۔',
    ingredients: 'Prunus Armeniaca (Apricot) Seed Powder, Crocus Sativus (Saffron) Extract, Jojoba Oil, Vegetable Squalane, Stearic Acid, Vitamin E.',
    usageInstructions: 'Gently massage a small amount onto damp face in small circles for 1 to 2 minutes, avoiding eye area. Rinse with warm water. Use 2 times a week.',
    sizeOrWeight: '100ml',
    variants: ['100ml Luxury Glass Jar'],
    featured: true,
    isBestSeller: false,
    isNewArrival: false,
    isSpecialOffer: true,
    status: 'active',
    isPublished: true,
    rating: 4.9,
    reviewCount: 57,
    seoTitle: 'DEEZ Aurélia Saffron & Apricot Scrub | Natural Exfoliation Pakistan',
    seoDescription: 'Finely milled apricot kernel and saffron facial scrub for smooth radiant South Asian complexion.'
  },
  {
    id: 'prod_1',
    title: 'DEEZ Saffron & 24K Gold Glow Elixir (30ml)',
    titleUrdu: 'دیز زعفران اور گولڈ گلو الیکسر (30 ملی لیٹر)',
    slug: 'saffron-24k-gold-glow-elixir',
    category: 'serums',
    price: 2450,
    originalPrice: 2800,
    stock: 65,
    sku: 'DZ-SKN-01',
    image: '/src/assets/images/product_glow_serum_1792560903907.jpg',
    images: [
      '/src/assets/images/product_glow_serum_1792560903907.jpg',
      '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'
    ],
    description: 'An artisanal brightening serum infused with handpicked organic Kashmir saffron, 15% Vitamin C, and hyaluronic acid. Imparts an ethereal, glass-skin radiant glow while diminishing blemishes and hyperpigmentation under Pakistani climate conditions.',
    descriptionUrdu: 'خالص کشمیری زعفران، وٹامن سی اور ہائیلورونک ایسڈ سے تیار کردہ شاہکار سیرم۔ جلد کو فوری نکھار، گلاس سکن چمک اور داغ دھبوں سے مکمل نجات فراہم کرے۔',
    ingredients: 'Pure Kashmiri Saffron (Crocus Sativus), 15% Ethyl Ascorbic Acid (Vitamin C), Botanical Hyaluronic Acid, Rosehip Seed Oil, Licorice Root Extract, Ferulic Acid, 24K Gold Micro-flakes.',
    usageInstructions: 'Dispense 3-4 drops onto palms and gently press onto freshly cleansed, slightly damp skin every morning and evening before moisturizing. Follow with sun protection during day time.',
    sizeOrWeight: '30ml',
    variants: ['30ml Dropper Bottle'],
    featured: true,
    isBestSeller: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.9,
    reviewCount: 148,
    seoTitle: 'DEEZ Saffron & 24K Gold Glow Elixir | Luxury Saffron Serum Pakistan',
    seoDescription: '15% Vitamin C and pure Kashmir saffron elixir for glowing Pakistani skin.'
  },
  {
    id: 'prod_2',
    title: 'DEEZ Velvet Matte Liquid Lipstick - Lahore Rose 01',
    titleUrdu: 'دیز ویلوٹ میٹ لپ اسٹک - لاہور روز 01',
    slug: 'velvet-matte-lipstick-lahore-rose',
    category: 'lip-care',
    price: 1450,
    originalPrice: 1700,
    stock: 110,
    sku: 'DZ-LIP-01',
    image: '/src/assets/images/product_matte_velvet_1792560904392.jpg',
    images: ['/src/assets/images/product_matte_velvet_1792560904392.jpg'],
    description: 'A weightless, feather-soft velvet matte liquid lipstick in a flattering universal warm terracotta rose hue. Designed specifically for South Asian undertones with up to 16 hours transfer-proof wear without cracking or drying.',
    descriptionUrdu: 'ہلکی پھلکی اور نرم ویلوٹ میٹ لیکوڈ لپ اسٹک، خاص طور پر دیسی اسکن ٹون کے لیے تیار کردہ نفیس رنگ۔ 16 گھنٹے تک پائیدار بغیر ہونٹوں کو خشک کیے۔',
    ingredients: 'Isododecane, Dimethicone, Jojoba Seed Oil, Tocopheryl Acetate (Vitamin E), Organic Candelilla Wax, South Asian mineral color pigments.',
    usageInstructions: 'Define lip boundaries using the precision applicator tip, then fill lips in a single fluid stroke. Allow 45 seconds to set completely into a velvety matte finish.',
    sizeOrWeight: '6ml',
    variants: ['Lahore Rose 01', 'Karachi Sunset 02', 'Rawalpindi Ruby 03'],
    featured: true,
    isBestSeller: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.8,
    reviewCount: 96,
    seoTitle: 'DEEZ Velvet Matte Liquid Lipstick Lahore Rose | 16H Wear Pakistan',
    seoDescription: 'Transfer-proof velvet matte lipstick crafted for Pakistani warm undertones.'
  },
  {
    id: 'prod_3',
    title: 'DEEZ Hydra-Dew Regenerating Peptide Cream (50ml)',
    titleUrdu: 'دیز ہائیڈرا ڈیو ری جنریٹنگ پیپٹائڈ کریم (50 ملی لیٹر)',
    slug: 'hydra-dew-regenerating-peptide-cream',
    category: 'face-creams',
    price: 2850,
    originalPrice: 3200,
    stock: 40,
    sku: 'DZ-SKN-02',
    image: '/src/assets/images/product_hydra_cream_1792560905936.jpg',
    images: ['/src/assets/images/product_hydra_cream_1792560905936.jpg'],
    description: 'A rich yet rapidly absorbing barrier-restoring moisturizer crafted with multi-peptides, Centella Asiatica, and distilled Rosa Damascena hydrosol. Plumps fine lines, locks deep 48-hour moisture, and soothes weather-stressed skin.',
    descriptionUrdu: 'ملٹی پیپٹائڈز، سنٹیلا اور دیسی گلاب کے عرق سے لبریز شاندار موئسچرائزر جو جلد کی قدرتی نمی بحال کر کے شادابی اور لچک پیدا کرتا ہے۔',
    ingredients: 'Rosa Damascena Flower Water, Multi-Peptide Complex (Palmitoyl Tripeptide-1 & 7), Ceramide NP, Squalane, Niacinamide, Shea Butter, Centella Asiatica Extract.',
    usageInstructions: 'Smooth a nickel-sized amount over face, neck, and décolletage after serums. Massage in gentle upward circular motions until fully absorbed.',
    sizeOrWeight: '50ml',
    variants: ['50ml Frosted Jar'],
    featured: true,
    isBestSeller: false,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 5.0,
    reviewCount: 74,
    seoTitle: 'DEEZ Hydra-Dew Peptide Cream | Barrier Repair Moisturizer Pakistan',
    seoDescription: 'Intense 48-hour moisture and skin barrier restoration with multi-peptides and ceramides.'
  },
  {
    id: 'prod_4',
    title: 'DEEZ Midnight Waterproof Kohl Kajal Pencil',
    titleUrdu: 'دیز مڈ نائٹ واٹر پروف کاجل پینسل',
    slug: 'midnight-waterproof-kohl-kajal',
    category: 'beauty-personal-care',
    price: 950,
    originalPrice: 1200,
    stock: 179,
    sku: 'DZ-EYE-01',
    image: '/src/assets/images/product_kohl_kajal_1792560905317.jpg',
    images: ['/src/assets/images/product_kohl_kajal_1792560905317.jpg'],
    description: 'Traditional Ayurvedic Kohl reformulated with modern high-performance technology. Delivers jet-black, 24-hour waterproof, smudge-proof intensity. Enriched with cold-pressed Sweet Almond Oil and Triphala to soothe and nourish delicate waterlines.',
    descriptionUrdu: 'روایتی خالص کاجل کی نئی جدید شکل۔ 24 گھنٹے تک واٹر پروف، گہرے سیاہ رنگ کے ساتھ۔ بادام کے تیل اور ہرڑ سے بھرپور جو آنکھوں کو ٹھنڈک اور چمک دے۔',
    ingredients: 'Activated Botanical Carbon Black, Cold-Pressed Prunus Amygdalus Dulcis (Sweet Almond) Oil, Ricinus Communis (Castor) Seed Oil, Triphala Herbal Extract, Carnauba Wax.',
    usageInstructions: 'Glide effortlessly along the waterline, tightline, or lash line. For a smokey eye look, blend gently with a smudger brush within the first 30 seconds before setting.',
    sizeOrWeight: '1.2g',
    variants: ['Deep Night Black'],
    featured: false,
    isBestSeller: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.9,
    reviewCount: 215,
    seoTitle: 'DEEZ Midnight Kohl Kajal Pencil | 24H Waterproof Smudge-Proof',
    seoDescription: 'Almond oil and triphala enriched deep jet black kajal for sensitive waterlines.'
  },
  {
    id: 'prod_5',
    title: 'DEEZ Royal Jasmine & Amber Botanical Mist (50ml)',
    titleUrdu: 'دیز رائل چنبیلی اور عنبر پرفیوم مسٹ (50 ملی لیٹر)',
    slug: 'royal-jasmine-amber-botanical-mist',
    category: 'beauty-personal-care',
    price: 1950,
    originalPrice: 2300,
    stock: 55,
    sku: 'DZ-FRG-01',
    image: '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg',
    images: ['/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'],
    description: 'An enchanting, alcohol-free hydro-botanical fragrance mist distilling nocturnal Punjab Motia (Arabian Jasmine) and warm royal amber. Lingers with sophistication on skin, hair, and traditional fabrics without staining.',
    descriptionUrdu: 'الکوحل سے پاک قدرتی موتیے اور شاہی عنبر کا سحر انگیز معطر مسٹ۔ جلد اور ملبوسات پر دیرپا اور پرسکون خوشبو چھوڑے۔',
    ingredients: 'Distilled Jasminum Sambac Hydrosol, Natural Amber Resin Tincture, Santalum Album (Sandalwood) Extract, Aloe Vera Leaf Juice, Vegetable Glycerin.',
    usageInstructions: 'Spritz generously onto pulse points, hair, and apparel from 6 inches away. Reapply throughout the day for an invigorating burst of royal fragrance.',
    sizeOrWeight: '50ml',
    variants: ['50ml Glass Spritzer'],
    featured: true,
    isBestSeller: false,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'active',
    isPublished: true,
    rating: 4.7,
    reviewCount: 62,
    seoTitle: 'DEEZ Royal Jasmine Botanical Mist | Alcohol-Free Perfume Pakistan',
    seoDescription: 'Natural Motia Jasmine and Kashmiri Amber hydro-mist for skin and hair.'
  }
];

let storeMemoryCache: StoreSchema | null = null;

export function getStore(): StoreSchema {
  if (storeMemoryCache) {
    return storeMemoryCache;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const adminSalt = generateSalt();
    const adminHash = hashPassword('Admin@DEEZ2026!', adminSalt);
    const resellerSalt = generateSalt();
    const resellerHash = hashPassword('reseller123', resellerSalt);

    const initialData: StoreSchema = {
      products: INITIAL_EXPANDED_PRODUCTS,
      resellers: [
        {
          id: 'DZ-RES-1049',
          fullName: 'Sara Khan',
          mobileNumber: '03001234567',
          email: 'sara.reseller@example.com',
          passwordHash: resellerHash,
          salt: resellerSalt,
          city: 'Lahore',
          province: 'Punjab',
          address: 'House 42-B, Model Town, Lahore',
          socialLink: 'instagram.com/sara_beauty_pk',
          referralCode: 'DEEZ-SARA-05',
          status: 'Approved',
          commissionRateOverride: null,
          paymentDetails: {
            method: 'EasyPaisa',
            accountTitle: 'Sara Khan',
            accountNumber: '03001234567'
          },
          createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          approvedAt: new Date(Date.now() - 14 * 86400000).toISOString()
        }
      ],
      orders: [],
      commissionLedger: [],
      payoutRequests: [],
      settings: {
        commissionRate: 0.05,
        shippingFee: 199,
        freeShippingThreshold: 3500,
        whatsappNumber: '03034507537',
        whatsappWelcomeMessage: 'Assalam-o-Alaikum DEEZ Cosmetics! I would like to inquire about your products and reseller program.',
        supportEmail: 'support@deezcosmetics.pk',
        storeAddress: 'DEEZ Cosmetics Pakistan Head Office, Main Boulevard, Gulberg III, Lahore',
        siteTitle: 'DEEZ Cosmetics Pakistan',
        categories: DEFAULT_CATEGORIES
      },
      admins: [
        {
          id: 'adm_master',
          email: 'admin@deezcosmetics.pk',
          passwordHash: adminHash,
          salt: adminSalt,
          name: 'DEEZ Master Administrator',
          role: 'SuperAdmin',
          createdAt: new Date().toISOString()
        }
      ],
      auditLogs: [
        {
          id: 'log_init',
          adminEmail: 'system',
          action: 'STORE_INITIALIZED',
          details: 'Initial database schema and expanded 20-category DEEZ catalog initialized.',
          timestamp: new Date().toISOString()
        }
      ],
      sessions: {}
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    storeMemoryCache = initialData;
    return storeMemoryCache;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    storeMemoryCache = JSON.parse(raw);

    // MIGRATION & PRESERVATION CHECK:
    // Ensure existing database gets categories if missing, and transparent soap if missing
    let modified = false;

    if (!storeMemoryCache!.settings.categories || storeMemoryCache!.settings.categories.length === 0) {
      storeMemoryCache!.settings.categories = DEFAULT_CATEGORIES;
      modified = true;
    }

    if (!storeMemoryCache!.settings.whatsappNumber || storeMemoryCache!.settings.whatsappNumber === '+923001234567') {
      storeMemoryCache!.settings.whatsappNumber = '03034507537';
      modified = true;
    }

    if (!storeMemoryCache!.settings.whatsappWelcomeMessage) {
      storeMemoryCache!.settings.whatsappWelcomeMessage = 'Assalam-o-Alaikum DEEZ Cosmetics! I would like to inquire about products and reseller program.';
      modified = true;
    }

    // Ensure transparent soap and scrub products exist in products list
    for (const expProd of INITIAL_EXPANDED_PRODUCTS) {
      const exists = storeMemoryCache!.products.find(p => p.id === expProd.id);
      if (!exists) {
        storeMemoryCache!.products.push(expProd);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(storeMemoryCache, null, 2), 'utf-8');
    }

    return storeMemoryCache!;
  } catch (err) {
    console.error('Failed reading database file:', err);
    throw err;
  }
}

export function saveStore(store: StoreSchema): void {
  storeMemoryCache = store;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function logAudit(adminEmail: string, action: string, details: string): void {
  const store = getStore();
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    adminEmail,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
}

export function getResellerMetrics(resellerId: string): ResellerSummary | null {
  const store = getStore();
  const reseller = store.resellers.find(r => r.id === resellerId);
  if (!reseller) return null;

  const resellerOrders = store.orders.filter(o => o.resellerId === resellerId);
  const totalOrders = resellerOrders.length;
  const deliveredOrders = resellerOrders.filter(o => o.orderStatus === 'Delivered').length;
  const pendingOrders = resellerOrders.filter(o => o.orderStatus === 'Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Dispatched').length;
  const cancelledReturnedOrders = resellerOrders.filter(o => o.orderStatus === 'Cancelled' || o.orderStatus === 'Returned').length;

  const eligibleOrders = resellerOrders.filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Returned');
  const eligibleSales = eligibleOrders.reduce((sum, o) => sum + o.productSubtotal, 0);

  const pendingCommission = resellerOrders
    .filter(o => o.commissionStatus === 'Pending')
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  const confirmedOrdersCommission = resellerOrders
    .filter(o => o.commissionStatus === 'Confirmed')
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  const paidPayouts = store.payoutRequests
    .filter(p => p.resellerId === resellerId && p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const requestedPayouts = store.payoutRequests
    .filter(p => p.resellerId === resellerId && p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmedCommission = confirmedOrdersCommission;
  const paidCommission = paidPayouts;
  const outstandingCommission = Math.max(0, confirmedCommission - paidPayouts - requestedPayouts);

  return {
    resellerId: reseller.id,
    fullName: reseller.fullName,
    mobileNumber: reseller.mobileNumber,
    email: reseller.email,
    city: reseller.city,
    province: reseller.province,
    referralCode: reseller.referralCode,
    status: reseller.status,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    cancelledReturnedOrders,
    eligibleSales,
    pendingCommission,
    confirmedCommission,
    paidCommission,
    outstandingCommission,
    internalNotes: reseller.internalNotes,
    createdAt: reseller.createdAt
  };
}
