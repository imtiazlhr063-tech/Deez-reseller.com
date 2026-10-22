import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getStore,
  saveStore,
  hashPassword,
  generateSalt,
  generateToken,
  logAudit,
  getResellerMetrics
} from './server/db.js';
import {
  Order,
  Product,
  Reseller,
  PayoutRequest,
  CommissionLedgerEntry
} from './src/types/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Auth Helper Middlewares
function getAuthSession(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const store = getStore();
  const session = store.sessions[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete store.sessions[token];
    saveStore(store);
    return null;
  }
  return session;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getAuthSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  (req as any).adminSession = session;
  next();
}

function requireReseller(req: Request, res: Response, next: NextFunction) {
  const session = getAuthSession(req);
  if (!session || session.role !== 'reseller') {
    return res.status(401).json({ error: 'Unauthorized: Reseller login required' });
  }
  (req as any).resellerSession = session;
  next();
}

// -------------------------------------------------------------
// PUBLIC STORE APIS
// -------------------------------------------------------------

// Public store configuration
app.get('/api/public/config', (req, res) => {
  const store = getStore();
  res.json({
    siteTitle: store.settings.siteTitle,
    shippingFee: store.settings.shippingFee,
    freeShippingThreshold: store.settings.freeShippingThreshold,
    whatsappNumber: store.settings.whatsappNumber || '',
    whatsappWelcomeMessage: store.settings.whatsappWelcomeMessage || '',
    supportEmail: store.settings.supportEmail,
    storeAddress: store.settings.storeAddress,
    commissionRate: store.settings.commissionRate,
    categories: store.settings.categories?.filter(c => c.isActive) || []
  });
});

// Public categories
app.get('/api/public/categories', (req, res) => {
  const store = getStore();
  res.json(store.settings.categories?.filter(c => c.isActive) || []);
});

// Public products listing with category and search filtering
app.get('/api/public/products', (req, res) => {
  const store = getStore();
  const { category, search, sort } = req.query;

  let products = store.products.filter(p => p.isPublished && p.status !== 'archived');

  if (category && category !== 'all') {
    if (category === 'new-arrivals') {
      products = products.filter(p => p.isNewArrival);
    } else if (category === 'best-sellers') {
      products = products.filter(p => p.isBestSeller);
    } else if (category === 'special-offers') {
      products = products.filter(p => p.isSpecialOffer || (p.salePrice && p.salePrice < p.price));
    } else {
      products = products.filter(p => p.category === category);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.titleUrdu && p.titleUrdu.includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'name') {
    products.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Default featured first
    products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json(products);
});

// Single product details
app.get('/api/public/products/:slug', (req, res) => {
  const store = getStore();
  const product = store.products.find(p => p.slug === req.params.slug && p.isPublished);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Validate referral code
app.get('/api/public/validate-referral/:code', (req, res) => {
  const store = getStore();
  const code = req.params.code.trim().toUpperCase();
  const reseller = store.resellers.find(
    r => r.referralCode.toUpperCase() === code && r.status === 'Approved'
  );
  if (!reseller) {
    return res.status(404).json({ valid: false, message: 'Invalid or inactive referral code' });
  }
  res.json({
    valid: true,
    resellerId: reseller.id,
    resellerName: reseller.fullName,
    referralCode: reseller.referralCode
  });
});

// Cash on Delivery Order Checkout
app.post('/api/public/checkout', (req, res) => {
  const { customerName, customerPhone, province, city, address, deliveryNotes, items, referralCode } = req.body;

  if (!customerName || !customerPhone || !province || !city || !address) {
    return res.status(400).json({ error: 'Please provide full customer name, phone number, province, city, and delivery address.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Shopping cart is empty.' });
  }

  const store = getStore();

  // Validate items and inventory
  let productSubtotal = 0;
  const verifiedOrderItems = [];

  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId && p.isPublished);
    if (!product) {
      return res.status(400).json({ error: `Product "${item.title || item.productId}" is not available.` });
    }
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (product.stock < qty) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.title}". Only ${product.stock} units available.`
      });
    }

    const itemSubtotal = product.price * qty;
    productSubtotal += itemSubtotal;

    verifiedOrderItems.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: qty,
      subtotal: itemSubtotal,
      image: product.image,
      sku: product.sku
    });
  }

  // Deduct inventory
  for (const item of verifiedOrderItems) {
    const product = store.products.find(p => p.id === item.productId)!;
    product.stock -= item.quantity;
  }

  // Calculate Shipping (Free above threshold)
  const shippingFee = productSubtotal >= store.settings.freeShippingThreshold ? 0 : store.settings.shippingFee;
  const totalAmount = productSubtotal + shippingFee;

  // Reseller Attribution & 5% Commission calculation
  let attributedReseller: Reseller | null = null;
  if (referralCode) {
    const normalizedCode = referralCode.trim().toUpperCase();
    const found = store.resellers.find(r => r.referralCode.toUpperCase() === normalizedCode && r.status === 'Approved');
    if (found) {
      attributedReseller = found;
    }
  }

  // Strict commission calculation: Eligible product subtotal only (EXCLUDES shipping and non-product fees)
  const effectiveCommissionRate = attributedReseller
    ? (attributedReseller.commissionRateOverride ?? store.settings.commissionRate)
    : store.settings.commissionRate;

  const commissionAmount = attributedReseller
    ? Math.round(productSubtotal * effectiveCommissionRate)
    : 0;

  const orderId = `DZ-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    province: province.trim(),
    city: city.trim(),
    address: address.trim(),
    deliveryNotes: deliveryNotes ? deliveryNotes.trim() : '',
    items: verifiedOrderItems,
    productSubtotal,
    shippingFee,
    totalAmount,
    paymentMethod: 'COD',
    orderStatus: 'Placed',
    resellerId: attributedReseller ? attributedReseller.id : null,
    referralCode: attributedReseller ? attributedReseller.referralCode : null,
    resellerName: attributedReseller ? attributedReseller.fullName : null,
    eligibleCommissionBase: productSubtotal,
    commissionRate: effectiveCommissionRate,
    commissionAmount,
    commissionStatus: attributedReseller ? 'Pending' : 'Pending',
    courier: {
      company: '',
      trackingNumber: '',
      dispatchDate: ''
    },
    cod: {
      amountExpected: totalAmount,
      amountCollected: 0,
      remittanceRef: '',
      remittanceDate: '',
      reconciliationStatus: 'Unreconciled'
    },
    createdAt: now,
    updatedAt: now
  };

  store.orders.unshift(newOrder);

  // If reseller attributed, add transaction to Commission Ledger
  if (attributedReseller && commissionAmount > 0) {
    const metrics = getResellerMetrics(attributedReseller.id);
    const ledgerEntry: CommissionLedgerEntry = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      resellerId: attributedReseller.id,
      orderId: newOrder.id,
      type: 'CREDIT_PENDING',
      amount: commissionAmount,
      balanceAfter: metrics ? metrics.confirmedCommission : 0,
      note: `Pending 5% Commission on Order ${newOrder.id} (Eligible Product Subtotal: PKR ${productSubtotal.toLocaleString()})`,
      timestamp: now
    };
    store.commissionLedger.unshift(ledgerEntry);
  }

  saveStore(store);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Order placed successfully! Cash on Delivery confirmed.'
  });
});

// Order Tracking API
app.get('/api/public/orders/track', (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Please provide an Order ID or Mobile Number to track.' });
  }

  const cleanQuery = query.trim().toUpperCase();
  const phoneQuery = query.replace(/[^0-9]/g, '');
  const store = getStore();

  const matchingOrders = store.orders.filter(o => {
    return (
      o.id.toUpperCase() === cleanQuery ||
      (phoneQuery.length >= 7 && o.customerPhone.replace(/[^0-9]/g, '').includes(phoneQuery))
    );
  });

  if (matchingOrders.length === 0) {
    return res.status(404).json({ error: 'No order found matching the provided details.' });
  }

  // Sanitize for customer tracking view
  const publicOrders = matchingOrders.map(o => ({
    id: o.id,
    customerName: o.customerName,
    city: o.city,
    province: o.province,
    items: o.items.map(i => ({ title: i.title, quantity: i.quantity, price: i.price })),
    totalAmount: o.totalAmount,
    productSubtotal: o.productSubtotal,
    shippingFee: o.shippingFee,
    orderStatus: o.orderStatus,
    courier: o.courier,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt
  }));

  res.json(publicOrders);
});

// -------------------------------------------------------------
// RESELLER PORTAL APIS
// -------------------------------------------------------------

// Reseller Registration
app.post('/api/reseller/register', (req, res) => {
  const { fullName, mobileNumber, email, password, city, province, address, socialLink, acceptedTerms } = req.body;

  if (!fullName || !mobileNumber || !password || !city || !province) {
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Mobile, Password, City, Province).' });
  }

  if (!acceptedTerms) {
    return res.status(400).json({ error: 'You must accept the DEEZ Reseller Terms & Conditions to register.' });
  }

  const store = getStore();

  // Check duplicates
  const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
  const existingMobile = store.resellers.find(r => r.mobileNumber.replace(/[^0-9]/g, '') === cleanMobile);
  if (existingMobile) {
    return res.status(400).json({ error: 'An account with this mobile number already exists.' });
  }

  if (email && email.trim()) {
    const existingEmail = store.resellers.find(r => r.email.toLowerCase() === email.trim().toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const resellerId = `DZ-RES-${Math.floor(1000 + Math.random() * 9000)}`;

  // Generate Referral Code
  const firstName = fullName.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase() || 'DEEZ';
  const referralCode = `DEEZ-${firstName}-${Math.floor(10 + Math.random() * 90)}`;

  const newReseller: Reseller = {
    id: resellerId,
    fullName: fullName.trim(),
    mobileNumber: mobileNumber.trim(),
    email: email ? email.trim() : '',
    passwordHash,
    salt,
    city: city.trim(),
    province: province.trim(),
    address: address ? address.trim() : '',
    socialLink: socialLink ? socialLink.trim() : '',
    referralCode,
    status: 'Pending', // Requires Admin approval
    commissionRateOverride: null,
    createdAt: new Date().toISOString()
  };

  store.resellers.push(newReseller);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully! Your application is under review by DEEZ admin.',
    resellerId: newReseller.id,
    referralCode: newReseller.referralCode,
    status: newReseller.status
  });
});

// Reseller Login
app.post('/api/reseller/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter your mobile number/email and password.' });
  }

  const store = getStore();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanMobile = identifier.replace(/[^0-9]/g, '');

  const reseller = store.resellers.find(r =>
    (r.email && r.email.toLowerCase() === cleanIdentifier) ||
    r.mobileNumber.replace(/[^0-9]/g, '') === cleanMobile
  );

  if (!reseller) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your mobile/email and password.' });
  }

  const checkHash = hashPassword(password, reseller.salt);
  if (checkHash !== reseller.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  const token = generateToken();
  const sessionData = {
    token,
    userId: reseller.id,
    role: 'reseller' as const,
    email: reseller.email || reseller.mobileNumber,
    name: reseller.fullName,
    expiresAt: Date.now() + 7 * 86400000 // 7 days
  };

  store.sessions[token] = sessionData;
  saveStore(store);

  const metrics = getResellerMetrics(reseller.id);

  res.json({
    token,
    reseller: {
      id: reseller.id,
      fullName: reseller.fullName,
      mobileNumber: reseller.mobileNumber,
      email: reseller.email,
      city: reseller.city,
      province: reseller.province,
      referralCode: reseller.referralCode,
      status: reseller.status,
      paymentDetails: reseller.paymentDetails
    },
    metrics
  });
});

// Reseller Dashboard Data
app.get('/api/reseller/me', requireReseller, (req, res) => {
  const session = (req as any).resellerSession;
  const store = getStore();
  const reseller = store.resellers.find(r => r.id === session.userId);
  if (!reseller) {
    return res.status(404).json({ error: 'Reseller not found.' });
  }

  const metrics = getResellerMetrics(reseller.id);
  res.json({
    reseller: {
      id: reseller.id,
      fullName: reseller.fullName,
      mobileNumber: reseller.mobileNumber,
      email: reseller.email,
      city: reseller.city,
      province: reseller.province,
      address: reseller.address,
      socialLink: reseller.socialLink,
      referralCode: reseller.referralCode,
      status: reseller.status,
      paymentDetails: reseller.paymentDetails,
      createdAt: reseller.createdAt,
      approvedAt: reseller.approvedAt
    },
    metrics
  });
});

// Reseller's own Orders
app.get('/api/reseller/orders', requireReseller, (req, res) => {
  const session = (req as any).resellerSession;
  const store = getStore();
  const orders = store.orders.filter(o => o.resellerId === session.userId);
  res.json(orders);
});

// Reseller's commission ledger & payouts
app.get('/api/reseller/commissions', requireReseller, (req, res) => {
  const session = (req as any).resellerSession;
  const store = getStore();
  const ledger = store.commissionLedger.filter(l => l.resellerId === session.userId);
  const payouts = store.payoutRequests.filter(p => p.resellerId === session.userId);
  const metrics = getResellerMetrics(session.userId);

  res.json({
    ledger,
    payouts,
    metrics
  });
});

// Reseller Request Commission Payout
app.post('/api/reseller/payout-request', requireReseller, (req, res) => {
  const session = (req as any).resellerSession;
  const { amount, method, accountTitle, accountNumber, bankName } = req.body;

  const reqAmount = parseInt(amount, 10);
  if (!reqAmount || reqAmount < 500) {
    return res.status(400).json({ error: 'Minimum payout withdrawal request is PKR 500.' });
  }

  if (!method || !accountTitle || !accountNumber) {
    return res.status(400).json({ error: 'Please provide complete withdrawal method, account title, and account number.' });
  }

  const metrics = getResellerMetrics(session.userId);
  if (!metrics) {
    return res.status(400).json({ error: 'Reseller account error.' });
  }

  if (metrics.status !== 'Approved') {
    return res.status(403).json({ error: 'Only approved resellers can request commission payouts.' });
  }

  if (reqAmount > metrics.outstandingCommission) {
    return res.status(400).json({
      error: `Requested amount PKR ${reqAmount.toLocaleString()} exceeds your available confirmed commission of PKR ${metrics.outstandingCommission.toLocaleString()}.`
    });
  }

  const store = getStore();
  const payout: PayoutRequest = {
    id: `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    resellerId: session.userId,
    resellerName: session.name,
    amount: reqAmount,
    method,
    accountTitle,
    accountNumber,
    bankName: bankName || '',
    status: 'Pending',
    requestedAt: new Date().toISOString()
  };

  store.payoutRequests.unshift(payout);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Payout request submitted successfully! DEEZ Finance will review and disburse your payment.',
    payout
  });
});

// Reseller Update Profile / Payment details
app.put('/api/reseller/profile', requireReseller, (req, res) => {
  const session = (req as any).resellerSession;
  const { address, socialLink, paymentDetails } = req.body;
  const store = getStore();

  const reseller = store.resellers.find(r => r.id === session.userId);
  if (!reseller) {
    return res.status(404).json({ error: 'Reseller not found.' });
  }

  if (address !== undefined) reseller.address = address;
  if (socialLink !== undefined) reseller.socialLink = socialLink;
  if (paymentDetails) {
    reseller.paymentDetails = {
      method: paymentDetails.method || 'EasyPaisa',
      accountTitle: paymentDetails.accountTitle || '',
      accountNumber: paymentDetails.accountNumber || '',
      bankName: paymentDetails.bankName || ''
    };
  }

  saveStore(store);
  res.json({ success: true, reseller });
});

// -------------------------------------------------------------
// PRIVATE ADMIN CONTROL PANEL APIS (/deez-control)
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter admin email and password.' });
  }

  const store = getStore();
  const admin = store.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());

  if (!admin) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const checkHash = hashPassword(password, admin.salt);
  if (checkHash !== admin.passwordHash) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = generateToken();
  store.sessions[token] = {
    token,
    userId: admin.id,
    role: 'admin',
    email: admin.email,
    name: admin.name,
    expiresAt: Date.now() + 86400000 // 24 hours
  };

  logAudit(admin.email, 'ADMIN_LOGIN', 'Administrator logged into DEEZ Control Panel.');
  saveStore(store);

  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

// Admin Dashboard KPIs
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const store = getStore();

  const totalResellers = store.resellers.length;
  const pendingResellers = store.resellers.filter(r => r.status === 'Pending').length;
  const activeResellers = store.resellers.filter(r => r.status === 'Approved').length;
  const suspendedResellers = store.resellers.filter(r => r.status === 'Suspended').length;

  const totalOrders = store.orders.length;
  const pendingOrders = store.orders.filter(o => o.orderStatus === 'Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Dispatched').length;
  const deliveredOrders = store.orders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrders = store.orders.filter(o => o.orderStatus === 'Cancelled' || o.orderStatus === 'Returned').length;

  const validOrders = store.orders.filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Returned');
  const totalSales = validOrders.reduce((sum, o) => sum + o.productSubtotal, 0);

  // COD Remittance metrics
  const outstandingCodRemittance = store.orders
    .filter(o => o.orderStatus === 'Delivered' && o.cod.reconciliationStatus !== 'Reconciled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const reconciledCod = store.orders
    .filter(o => o.cod.reconciliationStatus === 'Reconciled')
    .reduce((sum, o) => sum + o.cod.amountCollected, 0);

  // Commission Metrics
  const pendingCommissions = store.orders
    .filter(o => o.commissionStatus === 'Pending' && o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Returned')
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  const confirmedCommissions = store.orders
    .filter(o => o.commissionStatus === 'Confirmed')
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  const paidCommissions = store.payoutRequests
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmedUnpaidCommissions = Math.max(0, confirmedCommissions - paidCommissions);

  const lowStockProducts = store.products.filter(p => p.stock < 15);

  res.json({
    totalResellers,
    pendingResellers,
    activeResellers,
    suspendedResellers,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalSales,
    outstandingCodRemittance,
    reconciledCod,
    pendingCommissions,
    confirmedUnpaidCommissions,
    paidCommissions,
    lowStockProductsCount: lowStockProducts.length,
    lowStockProducts
  });
});

// Admin Resellers Management
app.get('/api/admin/resellers', requireAdmin, (req, res) => {
  const store = getStore();
  const list = store.resellers.map(r => {
    const metrics = getResellerMetrics(r.id);
    return {
      ...r,
      passwordHash: undefined,
      salt: undefined,
      metrics
    };
  });
  res.json(list);
});

// Admin Add Reseller Manually
app.post('/api/admin/resellers', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { fullName, mobileNumber, email, city, province, initialPassword, commissionRateOverride } = req.body;

  if (!fullName || !mobileNumber || !city || !province) {
    return res.status(400).json({ error: 'Please provide full name, mobile number, city, and province.' });
  }

  const store = getStore();
  const salt = generateSalt();
  const passwordHash = hashPassword(initialPassword || 'Deez@Reseller2026', salt);
  const resellerId = `DZ-RES-${Math.floor(1000 + Math.random() * 9000)}`;
  const firstName = fullName.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase() || 'DEEZ';
  const referralCode = `DEEZ-${firstName}-${Math.floor(10 + Math.random() * 90)}`;

  const newReseller: Reseller = {
    id: resellerId,
    fullName: fullName.trim(),
    mobileNumber: mobileNumber.trim(),
    email: email ? email.trim() : '',
    passwordHash,
    salt,
    city: city.trim(),
    province: province.trim(),
    referralCode,
    status: 'Approved',
    commissionRateOverride: commissionRateOverride !== undefined ? Number(commissionRateOverride) : null,
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  };

  store.resellers.push(newReseller);
  logAudit(session.email, 'CREATE_RESELLER_MANUAL', `Manually created reseller ${newReseller.id} (${newReseller.fullName}) with code ${newReseller.referralCode}.`);
  saveStore(store);

  res.status(201).json({ success: true, reseller: newReseller });
});

// Admin Update Reseller Status (Approve / Reject / Suspend / Reactivate)
app.put('/api/admin/resellers/:id/status', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected', 'Suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const store = getStore();
  const reseller = store.resellers.find(r => r.id === req.params.id);
  if (!reseller) {
    return res.status(404).json({ error: 'Reseller not found' });
  }

  const prev = reseller.status;
  reseller.status = status;
  if (status === 'Approved' && !reseller.approvedAt) {
    reseller.approvedAt = new Date().toISOString();
  }

  logAudit(session.email, 'UPDATE_RESELLER_STATUS', `Changed reseller ${reseller.id} (${reseller.fullName}) status from ${prev} to ${status}.`);
  saveStore(store);

  res.json({ success: true, reseller, message: `Reseller status updated to ${status}.` });
});

// Admin Update Reseller Commission Override
app.put('/api/admin/resellers/:id/commission', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { commissionRate } = req.body;
  const store = getStore();
  const reseller = store.resellers.find(r => r.id === req.params.id);
  if (!reseller) return res.status(404).json({ error: 'Reseller not found' });

  const num = commissionRate === null || commissionRate === '' ? null : parseFloat(commissionRate);
  reseller.commissionRateOverride = num;

  logAudit(session.email, 'UPDATE_RESELLER_COMMISSION_RATE', `Updated commission override for ${reseller.id} to ${num !== null ? `${num * 100}%` : 'Default (5%)'}.`);
  saveStore(store);

  res.json({ success: true, reseller });
});

// Admin Update Reseller Internal Notes
app.put('/api/admin/resellers/:id/notes', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const internalNotes = req.body.internalNotes !== undefined ? req.body.internalNotes : (req.body.notes || '');
  const store = getStore();
  const reseller = store.resellers.find(r => r.id === req.params.id);
  if (!reseller) return res.status(404).json({ error: 'Reseller not found' });

  reseller.internalNotes = internalNotes;
  logAudit(session.email, 'UPDATE_RESELLER_NOTES', `Updated internal notes for reseller ${reseller.id} (${reseller.fullName}).`);
  saveStore(store);

  res.json({ success: true, reseller });
});

// Admin Products API
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.products);
});

// Admin Add Product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const {
    title,
    titleUrdu,
    category,
    price,
    originalPrice,
    salePrice,
    stock,
    sku,
    image,
    images,
    description,
    descriptionUrdu,
    ingredients,
    usageInstructions,
    sizeOrWeight,
    variants,
    featured,
    isNewArrival,
    isBestSeller,
    isSpecialOffer,
    isPlaceholder,
    status,
    isPublished,
    seoTitle,
    seoDescription
  } = req.body;

  if (!title || !price || !sku) {
    return res.status(400).json({ error: 'Product title, price, and SKU are required.' });
  }

  const store = getStore();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`;

  const newProd: Product = {
    id: `prod_${Date.now()}`,
    title: title.trim(),
    titleUrdu: titleUrdu ? titleUrdu.trim() : title.trim(),
    slug,
    category: category || 'skincare',
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    salePrice: salePrice !== undefined && salePrice !== '' ? Number(salePrice) : undefined,
    stock: Number(stock || 0),
    sku: sku.trim().toUpperCase(),
    image: image || '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg',
    images: Array.isArray(images) && images.length > 0 ? images : [image || '/src/assets/images/hero_deez_cosmetics_1792560902311.jpg'],
    description: description || '',
    descriptionUrdu: descriptionUrdu || '',
    ingredients: ingredients || '',
    usageInstructions: usageInstructions || '',
    sizeOrWeight: sizeOrWeight || '',
    variants: Array.isArray(variants) ? variants : (typeof variants === 'string' && variants ? variants.split(',').map(s => s.trim()) : []),
    featured: Boolean(featured),
    isNewArrival: Boolean(isNewArrival),
    isBestSeller: Boolean(isBestSeller),
    isSpecialOffer: Boolean(isSpecialOffer),
    isPlaceholder: Boolean(isPlaceholder),
    status: status || 'active',
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    rating: 5.0,
    reviewCount: 1,
    seoTitle: seoTitle || '',
    seoDescription: seoDescription || ''
  };

  store.products.push(newProd);
  logAudit(session.email, 'CREATE_PRODUCT', `Added new product ${newProd.title} (SKU: ${newProd.sku}, Price: PKR ${newProd.price}).`);
  saveStore(store);

  res.status(201).json({ success: true, product: newProd });
});

// Admin Update Product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const store = getStore();
  const prod = store.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found.' });

  const fields = req.body;
  Object.assign(prod, fields);
  if (fields.price !== undefined) prod.price = Number(fields.price);
  if (fields.originalPrice !== undefined) prod.originalPrice = Number(fields.originalPrice);
  if (fields.salePrice !== undefined) prod.salePrice = fields.salePrice !== '' ? Number(fields.salePrice) : undefined;
  if (fields.stock !== undefined) prod.stock = Number(fields.stock);
  if (fields.variants && typeof fields.variants === 'string') {
    prod.variants = fields.variants.split(',').map((s: string) => s.trim());
  }

  logAudit(session.email, 'UPDATE_PRODUCT', `Updated product details for ${prod.title} (${prod.sku}).`);
  saveStore(store);

  res.json({ success: true, product: prod });
});

// Admin Orders API
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.orders);
});

// Admin Update Order Status
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { status } = req.body;
  const allowed = ['Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled', 'Returned'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const store = getStore();
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const prevStatus = order.orderStatus;
  order.orderStatus = status as any;
  order.updatedAt = new Date().toISOString();

  // Handle Cancellation or Return: Return inventory & Reverse commissions
  if ((status === 'Cancelled' || status === 'Returned') && (prevStatus !== 'Cancelled' && prevStatus !== 'Returned')) {
    // Restock items
    for (const item of order.items) {
      const product = store.products.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }

    // Reverse commission if attributed
    if (order.resellerId && order.commissionAmount > 0 && order.commissionStatus !== 'Reversed') {
      order.commissionStatus = 'Reversed';
      const metrics = getResellerMetrics(order.resellerId);
      const ledgerEntry: CommissionLedgerEntry = {
        id: `led_${Date.now()}_rev`,
        resellerId: order.resellerId,
        orderId: order.id,
        type: 'REVERSAL_RETURN',
        amount: -order.commissionAmount,
        balanceAfter: metrics ? metrics.confirmedCommission : 0,
        note: `Commission reversed: Order ${order.id} marked as ${status}.`,
        timestamp: new Date().toISOString()
      };
      store.commissionLedger.unshift(ledgerEntry);
    }
  }

  // If order transitioned to Delivered AND COD was already marked Reconciled, confirm commission
  if (status === 'Delivered' && order.cod.reconciliationStatus === 'Reconciled' && order.resellerId && order.commissionStatus === 'Pending') {
    order.commissionStatus = 'Confirmed';
    const metrics = getResellerMetrics(order.resellerId);
    const ledgerEntry: CommissionLedgerEntry = {
      id: `led_${Date.now()}_conf`,
      resellerId: order.resellerId,
      orderId: order.id,
      type: 'CONFIRM_DELIVERED',
      amount: order.commissionAmount,
      balanceAfter: (metrics ? metrics.confirmedCommission : 0) + order.commissionAmount,
      note: `Commission Confirmed: Order ${order.id} delivered and COD reconciled.`,
      timestamp: new Date().toISOString()
    };
    store.commissionLedger.unshift(ledgerEntry);
  }

  logAudit(session.email, 'UPDATE_ORDER_STATUS', `Updated Order ${order.id} status from ${prevStatus} to ${status}.`);
  saveStore(store);

  res.json({ success: true, order });
});

// Admin Assign Courier & Tracking
app.put('/api/admin/orders/:id/courier', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { company, trackingNumber, dispatchDate } = req.body;
  const store = getStore();
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.courier = {
    company: company || order.courier.company,
    trackingNumber: trackingNumber || order.courier.trackingNumber,
    dispatchDate: dispatchDate || order.courier.dispatchDate || new Date().toISOString()
  };

  if (order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed') {
    order.orderStatus = 'Dispatched';
  }
  order.updatedAt = new Date().toISOString();

  logAudit(session.email, 'ASSIGN_COURIER', `Assigned courier ${order.courier.company} (${order.courier.trackingNumber}) to Order ${order.id}.`);
  saveStore(store);

  res.json({ success: true, order });
});

// Admin Reconcile Cash on Delivery
app.put('/api/admin/orders/:id/reconcile-cod', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { amountCollected, remittanceRef, remittanceDate, reconciliationStatus } = req.body;
  const store = getStore();
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.cod = {
    amountExpected: order.cod.amountExpected || order.totalAmount,
    amountCollected: Number(amountCollected ?? order.totalAmount),
    remittanceRef: remittanceRef || order.cod.remittanceRef || `REMIT-${Date.now()}`,
    remittanceDate: remittanceDate || new Date().toISOString().split('T')[0],
    reconciliationStatus: reconciliationStatus || 'Reconciled'
  };

  // If COD is reconciled and order is delivered, confirm commission!
  if (order.cod.reconciliationStatus === 'Reconciled' && order.resellerId && order.commissionStatus === 'Pending') {
    order.commissionStatus = 'Confirmed';
    order.orderStatus = 'Delivered';
    const metrics = getResellerMetrics(order.resellerId);
    const ledgerEntry: CommissionLedgerEntry = {
      id: `led_${Date.now()}_conf`,
      resellerId: order.resellerId,
      orderId: order.id,
      type: 'CONFIRM_DELIVERED',
      amount: order.commissionAmount,
      balanceAfter: (metrics ? metrics.confirmedCommission : 0) + order.commissionAmount,
      note: `Commission Confirmed: Order ${order.id} COD Remitted (${order.cod.remittanceRef}).`,
      timestamp: new Date().toISOString()
    };
    store.commissionLedger.unshift(ledgerEntry);
  }

  order.updatedAt = new Date().toISOString();

  logAudit(session.email, 'RECONCILE_COD', `Reconciled COD for Order ${order.id}. Collected PKR ${order.cod.amountCollected}, Ref: ${order.cod.remittanceRef}.`);
  saveStore(store);

  res.json({ success: true, order });
});

// Admin Payouts Management
app.get('/api/admin/payouts', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.payoutRequests);
});

// Admin Process Payout (Approve / Reject)
app.put('/api/admin/payouts/:id', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const { status, transactionReference, notes } = req.body;
  const store = getStore();
  const payout = store.payoutRequests.find(p => p.id === req.params.id);
  if (!payout) return res.status(404).json({ error: 'Payout request not found' });

  payout.status = status;
  payout.processedAt = new Date().toISOString();
  if (transactionReference) payout.transactionReference = transactionReference;
  if (notes) payout.notes = notes;

  if (status === 'Paid') {
    const metrics = getResellerMetrics(payout.resellerId);
    const ledgerEntry: CommissionLedgerEntry = {
      id: `led_${Date.now()}_pay`,
      resellerId: payout.resellerId,
      orderId: payout.id,
      type: 'PAYOUT_DEBIT',
      amount: -payout.amount,
      balanceAfter: metrics ? Math.max(0, metrics.outstandingCommission - payout.amount) : 0,
      note: `Payout Disbursed via ${payout.method} to ${payout.accountTitle} (${payout.accountNumber}). Ref: ${transactionReference || 'N/A'}`,
      timestamp: new Date().toISOString()
    };
    store.commissionLedger.unshift(ledgerEntry);
  }

  logAudit(session.email, 'PROCESS_PAYOUT', `Processed payout ${payout.id} for PKR ${payout.amount} (${status}).`);
  saveStore(store);

  res.json({ success: true, payout });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.auditLogs.slice(0, 100));
});

// Admin Categories API
app.get('/api/admin/categories', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.settings.categories || []);
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const store = getStore();
  const { name, nameUrdu, slug, description, isSpecial } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const generatedSlug = slug ? slug.trim().toLowerCase() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    id: `cat_${Date.now()}`,
    name: name.trim(),
    nameUrdu: nameUrdu ? nameUrdu.trim() : name.trim(),
    slug: generatedSlug,
    description: description || '',
    order: (store.settings.categories?.length || 0) + 1,
    isActive: true,
    isSpecial: Boolean(isSpecial)
  };

  if (!store.settings.categories) store.settings.categories = [];
  store.settings.categories.push(newCat);
  logAudit(session.email, 'CREATE_CATEGORY', `Created category ${newCat.name} (${newCat.slug}).`);
  saveStore(store);

  res.status(201).json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const store = getStore();
  const cat = store.settings.categories?.find(c => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const { name, nameUrdu, slug, description, order, isActive, isSpecial } = req.body;
  if (name !== undefined) cat.name = name;
  if (nameUrdu !== undefined) cat.nameUrdu = nameUrdu;
  if (slug !== undefined) cat.slug = slug;
  if (description !== undefined) cat.description = description;
  if (order !== undefined) cat.order = Number(order);
  if (isActive !== undefined) cat.isActive = Boolean(isActive);
  if (isSpecial !== undefined) cat.isSpecial = Boolean(isSpecial);

  logAudit(session.email, 'UPDATE_CATEGORY', `Updated category ${cat.name}.`);
  saveStore(store);

  res.json({ success: true, category: cat });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const store = getStore();
  const index = store.settings.categories?.findIndex(c => c.id === req.params.id);
  if (index === undefined || index === -1) return res.status(404).json({ error: 'Category not found' });

  const removed = store.settings.categories.splice(index, 1)[0];
  logAudit(session.email, 'DELETE_CATEGORY', `Deleted category ${removed.name}.`);
  saveStore(store);

  res.json({ success: true, message: 'Category removed' });
});

// Admin Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  const store = getStore();
  res.json(store.settings);
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const session = (req as any).adminSession;
  const store = getStore();
  const {
    commissionRate,
    shippingFee,
    freeShippingThreshold,
    whatsappNumber,
    whatsappWelcomeMessage,
    supportEmail,
    storeAddress,
    siteTitle,
    storeLogoUrl,
    heroBannerUrl,
    categories
  } = req.body;

  if (commissionRate !== undefined) store.settings.commissionRate = Number(commissionRate);
  if (shippingFee !== undefined) store.settings.shippingFee = Number(shippingFee);
  if (freeShippingThreshold !== undefined) store.settings.freeShippingThreshold = Number(freeShippingThreshold);
  if (whatsappNumber !== undefined) store.settings.whatsappNumber = whatsappNumber.trim();
  if (whatsappWelcomeMessage !== undefined) store.settings.whatsappWelcomeMessage = whatsappWelcomeMessage;
  if (supportEmail !== undefined) store.settings.supportEmail = supportEmail;
  if (storeAddress !== undefined) store.settings.storeAddress = storeAddress;
  if (siteTitle !== undefined) store.settings.siteTitle = siteTitle;
  if (storeLogoUrl !== undefined) store.settings.storeLogoUrl = storeLogoUrl;
  if (heroBannerUrl !== undefined) store.settings.heroBannerUrl = heroBannerUrl;
  if (Array.isArray(categories)) store.settings.categories = categories;

  logAudit(session.email, 'UPDATE_SETTINGS', 'Updated global platform settings.');
  saveStore(store);

  res.json({ success: true, settings: store.settings });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR PRODUCTION STATIC FILES
// -------------------------------------------------------------
async function bootstrap() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const args = process.argv.slice(2);
  let port = Number(process.env.PORT) || 3000;
  let host = '0.0.0.0';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
    }
    if (args[i] === '--host' && args[i + 1]) {
      host = args[i + 1];
    }
  }

  app.listen(port, host, () => {
    console.log(`DEEZ Cosmetics Server running on http://${host}:${port} [Mode: ${isProduction ? 'Production' : 'Development'}]`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start DEEZ Cosmetics Server:', err);
});
