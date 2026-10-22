import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Reseller, PayoutRequest, AuditLogEntry, PlatformSettings, CategoryConfig } from '../types/store';
import {
  ShieldCheck,
  Lock,
  Mail,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Printer,
  Download,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  Eye,
  Check,
  MessageCircle,
  FolderTree,
  StickyNote,
  Sliders,
  ExternalLink,
  Database,
  Cloud,
  CheckCircle2
} from 'lucide-react';

interface AdminControlPageProps {
  onPrintInvoice: (order: Order) => void;
  onNavigateHome: () => void;
}

export const AdminControlPage: React.FC<AdminControlPageProps> = ({
  onPrintInvoice,
  onNavigateHome
}) => {
  const { adminToken, adminUser, setAdminAuth, adminLogout, showToast } = useStore();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'resellers' | 'products' | 'categories' | 'orders' | 'cod' | 'payouts' | 'reports' | 'settings' | 'audit'
  >('overview');

  // Loaded data states
  const [metrics, setMetrics] = useState<any | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [resellerFilterStatus, setResellerFilterStatus] = useState('all');
  const [resellerSearch, setResellerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Selected Reseller for detailed profile inspection
  const [selectedResellerProfile, setSelectedResellerProfile] = useState<any | null>(null);
  const [resellerNoteText, setResellerNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Modals / sub-forms
  const [showAddResellerModal, setShowAddResellerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Courier Assignment Modal
  const [assigningCourierOrder, setAssigningCourierOrder] = useState<Order | null>(null);
  const [courierCompany, setCourierCompany] = useState('Trax Logistics');
  const [courierTracking, setCourierTracking] = useState('');

  // COD Reconcile Modal
  const [reconcilingOrder, setReconcilingOrder] = useState<Order | null>(null);
  const [reconcileCollected, setReconcileCollected] = useState('');
  const [reconcileRef, setReconcileRef] = useState('');

  // Payout Process Modal
  const [processingPayout, setProcessingPayout] = useState<PayoutRequest | null>(null);
  const [payoutTxRef, setPayoutTxRef] = useState('');

  // Category Management Form Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [catName, setCatName] = useState('');
  const [catNameUrdu, setCatNameUrdu] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIsSpecial, setCatIsSpecial] = useState(false);

  // New Reseller form
  const [newResellerName, setNewResellerName] = useState('');
  const [newResellerPhone, setNewResellerPhone] = useState('');
  const [newResellerEmail, setNewResellerEmail] = useState('');
  const [newResellerCity, setNewResellerCity] = useState('');
  const [newResellerProvince, setNewResellerProvince] = useState('Punjab');
  const [newResellerRate, setNewResellerRate] = useState('0.05');

  // New Product form
  const [prodTitle, setProdTitle] = useState('');
  const [prodTitleUrdu, setProdTitleUrdu] = useState('');
  const [prodCategory, setProdCategory] = useState('transparent-soaps');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodSku, setProdSku] = useState('');
  const [prodImage, setProdImage] = useState('/src/assets/images/product_transparent_soap_1792646755587.jpg');
  const [prodImages, setProdImages] = useState('');
  const [prodSize, setProdSize] = useState('100g');
  const [prodVariants, setProdVariants] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDescUrdu, setProdDescUrdu] = useState('');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodUsage, setProdUsage] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodNewArrival, setProdNewArrival] = useState(false);
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodSpecialOffer, setProdSpecialOffer] = useState(false);
  const [prodPlaceholder, setProdPlaceholder] = useState(false);

  useEffect(() => {
    if (adminToken) {
      loadAllAdminData();
    }
  }, [adminToken]);

  const loadAllAdminData = async () => {
    if (!adminToken) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${adminToken}` };

    try {
      const [resMetrics, resResellers, resProds, resOrders, resPayouts, resLogs, resSettings] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/resellers', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/payouts', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/settings', { headers })
      ]);

      if (resMetrics.ok) setMetrics(await resMetrics.json());
      if (resResellers.ok) setResellers(await resResellers.json());
      if (resProds.ok) setProducts(await resProds.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resPayouts.ok) setPayouts(await resPayouts.json());
      if (resLogs.ok) setAuditLogs(await resLogs.json());
      if (resSettings.ok) setSettings(await resSettings.json());
    } catch (err) {
      console.error('Failed loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      setAdminAuth(data.token, data.admin);
      showToast('Administrator authenticated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Login error', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFillMasterCredentials = () => {
    setEmail('admin@deezcosmetics.pk');
    setPassword('Admin@DEEZ2026!');
    showToast('Master admin credentials loaded.', 'info');
  };

  // Reseller management actions
  const handleUpdateResellerStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/resellers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Reseller status set to ${status}`, 'success');
        loadAllAdminData();
        if (selectedResellerProfile?.id === id) {
          setSelectedResellerProfile({ ...selectedResellerProfile, status });
        }
      } else {
        showToast(data.error || 'Failed updating status', 'error');
      }
    } catch (err) {
      showToast('Error updating reseller status', 'error');
    }
  };

  const handleSaveResellerNote = async () => {
    if (!selectedResellerProfile) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/resellers/${selectedResellerProfile.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ internalNotes: resellerNoteText })
      });
      if (res.ok) {
        showToast('Internal administrative note saved to database!', 'success');
        setSelectedResellerProfile({ ...selectedResellerProfile, internalNotes: resellerNoteText });
        loadAllAdminData();
      } else {
        showToast('Failed to save note', 'error');
      }
    } catch (err) {
      showToast('Error saving note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateResellerManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          fullName: newResellerName,
          mobileNumber: newResellerPhone,
          email: newResellerEmail,
          city: newResellerCity,
          province: newResellerProvince,
          commissionRateOverride: parseFloat(newResellerRate)
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Created reseller ${data.reseller.fullName} (${data.reseller.id})`, 'success');
        setShowAddResellerModal(false);
        setNewResellerName('');
        setNewResellerPhone('');
        setNewResellerEmail('');
        setNewResellerCity('');
        loadAllAdminData();
      } else {
        showToast(data.error || 'Failed to create reseller', 'error');
      }
    } catch (err) {
      showToast('Error creating reseller', 'error');
    }
  };

  // Order actions
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Order ${orderId} updated to ${status}`, 'success');
        loadAllAdminData();
      } else {
        showToast('Error updating status', 'error');
      }
    } catch (err) {
      showToast('Error updating order', 'error');
    }
  };

  const handleAssignCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCourierOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${assigningCourierOrder.id}/courier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          company: courierCompany,
          trackingNumber: courierTracking,
          dispatchDate: new Date().toISOString()
        })
      });
      if (res.ok) {
        showToast(`Courier ${courierCompany} assigned to Order ${assigningCourierOrder.id}!`, 'success');
        setAssigningCourierOrder(null);
        setCourierTracking('');
        loadAllAdminData();
      } else {
        showToast('Failed to assign courier', 'error');
      }
    } catch (err) {
      showToast('Error assigning courier', 'error');
    }
  };

  const handleReconcileCod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${reconcilingOrder.id}/reconcile-cod`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          amountCollected: reconcileCollected || reconcilingOrder.totalAmount,
          remittanceRef: reconcileRef || `REMIT-LHR-${Date.now()}`,
          remittanceDate: new Date().toISOString().split('T')[0],
          reconciliationStatus: 'Reconciled'
        })
      });
      if (res.ok) {
        showToast(`COD reconciled for Order ${reconcilingOrder.id}! 5% commission confirmed.`, 'success');
        setReconcilingOrder(null);
        setReconcileCollected('');
        setReconcileRef('');
        loadAllAdminData();
      } else {
        showToast('Failed to reconcile COD', 'error');
      }
    } catch (err) {
      showToast('Error reconciling COD', 'error');
    }
  };

  const handleProcessPayout = async (payoutId: string, status: 'Paid' | 'Rejected') => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          status,
          transactionReference: payoutTxRef || `TX-JAZZ-${Date.now()}`
        })
      });
      if (res.ok) {
        showToast(`Payout ${payoutId} marked as ${status}!`, 'success');
        setProcessingPayout(null);
        setPayoutTxRef('');
        loadAllAdminData();
      } else {
        showToast('Failed to process payout', 'error');
      }
    } catch (err) {
      showToast('Error processing payout', 'error');
    }
  };

  // Product save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const imagesArray = prodImages
      ? prodImages.split(',').map(s => s.trim()).filter(Boolean)
      : [prodImage];

    const variantsArray = prodVariants
      ? prodVariants.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: prodTitle,
          titleUrdu: prodTitleUrdu,
          category: prodCategory,
          price: parseFloat(prodPrice),
          originalPrice: parseFloat(prodOrigPrice || prodPrice),
          salePrice: prodSalePrice ? parseFloat(prodSalePrice) : undefined,
          stock: parseInt(prodStock, 10),
          sku: prodSku,
          image: prodImage,
          images: imagesArray,
          sizeOrWeight: prodSize,
          variants: variantsArray,
          description: prodDesc,
          descriptionUrdu: prodDescUrdu,
          ingredients: prodIngredients,
          usageInstructions: prodUsage,
          featured: prodFeatured,
          isNewArrival: prodNewArrival,
          isBestSeller: prodBestSeller,
          isSpecialOffer: prodSpecialOffer,
          isPlaceholder: prodPlaceholder,
          status: 'active',
          isPublished: true
        })
      });

      if (res.ok) {
        const resData = await res.json();
        const savedProd = resData.product || {
          id: editingProduct?.id || `DZ-PROD-${Date.now()}`,
          title: prodTitle,
          titleUrdu: prodTitleUrdu,
          category: prodCategory,
          price: parseFloat(prodPrice),
          originalPrice: parseFloat(prodOrigPrice || prodPrice),
          salePrice: prodSalePrice ? parseFloat(prodSalePrice) : undefined,
          stock: parseInt(prodStock, 10),
          sku: prodSku,
          image: prodImage,
          images: imagesArray,
          sizeOrWeight: prodSize,
          variants: variantsArray,
          description: prodDesc,
          status: 'active',
          isPublished: true
        };

        showToast(`Product saved and live in store catalog!`, 'success');
        setShowAddProductModal(false);
        setEditingProduct(null);
        loadAllAdminData();
      } else {
        showToast('Error saving product', 'error');
      }
    } catch (err) {
      showToast('Error saving product', 'error');
    }
  };



  // Category save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: catName,
          nameUrdu: catNameUrdu,
          slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: catDesc,
          isSpecial: catIsSpecial
        })
      });
      if (res.ok) {
        showToast('Category updated successfully!', 'success');
        setShowCategoryModal(false);
        setEditingCategory(null);
        loadAllAdminData();
      } else {
        showToast('Error saving category', 'error');
      }
    } catch (err) {
      showToast('Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showToast('Category deleted', 'info');
        loadAllAdminData();
      }
    } catch (e) {
      showToast('Error deleting category', 'error');
    }
  };

  // CSV export
  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Province', 'Subtotal', 'Shipping', 'Total COD', 'Status', 'Reseller ID', 'Commission PKR', 'Courier', 'Tracking', 'COD Status'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.city}"`,
      `"${o.province}"`,
      o.productSubtotal,
      o.shippingFee,
      o.totalAmount,
      o.orderStatus,
      o.resellerId || 'Direct',
      o.commissionAmount,
      `"${o.courier.company}"`,
      `"${o.courier.trackingNumber}"`,
      o.cod.reconciliationStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DEEZ_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IF NOT AUTHENTICATED: SHOW SECURE LOGIN
  if (!adminToken) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7E2DA] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-stone-900 text-[#E8D7C8] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-serif-luxury font-bold text-stone-900">
              DEEZ Control Panel
            </h1>
            <p className="text-xs text-stone-500">
              Protected Administrative Area for Brand Owner & Staff
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@deezcosmetics.pk"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-stone-400"
            >
              <span>{loginLoading ? 'Verifying Credentials...' : 'Sign In to DEEZ Control'}</span>
            </button>
          </form>

          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E7E2DA] text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-800">Master Credentials:</span>
              <button
                type="button"
                onClick={handleFillMasterCredentials}
                className="text-[11px] font-bold text-[#8C6D46] hover:underline cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
            <p className="text-stone-600 text-[11px]">
              Email: <code className="bg-stone-200 px-1 py-0.5 rounded">admin@deezcosmetics.pk</code><br />
              Password: <code className="bg-stone-200 px-1 py-0.5 rounded">Admin@DEEZ2026!</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allCategories = settings?.categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar with Admin Profile & Logout */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8C6D46] text-white rounded-xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">DEEZ CONTROL PANEL</h1>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold">
                SuperAdmin
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Logged in as {adminUser?.name || 'Administrator'} ({adminUser?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Storefront View
          </button>
          <button
            onClick={adminLogout}
            className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-[#E7E2DA] flex gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto pb-px">
        {[
          { id: 'overview', label: '1. Dashboard Overview' },
          { id: 'resellers', label: `2. Resellers (${resellers.length})` },
          { id: 'products', label: `3. Products (${products.length})` },
          { id: 'categories', label: `4. Categories (${allCategories.length})` },
          { id: 'orders', label: `5. Orders & COD (${orders.length})` },
          { id: 'cod', label: '6. COD Reconciliation Hub' },
          { id: 'payouts', label: `7. Payout Requests (${payouts.length})` },
          { id: 'reports', label: '8. Reports & CSV' },
          { id: 'settings', label: '9. Store Settings' },
          { id: 'audit', label: '10. Audit Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-stone-900 text-stone-950 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Storage & Backend Status Card */}
          <div className="bg-[#1C1917] text-white p-5 rounded-2xl border border-stone-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#8C6D46]/20 border border-[#8C6D46]/40 flex items-center justify-center shrink-0 text-[#C4A47C]">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">DEEZ System Storage Active</h3>
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Products, categories, reseller commissions (5%), and Cash on Delivery orders are actively managed on the self-contained backend. External database and auth can be connected manually anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Total Store Sales</span>
              <p className="text-2xl font-bold font-mono text-stone-900">
                PKR {(metrics?.totalSales || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500">{metrics?.totalOrders || 0} lifetime orders</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Outstanding COD Remittances</span>
              <p className="text-2xl font-bold font-mono text-amber-700">
                PKR {(metrics?.outstandingCodRemittance || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500">Awaiting courier bank wire</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Reconciled COD Cash</span>
              <p className="text-2xl font-bold font-mono text-emerald-700">
                PKR {(metrics?.reconciledCod || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500">Reconciled to DEEZ bank</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Confirmed Reseller Liability</span>
              <p className="text-2xl font-bold font-mono text-[#8C6D46]">
                PKR {(metrics?.confirmedUnpaidCommissions || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500">PKR {(metrics?.paidCommissions || 0).toLocaleString()} already disbursed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">Reseller Network Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Approved & Active:</span>
                  <span className="font-bold text-emerald-700">{metrics?.activeResellers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Applications:</span>
                  <span className="font-bold text-amber-700">{metrics?.pendingResellers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Suspended:</span>
                  <span className="font-bold text-stone-500">{metrics?.suspendedResellers || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">Order Fulfillment Funnel</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>In Processing / Dispatched:</span>
                  <span className="font-bold text-amber-700">{metrics?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivered:</span>
                  <span className="font-bold text-emerald-700">{metrics?.deliveredOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled / Returned:</span>
                  <span className="font-bold text-rose-700">{metrics?.cancelledOrders || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">Inventory Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Total Products:</span>
                  <span className="font-bold text-stone-900">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Low Stock Alert (&lt;15):</span>
                  <span className={`font-bold ${metrics?.lowStockProductsCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {metrics?.lowStockProductsCount || 0} items
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESELLERS */}
      {activeTab === 'resellers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'Pending', 'Approved', 'Suspended', 'Rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setResellerFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    resellerFilterStatus === st ? 'bg-stone-900 text-white' : 'bg-white border text-stone-700'
                  }`}
                >
                  {st} {st === 'all' ? `(${resellers.length})` : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={resellerSearch}
                  onChange={e => setResellerSearch(e.target.value)}
                  placeholder="Search name, phone, or ID..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-[#DDD6CC] rounded-xl focus:outline-none"
                />
              </div>

              <button
                onClick={() => setShowAddResellerModal(true)}
                className="px-4 py-2 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#E8D7C8]" />
                <span>Add Reseller Manually</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Reseller ID</th>
                    <th className="py-3 px-4">Name & Contact</th>
                    <th className="py-3 px-4">City / Province</th>
                    <th className="py-3 px-4">Referral Code</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Confirmed Comms</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {resellers
                    .filter(r => resellerFilterStatus === 'all' || r.status === resellerFilterStatus)
                    .filter(r => {
                      if (!resellerSearch.trim()) return true;
                      const q = resellerSearch.toLowerCase();
                      return (
                        r.fullName?.toLowerCase().includes(q) ||
                        r.id?.toLowerCase().includes(q) ||
                        r.mobileNumber?.includes(q) ||
                        r.referralCode?.toLowerCase().includes(q)
                      );
                    })
                    .map(r => (
                      <tr key={r.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{r.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{r.fullName}</p>
                          <span className="text-stone-500 font-mono text-[11px]">{r.mobileNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-700">{r.city}, {r.province}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#8C6D46]">{r.referralCode}</td>
                        <td className="py-3 px-4 font-mono">{r.metrics?.totalOrders || 0}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          PKR {(r.metrics?.confirmedCommission || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedResellerProfile(r);
                              setResellerNoteText(r.internalNotes || '');
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Profile & Notes
                          </button>
                          {r.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateResellerStatus(r.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {r.status === 'Approved' ? (
                            <button
                              onClick={() => handleUpdateResellerStatus(r.id, 'Suspended')}
                              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : r.status === 'Suspended' ? (
                            <button
                              onClick={() => handleUpdateResellerStatus(r.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Reactivate
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products by title or SKU..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-[#DDD6CC] rounded-xl focus:outline-none"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="text-xs px-3 py-1.5 bg-white border border-[#DDD6CC] rounded-xl focus:outline-none"
              >
                <option value="all">All Categories</option>
                {allCategories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProdTitle('');
                setProdTitleUrdu('');
                setProdCategory('transparent-soaps');
                setProdPrice('');
                setProdOrigPrice('');
                setProdSalePrice('');
                setProdStock('50');
                setProdSku(`DZ-CAT-${Date.now().toString().slice(-4)}`);
                setProdImage('/src/assets/images/product_transparent_soap_1792646755587.jpg');
                setProdImages('');
                setProdSize('125g');
                setProdVariants('');
                setProdDesc('');
                setProdDescUrdu('');
                setProdIngredients('');
                setProdUsage('');
                setProdFeatured(true);
                setProdNewArrival(true);
                setProdBestSeller(false);
                setProdSpecialOffer(false);
                setProdPlaceholder(false);
                setShowAddProductModal(true);
              }}
              className="px-4 py-2 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#E8D7C8]" />
              <span>Add New Cosmetics Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">SKU / Size</th>
                    <th className="py-3 px-4">Retail Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Badges</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {products
                    .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                    .filter(p => {
                      if (!productSearch.trim()) return true;
                      const q = productSearch.toLowerCase();
                      return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                    })
                    .map(prod => (
                      <tr key={prod.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={prod.image} alt={prod.title} className="w-10 h-10 object-cover rounded-lg border shrink-0" />
                          <div>
                            <p className="font-semibold text-stone-900">{prod.title}</p>
                            <span className="font-urdu text-[11px] text-stone-500">{prod.titleUrdu}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#8C6D46]">{prod.category?.replace('-', ' ')}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>{prod.sku}</div>
                          <span className="text-stone-400">{prod.sizeOrWeight || 'Standard'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          PKR {prod.price.toLocaleString()}
                          {prod.salePrice && <span className="text-emerald-700 text-[10px] block">Sale: PKR {prod.salePrice.toLocaleString()}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold ${prod.stock < 15 ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-stone-900'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-1">
                          {prod.isBestSeller && <span className="bg-stone-900 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">BEST</span>}
                          {prod.isNewArrival && <span className="bg-[#8C6D46] text-white px-1.5 py-0.5 rounded text-[9px] font-bold">NEW</span>}
                          {prod.featured && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px]">FEATURED</span>}
                          {prod.isPlaceholder && <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-[9px]">SAMPLE</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProdTitle(prod.title);
                              setProdTitleUrdu(prod.titleUrdu);
                              setProdCategory(prod.category);
                              setProdPrice(prod.price.toString());
                              setProdOrigPrice(prod.originalPrice.toString());
                              setProdSalePrice(prod.salePrice ? prod.salePrice.toString() : '');
                              setProdStock(prod.stock.toString());
                              setProdSku(prod.sku);
                              setProdImage(prod.image);
                              setProdImages(prod.images ? prod.images.join(', ') : '');
                              setProdSize(prod.sizeOrWeight || '');
                              setProdVariants(prod.variants ? prod.variants.join(', ') : '');
                              setProdDesc(prod.description);
                              setProdDescUrdu(prod.descriptionUrdu);
                              setProdIngredients(prod.ingredients);
                              setProdUsage(prod.usageInstructions);
                              setProdFeatured(Boolean(prod.featured));
                              setProdNewArrival(Boolean(prod.isNewArrival));
                              setProdBestSeller(Boolean(prod.isBestSeller));
                              setProdSpecialOffer(Boolean(prod.isSpecialOffer));
                              setProdPlaceholder(Boolean(prod.isPlaceholder));
                              setShowAddProductModal(true);
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px] cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Manage 20 Cosmetics Catalog Categories</h3>
              <p className="text-xs text-stone-500">Add, rename, reorder, or toggle category visibility across the store.</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatName('');
                setCatNameUrdu('');
                setCatSlug('');
                setCatDesc('');
                setCatIsSpecial(false);
                setShowCategoryModal(true);
              }}
              className="px-4 py-2 bg-[#1C1917] hover:bg-[#322E2B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E8D7C8]" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Urdu Title</th>
                    <th className="py-3 px-4">URL Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {allCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-mono font-bold text-stone-500">{cat.order}</td>
                      <td className="py-3 px-4 font-semibold text-stone-900">{cat.name}</td>
                      <td className="py-3 px-4 font-urdu text-sm text-stone-600">{cat.nameUrdu}</td>
                      <td className="py-3 px-4 font-mono text-stone-500">{cat.slug}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {cat.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCatName(cat.name);
                            setCatNameUrdu(cat.nameUrdu);
                            setCatSlug(cat.slug);
                            setCatDesc(cat.description || '');
                            setCatIsSpecial(Boolean(cat.isSpecial));
                            setShowCategoryModal(true);
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS & COD */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setOrderFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                    orderFilterStatus === st ? 'bg-stone-900 text-white' : 'bg-white border text-stone-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={exportOrdersCSV}
              className="px-3.5 py-1.5 bg-white border border-[#DDD6CC] text-stone-800 hover:bg-[#FAF8F5] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">COD Total</th>
                    <th className="py-3 px-4">Reseller</th>
                    <th className="py-3 px-4">5% Comm.</th>
                    <th className="py-3 px-4">Courier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {orders
                    .filter(o => orderFilterStatus === 'all' || o.orderStatus === orderFilterStatus)
                    .map(o => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-mono font-bold text-[#8C6D46]">{o.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{o.customerName}</p>
                          <span className="text-stone-500 text-[11px]">{o.city}, {o.customerPhone}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-950">
                          PKR {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {o.referralCode ? (
                            <span className="font-mono text-[#8C6D46] bg-amber-50 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                              {o.referralCode}
                            </span>
                          ) : (
                            <span className="text-stone-400">Direct</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {o.commissionAmount > 0 ? `PKR ${o.commissionAmount}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {o.courier?.trackingNumber ? (
                            <div className="font-mono text-[11px]">
                              <p className="font-semibold text-stone-900">{o.courier.company}</p>
                              <span className="text-stone-500">{o.courier.trackingNumber}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAssigningCourierOrder(o);
                                setCourierTracking(`TRX-${Date.now().toString().slice(-6)}`);
                              }}
                              className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold hover:bg-amber-100 cursor-pointer"
                            >
                              + Assign Courier
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.orderStatus}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="text-[11px] font-semibold px-2 py-1 bg-[#FAF8F5] border border-stone-300 rounded focus:outline-none"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => onPrintInvoice(o)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors cursor-pointer"
                            title="Print thermal packing slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COD RECONCILIATION */}
      {activeTab === 'cod' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E7E2DA] space-y-2">
            <h3 className="font-bold text-stone-900 text-sm">Automated COD Remittance & 5% Commission Confirmation</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When courier companies remit Cash on Delivery funds to DEEZ's bank account, enter the remittance reference number. Reconciling COD automatically transitions attributed reseller commissions from <strong>Pending</strong> to <strong>Confirmed (Withdrawable)</strong>.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Courier & Tracking</th>
                    <th className="py-3 px-4">Expected COD</th>
                    <th className="py-3 px-4">Collected Amount</th>
                    <th className="py-3 px-4">Remittance Ref</th>
                    <th className="py-3 px-4">Reconciliation Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {orders
                    .filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Dispatched')
                    .map(o => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-mono font-bold text-[#8C6D46]">{o.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{o.courier.company || 'Standard Courier'}</p>
                          <span className="font-mono text-stone-500 text-[11px]">{o.courier.trackingNumber || 'Pending'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">PKR {o.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono">
                          {o.cod.amountCollected > 0 ? `PKR ${o.cod.amountCollected.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {o.cod.remittanceRef || 'Unremitted'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.cod.reconciliationStatus === 'Reconciled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.cod.reconciliationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {o.cod.reconciliationStatus !== 'Reconciled' && (
                            <button
                              onClick={() => {
                                setReconcilingOrder(o);
                                setReconcileCollected(o.totalAmount.toString());
                                setReconcileRef(`TRX-REMIT-${Date.now().toString().slice(-5)}`);
                              }}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] rounded-lg cursor-pointer"
                            >
                              Reconcile Cash
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-stone-900">Reseller Commission Withdrawal Requests</h3>
            <span>Total requests: {payouts.length}</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Payout ID</th>
                    <th className="py-3 px-4">Reseller</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method & Account</th>
                    <th className="py-3 px-4">Requested At</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">No withdrawal requests found.</td>
                    </tr>
                  ) : (
                    payouts.map(p => (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">{p.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{p.resellerName}</p>
                          <span className="font-mono text-stone-500 text-[11px]">{p.resellerId}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                          PKR {p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-stone-900">{p.method}</p>
                          <span className="text-stone-600">{p.accountTitle} ({p.accountNumber})</span>
                          {p.bankName && <p className="text-[11px] text-stone-500">{p.bankName}</p>}
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                          {new Date(p.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {p.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setProcessingPayout(p);
                                setPayoutTxRef(`JAZZ-${Date.now().toString().slice(-6)}`);
                              }}
                              className="px-3 py-1 bg-[#1C1917] hover:bg-[#322E2B] text-white rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Disburse
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={exportOrdersCSV}
              className="p-5 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs hover:bg-[#FAF8F5] text-left space-y-2 cursor-pointer transition-colors"
            >
              <FileText className="w-5 h-5 text-[#8C6D46]" />
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Download Orders CSV</h4>
              <p className="text-stone-500 text-xs">Complete order history with customer cities, dates, and COD statuses.</p>
            </button>

            <button
              onClick={() => {
                const headers = ['Reseller ID', 'Name', 'Phone', 'Email', 'City', 'Code', 'Status', 'Total Orders', 'Eligible Sales', 'Confirmed Comms', 'Paid Comms'];
                const rows = resellers.map(r => [
                  r.id,
                  `"${r.fullName}"`,
                  `"${r.mobileNumber}"`,
                  `"${r.email}"`,
                  `"${r.city}"`,
                  r.referralCode,
                  r.status,
                  r.metrics?.totalOrders || 0,
                  r.metrics?.eligibleSales || 0,
                  r.metrics?.confirmedCommission || 0,
                  r.metrics?.paidCommission || 0
                ]);
                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `DEEZ_Resellers_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-5 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs hover:bg-[#FAF8F5] text-left space-y-2 cursor-pointer transition-colors"
            >
              <Users className="w-5 h-5 text-[#8C6D46]" />
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Download Resellers CSV</h4>
              <p className="text-stone-500 text-xs">All reseller accounts, phone numbers, and earnings across Pakistan.</p>
            </button>

            <div className="p-5 bg-white rounded-2xl border border-[#E7E2DA] shadow-2xs text-left space-y-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Commission Liability Summary</h4>
              <p className="text-xs text-stone-600">
                Outstanding confirmed liability: <strong>PKR {(metrics?.confirmedUnpaidCommissions || 0).toLocaleString()}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SETTINGS (INCLUDING WHATSAPP & POLICIES) */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-3xl bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">DEEZ Global Platform & Contact Settings</h3>
            <p className="text-xs text-stone-500">
              Configure store contact details, WhatsApp button behavior, shipping thresholds, and commission rules.
            </p>
          </div>

          <form
            onSubmit={async e => {
              e.preventDefault();
              try {
                const res = await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`
                  },
                  body: JSON.stringify(settings)
                });
                if (res.ok) {
                  showToast('Store settings updated!', 'success');
                  loadAllAdminData();
                }
              } catch (err) {
                showToast('Error updating settings', 'error');
              }
            }}
            className="space-y-5 text-xs"
          >
            {/* WhatsApp Integration Setting (Requirement 8) */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2DA] space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <h4 className="font-bold text-stone-900 text-xs">Floating WhatsApp Button Configuration</h4>
              </div>
              <p className="text-[11px] text-stone-600">
                The floating WhatsApp chat icon appears on the storefront only when a valid number is provided here. Leave blank or empty to keep it hidden until your official number is ready.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    WhatsApp Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || ''}
                    onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="+923001234567 (or leave blank)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Format: +923001234567. Current: {settings.whatsappNumber ? settings.whatsappNumber : '(Not configured - Button Hidden)'}
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Prefilled Customer Welcome Message
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappWelcomeMessage || ''}
                    onChange={e => setSettings({ ...settings, whatsappWelcomeMessage: e.target.value })}
                    placeholder="Assalam-o-Alaikum DEEZ Cosmetics..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD6CC] rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Default Reseller Commission Rate (0.05 = 5%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.5"
                value={settings.commissionRate}
                onChange={e => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Standard Courier Fee (PKR)</label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={e => setSettings({ ...settings, shippingFee: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Free Delivery Threshold (PKR)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={e => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Official WhatsApp Support Number</label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ''}
                  onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="03034507537"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Head Office Address</label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={e => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-semibold text-xs cursor-pointer"
            >
              Save Global Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB 10: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#E7E2DA] flex justify-between items-center text-xs">
              <h3 className="font-bold text-stone-900">Security Audit Trail (Server-side Tamper Log)</h3>
              <span className="text-stone-500">Sensitive administrator actions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-stone-900">{log.adminEmail}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESELLER DETAILED PROFILE & ADMINISTRATIVE NOTES */}
      {selectedResellerProfile && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#E7E2DA]">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C6D46]">Reseller Detailed Profile</span>
                <h3 className="text-xl font-bold text-stone-900">{selectedResellerProfile.fullName}</h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  ID: {selectedResellerProfile.id} · Code: {selectedResellerProfile.referralCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedResellerProfile(null)}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Data Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E2DA]">
              <div>
                <span className="text-stone-500">Mobile Number:</span>
                <p className="font-semibold text-stone-900">{selectedResellerProfile.mobileNumber}</p>
              </div>
              <div>
                <span className="text-stone-500">Email Address:</span>
                <p className="font-semibold text-stone-900">{selectedResellerProfile.email || 'None provided'}</p>
              </div>
              <div>
                <span className="text-stone-500">Location:</span>
                <p className="font-semibold text-stone-900">{selectedResellerProfile.city}, {selectedResellerProfile.province}</p>
              </div>
              <div>
                <span className="text-stone-500">Account Status:</span>
                <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                  selectedResellerProfile.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedResellerProfile.status}
                </span>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500">Total Orders</span>
                <p className="text-base font-bold font-mono text-stone-900">{selectedResellerProfile.metrics?.totalOrders || 0}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500">Eligible Sales</span>
                <p className="text-base font-bold font-mono text-stone-900">PKR {(selectedResellerProfile.metrics?.eligibleSales || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500">Confirmed Comms</span>
                <p className="text-base font-bold font-mono text-emerald-700">PKR {(selectedResellerProfile.metrics?.confirmedCommission || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Internal Administrative Notes (Requirement 7) */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <StickyNote className="w-4 h-4 text-[#8C6D46]" />
                <span>Internal Administrative Notes (Private to Admin)</span>
              </div>
              <textarea
                rows={3}
                value={resellerNoteText}
                onChange={e => setResellerNoteText(e.target.value)}
                placeholder="Enter confidential notes, verification notes, special terms, or order observations..."
                className="w-full p-3 bg-[#FAF8F5] border border-[#DDD6CC] rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveResellerNote}
                  disabled={savingNote}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-xs cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save Administrative Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">
              {editingProduct ? `Edit ${editingProduct.title}` : 'Add New Cosmetics & Personal Care Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={e => setProdTitle(e.target.value)}
                    placeholder="e.g. DEEZ Honey Transparent Soap"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Title (Urdu)</label>
                  <input
                    type="text"
                    value={prodTitleUrdu}
                    onChange={e => setProdTitleUrdu(e.target.value)}
                    placeholder="دیز قدرتی شفاف صابن"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-urdu text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  >
                    {allCategories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Retail Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Optional Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={prodSalePrice}
                    onChange={e => setProdSalePrice(e.target.value)}
                    placeholder="Discounted price"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    placeholder="DZ-SOAP-01"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Size or Weight</label>
                  <input
                    type="text"
                    value={prodSize}
                    onChange={e => setProdSize(e.target.value)}
                    placeholder="e.g. 125g, 150ml, 30ml"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Stock Availability *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Main Image Path / URL *</label>
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Additional Gallery Images (comma-separated)</label>
                <input
                  type="text"
                  value={prodImages}
                  onChange={e => setProdImages(e.target.value)}
                  placeholder="/src/assets/images/img1.jpg, /src/assets/images/img2.jpg"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Variants / Shades (comma-separated)</label>
                <input
                  type="text"
                  value={prodVariants}
                  onChange={e => setProdVariants(e.target.value)}
                  placeholder="e.g. 100g Bar, Double Pack 2x100g, Family 300g"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Ingredients (Verified Only)</label>
                  <input
                    type="text"
                    value={prodIngredients}
                    onChange={e => setProdIngredients(e.target.value)}
                    placeholder="Plant Glycerin, Kashmiri Saffron, etc."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Directions for Use</label>
                  <input
                    type="text"
                    value={prodUsage}
                    onChange={e => setProdUsage(e.target.value)}
                    placeholder="Massage into lather and rinse..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  />
                </div>
              </div>

              {/* Product Flags */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2DA] flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={e => setProdFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodNewArrival}
                    onChange={e => setProdNewArrival(e.target.checked)}
                    className="rounded"
                  />
                  <span>New Arrival Badge</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodBestSeller}
                    onChange={e => setProdBestSeller(e.target.checked)}
                    className="rounded"
                  />
                  <span>Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodSpecialOffer}
                    onChange={e => setProdSpecialOffer(e.target.checked)}
                    className="rounded"
                  />
                  <span>Special Offer</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-amber-800">
                  <input
                    type="checkbox"
                    checked={prodPlaceholder}
                    onChange={e => setProdPlaceholder(e.target.checked)}
                    className="rounded"
                  />
                  <span>Mark as Development Placeholder</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save & Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY FORM */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">
              {editingCategory ? `Edit Category` : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Body Scrubs"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Category Name (Urdu)</label>
                <input
                  type="text"
                  value={catNameUrdu}
                  onChange={e => setCatNameUrdu(e.target.value)}
                  placeholder="باڈی سکرب"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-urdu text-right"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={e => setCatSlug(e.target.value)}
                  placeholder="body-scrubs"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN COURIER */}
      {assigningCourierOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">Assign Courier for {assigningCourierOrder.id}</h3>
            <form onSubmit={handleAssignCourier} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Courier Company</label>
                <select
                  value={courierCompany}
                  onChange={e => setCourierCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                >
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="TCS Express">TCS Express</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="Call Courier">Call Courier</option>
                  <option value="PostEx Pakistan">PostEx Pakistan</option>
                  <option value="M&P Express">M&P Express</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Tracking Consignment Number *</label>
                <input
                  type="text"
                  required
                  value={courierTracking}
                  onChange={e => setCourierTracking(e.target.value)}
                  placeholder="e.g. TRX-992140"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningCourierOrder(null)}
                  className="px-4 py-2 border rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECONCILE COD */}
      {reconcilingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">Reconcile COD for {reconcilingOrder.id}</h3>
            <p className="text-xs text-stone-500">
              Expected Amount: <strong>PKR {reconcilingOrder.totalAmount.toLocaleString()}</strong>
            </p>
            <form onSubmit={handleReconcileCod} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Actual Amount Remitted (PKR) *</label>
                <input
                  type="number"
                  required
                  value={reconcileCollected}
                  onChange={e => setReconcileCollected(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Courier Remittance Bank Reference *</label>
                <input
                  type="text"
                  required
                  value={reconcileRef}
                  onChange={e => setReconcileRef(e.target.value)}
                  placeholder="e.g. TRX-BATCH-9910"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcilingOrder(null)}
                  className="px-4 py-2 border rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Confirm & Credit Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISBURSE PAYOUT */}
      {processingPayout && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">Disburse Commission Payout</h3>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border text-xs space-y-1">
              <p>Reseller: <strong>{processingPayout.resellerName}</strong></p>
              <p>Amount: <strong className="text-emerald-700 font-mono text-sm">PKR {processingPayout.amount.toLocaleString()}</strong></p>
              <p>Method: {processingPayout.method} ({processingPayout.accountNumber})</p>
              <p>Title: {processingPayout.accountTitle}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Bank / JazzCash Transaction ID</label>
                <input
                  type="text"
                  value={payoutTxRef}
                  onChange={e => setPayoutTxRef(e.target.value)}
                  placeholder="e.g. TID-99410294"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessingPayout(null)}
                  className="px-4 py-2 border rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessPayout(processingPayout.id, 'Rejected')}
                  className="px-3 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-lg font-semibold"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessPayout(processingPayout.id, 'Paid')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RESELLER MANUALLY */}
      {showAddResellerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E7E2DA]">
            <h3 className="text-base font-bold text-stone-900">Manually Register Reseller</h3>
            <form onSubmit={handleCreateResellerManual} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newResellerName}
                  onChange={e => setNewResellerName(e.target.value)}
                  placeholder="Reseller Full Name"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={newResellerPhone}
                  onChange={e => setNewResellerPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newResellerEmail}
                  onChange={e => setNewResellerEmail(e.target.value)}
                  placeholder="reseller@example.com"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newResellerCity}
                    onChange={e => setNewResellerCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Province *</label>
                  <select
                    value={newResellerProvince}
                    onChange={e => setNewResellerProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border rounded-lg"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad</option>
                    <option value="Azad Jammu & Kashmir">AJK</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResellerModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
