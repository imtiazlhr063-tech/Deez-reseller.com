export interface CategoryConfig {
  id: string;
  name: string;
  nameUrdu: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  isSpecial?: boolean; // New Arrivals, Best Sellers, Special Offers
}

export interface Product {
  id: string;
  title: string;
  titleUrdu: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  salePrice?: number;
  stock: number;
  sku: string;
  image: string;
  images?: string[];
  description: string;
  descriptionUrdu: string;
  ingredients: string;
  usageInstructions: string;
  sizeOrWeight?: string;
  variants?: string[];
  featured: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSpecialOffer?: boolean;
  isPlaceholder?: boolean;
  status?: 'active' | 'draft' | 'archived';
  isPublished: boolean;
  rating: number;
  reviewCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  sku?: string;
  variant?: string;
}

export interface CourierDetails {
  company: string;
  trackingNumber: string;
  dispatchDate: string;
}

export interface CodDetails {
  amountExpected: number;
  amountCollected: number;
  remittanceRef: string;
  remittanceDate: string;
  reconciliationStatus: 'Unreconciled' | 'Reconciled' | 'Disputed';
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  province: string;
  city: string;
  address: string;
  deliveryNotes?: string;
  items: OrderItem[];
  productSubtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'COD';
  orderStatus: 'Placed' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Returned';
  resellerId: string | null;
  referralCode: string | null;
  resellerName: string | null;
  eligibleCommissionBase: number;
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: 'Pending' | 'Confirmed' | 'Paid' | 'Reversed';
  courier: CourierDetails;
  cod: CodDetails;
  createdAt: string;
  updatedAt: string;
}

export interface ResellerPaymentDetails {
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
}

export interface Reseller {
  id: string; // DZ-RES-XXXX
  fullName: string;
  mobileNumber: string;
  email: string;
  passwordHash: string;
  salt: string;
  city: string;
  province: string;
  address?: string;
  socialLink?: string;
  referralCode: string; // DEEZ-XXXXX
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  commissionRateOverride?: number | null;
  paymentDetails?: ResellerPaymentDetails;
  internalNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface CommissionLedgerEntry {
  id: string;
  resellerId: string;
  orderId: string;
  type: 'CREDIT_PENDING' | 'CONFIRM_DELIVERED' | 'PAYOUT_DEBIT' | 'REVERSAL_RETURN' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  note: string;
  timestamp: string;
}

export interface PayoutRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  amount: number;
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  status: 'Pending' | 'Paid' | 'Rejected';
  requestedAt: string;
  processedAt?: string;
  transactionReference?: string;
  notes?: string;
}

export interface PlatformSettings {
  commissionRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  whatsappNumber: string;
  whatsappWelcomeMessage: string;
  supportEmail: string;
  storeAddress: string;
  siteTitle: string;
  storeLogoUrl?: string;
  heroBannerUrl?: string;
  categories: CategoryConfig[];
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'SuperAdmin' | 'Staff';
  createdAt: string;
}

export interface ResellerSummary {
  resellerId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  city: string;
  province: string;
  referralCode: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledReturnedOrders: number;
  eligibleSales: number;
  pendingCommission: number;
  confirmedCommission: number;
  paidCommission: number;
  outstandingCommission: number;
  internalNotes?: string;
  createdAt: string;
}
