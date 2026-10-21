'use client';

import AuthGuard from '@/components/admin/AuthGuard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  CreditCard,
  Truck,
  Boxes,
  MessageSquare,
  Briefcase,
  Layers,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Send,
  LogOut,
  Clock,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Edit,
  Plus,
  X,
  Tag,
  Minus,
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  Palette,
  Ruler,
  Copy,
  Phone,
  Mail,
  MessageCircle,
  Zap,
  Activity,
  Globe,
  Smartphone,
  Laptop,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF, exportToExcel } from '@/lib/admin-export';
import { getColorDisplay } from '@/lib/colors';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ContactActions from '@/components/admin/ContactActions';

type AdminTab =
  | 'overview'
  | 'analytics'
  | 'payments'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'enquiries'
  | 'settings';

const TRACKING_STEPS_7 = [
  { rank: 1, key: 'ORDER_PLACED', label: '1. Order Placed' },
  { rank: 2, key: 'ORDER_CONFIRMED', label: '2. Order Confirmed' },
  { rank: 3, key: 'PACKED', label: '3. Packed' },
  { rank: 4, key: 'SHIPPED', label: '4. Shipped' },
  { rank: 5, key: 'IN_TRANSIT', label: '5. In Transit' },
  { rank: 6, key: 'OUT_FOR_DELIVERY', label: '6. Out for Delivery' },
  { rank: 7, key: 'DELIVERED', label: '7. Delivered' },
];

const TRACKING_STATUS_RANKS: Record<string, number> = {
  ORDER_PLACED: 1,
  ORDER_CONFIRMED: 2,
  PROCESSING: 2,
  PACKED: 3,
  SHIPPED: 4,
  IN_TRANSIT: 5,
  OUT_FOR_DELIVERY: 6,
  DELIVERED: 7,
};

// Public catalog front-view only image mappings for admin product cards
const PUBLIC_PRODUCT_FRONT_IMAGES: Record<string, string> = {
  'cotton-supersoft-round-neck-180-gsm': '/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg',
  'cotton-aero-polo-240-gsm': '/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/front.jpg',
  'cotton-aero-tipping-polo-240-gsm': '/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/front.jpg',
  'double-ply-cotton-pique-polo-280-gsm': '/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Jet Black/f.jpg',
  'dry-fit-aerotech-polo-200-gsm': '/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Black/f.jpg',
  'poly-cotton-fusion-polo-220-gsm': '/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/front.jpg',
  'supima-supersoft-cotton-polo-240-gsm': '/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/front.jpg',
  'cotton-pullover-hood-300-gsm': '/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/f.jpg',
  'cotton-zipper-hood-300-gsm': '/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/f.jpg',
};

const CATEGORY_FRONT_IMAGES: Record<string, string> = {
  'round neck': '/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg',
  'polo': '/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/front.jpg',
  'hoodie': '/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/f.jpg',
  'zip hoodie': '/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/f.jpg',
};

export function AdminDashboardView({ initialTab = 'overview' }: { initialTab?: AdminTab } = {}) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Synchronize activeTab with URL ?tab= query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        if (['overview', 'analytics', 'payments', 'orders', 'inventory', 'customers', 'enquiries', 'settings'].includes(tabParam)) {
          setActiveTab(tabParam as AdminTab);
        } else if (tabParam === 'products' || tabParam === 'colors' || tabParam === 'sizes') {
          setActiveTab('inventory');
        } else if (tabParam === 'speed_insights' || tabParam === 'live_visitors' || tabParam === 'visitors') {
          setActiveTab('analytics');
        }
      } else if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const url = new URL(window.location.href);
      if (url.pathname !== '/admin') {
        window.history.replaceState(null, '', `/admin?tab=${tab}`);
      } else {
        url.searchParams.set('tab', tab);
        window.history.replaceState(null, '', url.toString());
      }
    }
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<any[]>([]);
  const [retailEnquiries, setRetailEnquiries] = useState<any[]>([]);
  const [bulkEnquiries, setBulkEnquiries] = useState<any[]>([]);
  const [brandEnquiries, setBrandEnquiries] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Operational Settings state
  const [settings, setSettings] = useState({
    upiId: '',
    upiName: 'FunPrint',
    whatsappNumber: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [analyticsRange, setAnalyticsRange] = useState('7d');
  const [analyticsLastSynced, setAnalyticsLastSynced] = useState<Date | null>(new Date());
  const [analyticsMetricTab, setAnalyticsMetricTab] = useState<'visitors' | 'views'>('visitors');
  const [pagesTab, setPagesTab] = useState<'pages' | 'routes' | 'hostnames'>('pages');
  const [referrersTab, setReferrersTab] = useState<'referrers' | 'utm'>('referrers');
  const [techTab, setTechTab] = useState<'devices' | 'browsers'>('devices');
  const [chartMounted, setChartMounted] = useState(false);
  useEffect(() => {
    setChartMounted(true);
  }, []);

  // Payment Verification States
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'upi' | 'cod'>('all');

  // Customer Management States
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Enquiry Sub-Tabs, Search, Filter & Expanded Breakdown States
  const [enquirySubTab, setEnquirySubTab] = useState<'retail' | 'bulk' | 'brand' | 'contact'>('retail');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [expandedRetailIds, setExpandedRetailIds] = useState<string[]>([]);
  const [deletingEnquiryId, setDeletingEnquiryId] = useState<string | null>(null);
  const [updatingEnquiryId, setUpdatingEnquiryId] = useState<string | null>(null);

  // Tracking Action modal/state (Simplified 4 fields strictly)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);
  const [trackingForm, setTrackingForm] = useState({
    courierCompany: '',
    trackingId: '',
    trackingUrl: '',
    status: 'ORDER_CONFIRMED',
  });
  const [savingTracking, setSavingTracking] = useState(false);

  // Custom dialog modals for confirmation, colors, sizes, and payments
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const [colorModal, setColorModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    productId: string;
    oldColorName?: string;
    colorName: string;
    colorHex: string;
  }>({
    isOpen: false,
    mode: 'add',
    productId: '',
    colorName: '',
    colorHex: '#000000',
  });

  const [sizeModal, setSizeModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    productId: string;
    oldSize?: string;
    size: string;
  }>({
    isOpen: false,
    mode: 'add',
    productId: '',
    size: 'M',
  });

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    mode: 'confirm' | 'reject';
    payment: any;
    reason?: string;
  }>({
    isOpen: false,
    mode: 'confirm',
    payment: null,
    reason: '',
  });

  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Product Modals & Quick Edits
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Round Neck',
    price: 499,
    description: '',
  });

  const [showAddVariantModal, setShowAddVariantModal] = useState<any>(null); // productId or null
  const [newVariantForm, setNewVariantForm] = useState({
    colorName: '',
    colorHex: '#000000',
    size: 'M',
    stockQuantity: 15,
  });

  const [editingPriceFor, setEditingPriceFor] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [expandedVariantsFor, setExpandedVariantsFor] = useState<string | null>(null);

  const getAdminHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const headers = getAdminHeaders();

      // Parallel fetching of admin resources (cache: no-store ensures fresh data)
      const now = Date.now();
      const [
        analyticsRes,
        paymentsRes,
        ordersRes,
        inventoryRes,
        customersRes,
        enquiriesRes,
        logsRes,
        settingsRes,
      ] = await Promise.allSettled([
        fetch(`/api/admin/analytics?range=${analyticsRange}&t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/payments?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/orders?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/inventory?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/customers?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/enquiries?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/logs?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/admin/settings?t=${now}`, { headers, cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value);
        setAnalyticsLastSynced(new Date());
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.payments) {
        setPayments(paymentsRes.value.payments);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.orders) {
        setOrders(ordersRes.value.orders);
      }
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.products) {
        setInventory(inventoryRes.value.products);
      }
      if (customersRes.status === 'fulfilled' && customersRes.value.customers) {
        setCustomers(customersRes.value.customers);
      }
      if (enquiriesRes.status === 'fulfilled') {
        const payload = enquiriesRes.value?.data || enquiriesRes.value || {};
        setContactEnquiries(payload.contact || enquiriesRes.value?.contact || []);
        setRetailEnquiries(payload.retail || enquiriesRes.value?.retail || []);
        setBulkEnquiries(payload.bulk || enquiriesRes.value?.bulk || []);
        setBrandEnquiries(payload.brand || enquiriesRes.value?.brand || []);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.logs) {
        setAuditLogs(logsRes.value.logs);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.settings) {
        setSettings({
          upiId: settingsRes.value.settings.upiId || '',
          upiName: settingsRes.value.settings.upiName || 'FunPrint',
          whatsappNumber: settingsRes.value.settings.whatsappNumber || '',
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [analyticsRange]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  // Payment Verification Actions
  // Payment Verification Modal Handlers
  const handleConfirmPaymentModal = async () => {
    if (!paymentModal.payment) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          paymentId: paymentModal.payment.id,
          action: 'CONFIRM',
          orderId: paymentModal.payment.order_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const isCod = (paymentModal.payment.payment_method || '').toUpperCase().includes('COD');
        toast.success(isCod ? 'COD order verified & confirmed successfully!' : 'UPI payment verified & order confirmed successfully!');
        setPaymentModal({ isOpen: false, mode: 'confirm', payment: null });
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to confirm payment');
      }
    } catch (err) {
      toast.error('Network error confirming payment');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectPaymentModal = async () => {
    if (!paymentModal.payment) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          paymentId: paymentModal.payment.id,
          action: 'REJECT',
          orderId: paymentModal.payment.order_id,
          reason: paymentModal.reason || 'Payment discrepancy in bank statement',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment marked as rejected');
        setPaymentModal({ isOpen: false, mode: 'reject', payment: null });
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to reject payment');
      }
    } catch (err) {
      toast.error('Network error rejecting payment');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Tracking Action Modal Trigger (Pre-populates the 4 fields)
  const handleOpenTrackingModal = (o: any) => {
    setSelectedOrderForTracking(o);
    const currentStatus = (o.order_status || 'ORDER_PLACED').toUpperCase();
    const currentRank = TRACKING_STATUS_RANKS[currentStatus] || 1;
    const nextStatus = currentRank < 7 
      ? TRACKING_STEPS_7[currentRank]?.key || 'ORDER_CONFIRMED'
      : 'DELIVERED';

    setTrackingForm({
      courierCompany: o.courier_name || '',
      trackingId: o.tracking_id || '',
      trackingUrl: o.tracking_url || '',
      status: currentRank < 7 ? nextStatus : 'DELIVERED',
    });
  };

  // Tracking Update Action (Simplified 4 fields strictly)
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    if (trackingForm.trackingUrl) {
      try {
        const u = new URL(trackingForm.trackingUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          toast.error('Tracking URL must be a valid HTTP or HTTPS link');
          return;
        }
      } catch {
        toast.error('Please enter a valid Tracking URL (e.g. https://www.bluedart.com)');
        return;
      }
    }

    setSavingTracking(true);
    try {
      const targetOrderId = selectedOrderForTracking.id || selectedOrderForTracking.order_code;

      const res = await fetch('/api/admin/tracking', {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          orderId: targetOrderId,
          status: trackingForm.status,
          courierCompany: trackingForm.courierCompany,
          trackingId: trackingForm.trackingId,
          trackingUrl: trackingForm.trackingUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Shipment status updated to ${trackingForm.status}!`);
        setSelectedOrderForTracking(null);
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to update shipment status');
      }
    } catch (err) {
      toast.error('Error saving tracking info');
    } finally {
      setSavingTracking(false);
    }
  };

  // Settings Update Action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Operational settings updated successfully in Neon DB!');
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      toast.error('Network error updating settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Product Actions
  const handleUpdateProductPrice = async (productId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid price amount');
      return;
    }
    // Optimistic UI update
    setInventory((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'product',
          productId,
          price: newPrice,
        }),
      });
      if (res.ok) {
        toast.success(`Price updated to ₹${newPrice}`);
        setEditingPriceFor(null);
        loadAllData();
      } else {
        toast.error('Failed to update price');
        loadAllData();
      }
    } catch (err) {
      toast.error('Error updating price');
      loadAllData();
    }
  };

  const handleToggleProductVisibility = async (productId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setInventory((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_visible: nextStatus } : p))
    );
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'product',
          productId,
          isVisible: nextStatus,
        }),
      });
      if (res.ok) {
        toast.success(nextStatus ? 'Product is now visible in store' : 'Product hidden from store');
        loadAllData();
      } else {
        toast.error('Failed to update visibility');
        loadAllData();
      }
    } catch (err) {
      toast.error('Network error');
      loadAllData();
    }
  };

  const handleSaveProductDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'product',
          productId: editingProduct.id,
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description,
          price: Number(editingProduct.price),
        }),
      });
      if (res.ok) {
        toast.success('Product updated successfully!');
        setEditingProduct(null);
        loadAllData();
      } else {
        toast.error('Failed to update product');
      }
    } catch (err) {
      toast.error('Error updating product');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      toast.error('Product name and price are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(newProductForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Product created with default size variants!');
        setShowAddProductModal(false);
        setNewProductForm({ name: '', category: 'Round Neck', price: 499, description: '' });
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to create product');
      }
    } catch (err) {
      toast.error('Error creating product');
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantForm.colorName || !newVariantForm.size) {
      toast.error('Color and Size are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'ADD_VARIANT',
          productId: showAddVariantModal,
          colorName: newVariantForm.colorName,
          colorHex: newVariantForm.colorHex,
          size: newVariantForm.size,
          stockQuantity: Number(newVariantForm.stockQuantity) || 15,
        }),
      });
      if (res.ok) {
        toast.success('New color/size variant added!');
        setShowAddVariantModal(null);
        setNewVariantForm({ colorName: '', colorHex: '#000000', size: 'M', stockQuantity: 15 });
        loadAllData();
      } else {
        toast.error('Failed to add variant');
      }
    } catch (err) {
      toast.error('Error adding variant');
    }
  };

  const handleUpdateVariantStock = async (variantId: string, newStock: number) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'variant',
          variantId,
          stockQuantity: Math.max(0, newStock),
        }),
      });
      if (res.ok) {
        toast.success('Variant stock updated');
        loadAllData();
      } else {
        toast.error('Failed to update stock');
      }
    } catch (err) {
      toast.error('Error updating stock');
    }
  };

  const handleAddColorToProduct = (productId: string) => {
    setColorModal({
      isOpen: true,
      mode: 'add',
      productId,
      colorName: '',
      colorHex: '#000000',
    });
  };

  const handleEditColor = (productId: string, oldColorName: string, currentColorHex?: string) => {
    setColorModal({
      isOpen: true,
      mode: 'edit',
      productId,
      oldColorName,
      colorName: oldColorName,
      colorHex: currentColorHex || getColorDisplay(oldColorName),
    });
  };

  const handleSaveColorModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorModal.colorName.trim()) {
      toast.error('Color name is required');
      return;
    }
    const finalHex = colorModal.colorHex.trim() || getColorDisplay(colorModal.colorName.trim());
    const cName = colorModal.colorName.trim();

    setIsProcessingAction(true);
    try {
      if (colorModal.mode === 'add') {
        // Optimistic UI update
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== colorModal.productId) return p;
            const existingSizes: string[] = Array.from(new Set((p.variants || []).map((v: any) => String(v.size || 'M'))));
            const sizesToUse = existingSizes.length > 0 ? existingSizes : ['S', 'M', 'L', 'XL', 'XXL'];
            const newVars = sizesToUse.map((sz: string) => ({
              id: `opt-${Date.now()}-${sz}`,
              colorName: cName,
              color: cName,
              colorHex: finalHex,
              size: sz,
              sku: `${p.id.substring(0, 4).toUpperCase()}-${cName.substring(0, 3).toUpperCase()}-${sz}`,
              stockQuantity: 15,
              isAvailable: true,
            }));
            return {
              ...p,
              variants: [...(p.variants || []), ...newVars],
            };
          })
        );

        const res = await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'ADD_COLOR',
            productId: colorModal.productId,
            colorName: cName,
            colorHex: finalHex,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Color "${cName}" added to product!`);
          setColorModal({ isOpen: false, mode: 'add', productId: '', colorName: '', colorHex: '#000000' });
          loadAllData();
        } else {
          toast.error(data.error || 'Failed to add color');
          loadAllData();
        }
      } else {
        // Optimistic UI update for edit
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== colorModal.productId) return p;
            return {
              ...p,
              variants: (p.variants || []).map((v: any) => {
                const curName = v.colorName || v.color;
                if (curName && curName.toLowerCase() === colorModal.oldColorName?.toLowerCase()) {
                  return {
                    ...v,
                    colorName: cName,
                    color: cName,
                    colorHex: finalHex,
                  };
                }
                return v;
              }),
            };
          })
        );

        const res = await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'EDIT_COLOR',
            productId: colorModal.productId,
            oldColorName: colorModal.oldColorName,
            newColorName: cName,
            newColorHex: finalHex,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Color updated to "${cName}"`);
          setColorModal({ isOpen: false, mode: 'edit', productId: '', colorName: '', colorHex: '#000000' });
          loadAllData();
        } else {
          toast.error(data.error || 'Failed to update color');
          loadAllData();
        }
      }
    } catch (err) {
      toast.error('Error saving color');
      loadAllData();
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteColor = (productId: string, colorName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product Color',
      message: `Are you sure you want to delete color "${colorName}" and all its size variants from this product?`,
      confirmLabel: 'Delete Color',
      isDestructive: true,
      onConfirm: async () => {
        setIsProcessingAction(true);
        // Optimistic UI update
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              variants: (p.variants || []).filter((v: any) => {
                const cName = v.colorName || v.color;
                return !cName || cName.toLowerCase() !== colorName.toLowerCase();
              }),
            };
          })
        );
        try {
          const res = await fetch(`/api/admin/inventory?type=color&productId=${productId}&colorName=${encodeURIComponent(colorName)}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(`Color "${colorName}" deleted`);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            loadAllData();
          } else {
            toast.error(data.error || 'Failed to delete color');
            loadAllData();
          }
        } catch (err) {
          toast.error('Error deleting color');
          loadAllData();
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  const handleAddSizeToProduct = (productId: string) => {
    setSizeModal({
      isOpen: true,
      mode: 'add',
      productId,
      size: '',
    });
  };

  const handleEditSize = (productId: string, oldSize: string) => {
    setSizeModal({
      isOpen: true,
      mode: 'edit',
      productId,
      oldSize,
      size: oldSize,
    });
  };

  const handleSaveSizeModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeModal.size.trim()) {
      toast.error('Size is required');
      return;
    }
    const szName = sizeModal.size.trim().toUpperCase();

    setIsProcessingAction(true);
    try {
      if (sizeModal.mode === 'add') {
        // Optimistic UI update
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== sizeModal.productId) return p;
            const existingColors = Array.from(
              new Map(
                (p.variants || []).map((v: any) => [v.colorName || v.color || 'Black', v.colorHex || '#000000'])
              ).entries()
            );
            const colorsToUse: [string, string][] = existingColors.length > 0 ? (existingColors as [string, string][]) : [['Black', '#000000']];
            const newVars = colorsToUse.map(([colName, colHex]) => ({
              id: `opt-${Date.now()}-${colName}`,
              colorName: colName,
              color: colName,
              colorHex: colHex,
              size: szName,
              sku: `${p.id.substring(0, 4).toUpperCase()}-${String(colName).substring(0, 3).toUpperCase()}-${szName}`,
              stockQuantity: 15,
              isAvailable: true,
            }));
            return {
              ...p,
              variants: [...(p.variants || []), ...newVars],
            };
          })
        );

        const res = await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'ADD_SIZE',
            productId: sizeModal.productId,
            size: szName,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Size "${szName}" added to product!`);
          setSizeModal({ isOpen: false, mode: 'add', productId: '', size: 'M' });
          loadAllData();
        } else {
          toast.error(data.error || 'Failed to add size');
          loadAllData();
        }
      } else {
        // Optimistic UI update for edit size
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== sizeModal.productId) return p;
            return {
              ...p,
              variants: (p.variants || []).map((v: any) => {
                if (v.size && v.size.toUpperCase() === sizeModal.oldSize?.toUpperCase()) {
                  return { ...v, size: szName };
                }
                return v;
              }),
            };
          })
        );

        const res = await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'EDIT_SIZE',
            productId: sizeModal.productId,
            oldSize: sizeModal.oldSize,
            newSize: szName,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Size updated to "${szName}"`);
          setSizeModal({ isOpen: false, mode: 'edit', productId: '', size: 'M' });
          loadAllData();
        } else {
          toast.error(data.error || 'Failed to update size');
          loadAllData();
        }
      }
    } catch (err) {
      toast.error('Error saving size');
      loadAllData();
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteSize = (productId: string, size: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product Size',
      message: `Are you sure you want to delete size "${size}" and all its color variants from this product?`,
      confirmLabel: 'Delete Size',
      isDestructive: true,
      onConfirm: async () => {
        setIsProcessingAction(true);
        // Optimistic UI update
        setInventory((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              variants: (p.variants || []).filter((v: any) => v.size?.toUpperCase() !== size.toUpperCase()),
            };
          })
        );
        try {
          const res = await fetch(`/api/admin/inventory?type=size&productId=${productId}&size=${encodeURIComponent(size)}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(`Size "${size}" deleted`);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            loadAllData();
          } else {
            toast.error(data.error || 'Failed to delete size');
            loadAllData();
          }
        } catch (err) {
          toast.error('Error deleting size');
          loadAllData();
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  const handleDeleteVariant = (variantId: string, label: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Variant',
      message: `Are you sure you want to delete variant "${label}"?`,
      confirmLabel: 'Delete Variant',
      isDestructive: true,
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          const res = await fetch(`/api/admin/inventory?type=variant&variantId=${variantId}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success('Variant removed');
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            loadAllData();
          } else {
            toast.error(data.error || 'Failed to delete variant');
          }
        } catch (err) {
          toast.error('Error deleting variant');
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  const handleMarkOrderDelivered = (orderId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Order Delivery',
      message: `Confirm delivery for Order #${orderId}? This will update status to DELIVERED, record the delivery event, and automatically send delivery confirmation email to the customer.`,
      confirmLabel: 'Confirm Delivery',
      isDestructive: false,
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({
              orderStatus: 'DELIVERED',
              trackingLocation: 'Customer Address',
              trackingMessage: 'Order delivered successfully to customer doorstep.',
            }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success('Order marked as Delivered & confirmation email sent to customer!');
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            loadAllData();
          } else {
            toast.error(data.error || 'Failed to update order status');
          }
        } catch (err) {
          toast.error('Error updating order');
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  const handleDeleteCustomer = async (id: string) => {
    if (deletingCustomerId) return;
    setDeletingCustomerId(id);
    try {
      const res = await fetch(`/api/admin/customers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Customer deleted successfully');
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      toast.error('Network error deleting customer');
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const handleDeleteEnquiry = async (
    type: 'contact' | 'retail' | 'bulk' | 'brand',
    id: string
  ) => {
    if (deletingEnquiryId) return;
    setDeletingEnquiryId(id);
    try {
      const res = await fetch(`/api/admin/enquiries?type=${type}&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Enquiry deleted successfully');
        if (type === 'retail') setRetailEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (type === 'bulk') setBulkEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (type === 'brand') setBrandEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (type === 'contact') setContactEnquiries((prev) => prev.filter((e) => e.id !== id));
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to delete enquiry');
      }
    } catch (err) {
      toast.error('Network error deleting enquiry');
    } finally {
      setDeletingEnquiryId(null);
    }
  };

  const handleUpdateEnquiryStatus = async (
    type: 'contact' | 'retail' | 'bulk' | 'brand',
    id: string,
    status: string
  ) => {
    if (updatingEnquiryId) return;
    setUpdatingEnquiryId(id);
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ type, id, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Enquiry marked as ${status}`);
        const updater = (prev: any[]) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item));
        if (type === 'retail') setRetailEnquiries(updater);
        if (type === 'bulk') setBulkEnquiries(updater);
        if (type === 'brand') setBrandEnquiries(updater);
        if (type === 'contact') setContactEnquiries(updater);
        loadAllData();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    } finally {
      setUpdatingEnquiryId(null);
    }
  };

  // Helper to extract front-view image source for admin product cards
  const getProductImage = (p: any) => {
    if (p?.id && PUBLIC_PRODUCT_FRONT_IMAGES[p.id]) {
      return PUBLIC_PRODUCT_FRONT_IMAGES[p.id];
    }
    const cleanId = (p?.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, val] of Object.entries(PUBLIC_PRODUCT_FRONT_IMAGES)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanId === cleanKey || cleanId.includes(cleanKey) || cleanKey.includes(cleanId)) {
        return val;
      }
    }
    const cleanName = (p?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, val] of Object.entries(PUBLIC_PRODUCT_FRONT_IMAGES)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName === cleanKey || cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
        return val;
      }
    }
    const categoryKey = (p?.category || '').toLowerCase().trim();
    if (CATEGORY_FRONT_IMAGES[categoryKey]) {
      return CATEGORY_FRONT_IMAGES[categoryKey];
    }
    if (typeof p?.images === 'object' && p.images?.front) {
      return p.images.front;
    }
    if (typeof p?.images === 'string' && p.images.startsWith('/')) {
      return p.images;
    }
    if (p?.image_url) {
      return p.image_url;
    }
    return '/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg';
  };

  // Ensure single card per product, deduplicated and matching active catalog
  const validProducts = Array.from(
    new Map(
      inventory
        .filter((p) => p && p.id && !p.id.includes('mock') && p.is_visible !== false)
        .map((p) => [p.id, p])
    ).values()
  );

  const categories = ['All', ...Array.from(new Set(validProducts.map((p) => p.category || 'Apparel')))];
  const filteredInventory = validProducts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Payments & Payment Counts
  const filteredPayments = payments.filter((p) => {
    const isCod = (p.payment_method || '').toUpperCase().includes('COD');
    const isUpi = !isCod;
    const st = (p.payment_status || p.status || 'PENDING').toUpperCase();
    const isPending = st === 'SUBMITTED_FOR_VERIFICATION' || st === 'PENDING';
    const isConfirmed = st === 'CONFIRMED' || st === 'VERIFIED';
    const isRejected = st === 'REJECTED';

    if (paymentFilter === 'pending' && !isPending) return false;
    if (paymentFilter === 'confirmed' && !isConfirmed) return false;
    if (paymentFilter === 'rejected' && !isRejected) return false;
    if (paymentFilter === 'upi' && !isUpi) return false;
    if (paymentFilter === 'cod' && !isCod) return false;

    if (paymentSearch.trim()) {
      const q = paymentSearch.toLowerCase().trim();
      const orderId = (p.order_id || '').toLowerCase();
      const customerName = (p.customer_name || p.payer_name || '').toLowerCase();
      const phone = (p.customer_phone || p.payer_phone || '').toLowerCase();
      const utr = (p.transaction_ref || p.transaction_reference || '').toLowerCase();
      const method = (p.payment_method || '').toLowerCase();
      return (
        orderId.includes(q) ||
        customerName.includes(q) ||
        phone.includes(q) ||
        utr.includes(q) ||
        method.includes(q)
      );
    }
    return true;
  });

  const totalPaymentsCount = payments.length;
  const pendingPaymentsList = payments.filter((p) => {
    const st = (p.payment_status || p.status || 'PENDING').toUpperCase();
    return st === 'SUBMITTED_FOR_VERIFICATION' || st === 'PENDING';
  });
  const pendingPaymentsCount = pendingPaymentsList.length;
  const pendingUpiCount = payments.filter((p) => (p.payment_status || p.status || '').toUpperCase() === 'SUBMITTED_FOR_VERIFICATION').length;
  const pendingCodCount = payments.filter((p) => {
    const isCod = (p.payment_method || '').toUpperCase().includes('COD');
    const st = (p.payment_status || p.status || '').toUpperCase();
    return isCod && st === 'PENDING';
  }).length;
  const confirmedPaymentsCount = payments.filter((p) => {
    const st = (p.payment_status || p.status || '').toUpperCase();
    return st === 'CONFIRMED' || st === 'VERIFIED';
  }).length;
  const rejectedPaymentsCount = payments.filter((p) => {
    const st = (p.payment_status || p.status || '').toUpperCase();
    return st === 'REJECTED';
  }).length;
  const upiPaymentsCount = payments.filter((p) => !(p.payment_method || '').toUpperCase().includes('COD')).length;
  const codPaymentsCount = payments.filter((p) => (p.payment_method || '').toUpperCase().includes('COD')).length;

  // Inventory Stock Calculations
  const lowStockProducts = inventory.filter((item) => {
    const threshold = Number(item.low_stock_threshold) || 10;
    const stock = Number(item.total_stock) || 0;
    return stock <= threshold || !item.is_in_stock;
  });

  // Actionable Pending Enquiries Calculations
  const pendingContactCount = contactEnquiries.filter((e) => e.status !== 'RESOLVED').length;
  const pendingRetailCount = retailEnquiries.filter((e) => e.status !== 'RESOLVED').length;
  const pendingBulkCount = bulkEnquiries.filter((e) => e.status !== 'RESOLVED').length;
  const pendingBrandCount = brandEnquiries.filter((e) => e.status !== 'RESOLVED').length;
  const totalPendingEnquiriesCount = pendingContactCount + pendingRetailCount + pendingBulkCount + pendingBrandCount;
  const totalEnquiriesCount = contactEnquiries.length + retailEnquiries.length + bulkEnquiries.length + brandEnquiries.length;

  // ===================== EXPORT HANDLERS (PDF & EXCEL) =====================
  const handleExportPayments = async (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Order ID', key: 'order_id' },
      { header: 'Payment Method', key: 'payment_method' },
      { header: 'Amount', key: 'amount' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Phone Number', key: 'customer_phone' },
      { header: 'Bank UTR / Collection Ref', key: 'transaction_ref' },
      { header: 'Verification Status', key: 'payment_status' },
      { header: 'Submitted At', key: 'submitted_at' },
    ];
    const data = filteredPayments.map((p) => {
      const isCod = (p.payment_method || '').toUpperCase().includes('COD');
      const st = (p.payment_status || p.status || 'PENDING').toUpperCase();
      const statusLabel =
        st === 'CONFIRMED' || st === 'VERIFIED'
          ? 'Verified & Confirmed'
          : st === 'REJECTED'
          ? 'Rejected'
          : isCod
          ? 'Pending Collection'
          : 'Pending Verification';
      return {
        order_id: p.order_id,
        payment_method: isCod ? 'Cash on Delivery (COD)' : 'Manual UPI Payment',
        amount: `₹${Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        customer_name: p.customer_name || p.payer_name || 'N/A',
        customer_phone: p.customer_phone || p.payer_phone || 'N/A',
        transaction_ref: p.transaction_ref || p.transaction_reference || (isCod ? `COD-${p.order_id}` : 'N/A'),
        payment_status: statusLabel,
        submitted_at: p.payment_date || p.created_at
          ? new Date(p.payment_date || p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          : 'N/A',
      };
    });

    if (type === 'pdf') {
      await exportToPDF({
        filename: `FunPrint_Payments_${Date.now()}`,
        title: 'FunPrint Payment Verifications & Collections Report',
        columns,
        data,
      });
      toast.success('Payments PDF downloaded successfully!');
    } else {
      exportToExcel({
        filename: `FunPrint_Payments_${Date.now()}`,
        title: 'Payment Verifications Report',
        columns,
        data,
      });
      toast.success('Payments Excel downloaded successfully!');
    }
  };

  const handleExportCustomers = async (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Customer Name', key: 'full_name' },
      { header: 'Email Address', key: 'email' },
      { header: 'Phone Number', key: 'phone' },
      { header: 'Registered On', key: 'created_at' },
      { header: 'Account Status', key: 'status' },
    ];
    const data = customers.map((c) => ({
      full_name: c.full_name || 'Customer',
      email: c.email || '-',
      phone: c.phone || '-',
      created_at: new Date(c.created_at).toLocaleDateString('en-IN'),
      status: c.is_active ? 'Active' : 'Disabled',
    }));

    if (type === 'pdf') {
      await exportToPDF({
        filename: `FunPrint_Customers_${Date.now()}`,
        title: 'FunPrint Customer Accounts & User Directory',
        columns,
        data,
      });
      toast.success('Customers PDF downloaded successfully!');
    } else {
      exportToExcel({
        filename: `FunPrint_Customers_${Date.now()}`,
        title: 'Customer Directory',
        columns,
        data,
      });
      toast.success('Customers Excel downloaded successfully!');
    }
  };

  const handleExportOrders = async (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Order ID', key: 'id' },
      { header: 'Customer Name', key: 'customer_name' },
      { header: 'Customer Email', key: 'customer_email' },
      { header: 'Customer Phone', key: 'customer_phone' },
      { header: 'Total (INR)', key: 'total_amount' },
      { header: 'Payment Status', key: 'payment_status' },
      { header: 'Order Status', key: 'order_status' },
      { header: 'Courier Partner', key: 'courier_name' },
      { header: 'Tracking AWB', key: 'tracking_id' },
      { header: 'Order Date', key: 'created_at' },
    ];
    const data = orders.map((o) => ({
      id: o.id,
      customer_name: o.customer_name || 'Customer',
      customer_email: o.customer_email || '-',
      customer_phone: o.customer_phone || '-',
      total_amount: `₹${o.total_amount}`,
      payment_status: o.payment_status,
      order_status: o.order_status,
      courier_name: o.courier_name || '-',
      tracking_id: o.tracking_id || '-',
      created_at: new Date(o.created_at).toLocaleDateString('en-IN'),
    }));

    if (type === 'pdf') {
      await exportToPDF({
        filename: `FunPrint_Orders_${Date.now()}`,
        title: 'FunPrint Orders & Fulfillment Report',
        columns,
        data,
      });
      toast.success('Orders PDF downloaded successfully!');
    } else {
      exportToExcel({
        filename: `FunPrint_Orders_${Date.now()}`,
        title: 'Orders Report',
        columns,
        data,
      });
      toast.success('Orders Excel downloaded successfully!');
    }
  };



  const handleExportDashboard = async (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Metric / Component', key: 'metric' },
      { header: 'Value / Figure', key: 'value' },
      { header: 'Operational Status', key: 'status' },
      { header: 'Audit Note', key: 'notes' },
    ];
    const data = [
      {
        metric: 'Total Verified Sales Revenue',
        value: `₹${analytics?.totalSales || 0}`,
        status: 'VERIFIED',
        notes: 'Manual UPI transactions matched with bank statement',
      },
      {
        metric: 'Total Orders Processed',
        value: `${analytics?.totalOrders || 0} Orders`,
        status: 'ACTIVE',
        notes: 'Includes production, dispatch & delivered orders',
      },
      {
        metric: 'Pending Payment Verifications',
        value: `${payments.filter((p) => p.status === 'SUBMITTED_FOR_VERIFICATION').length} Pending`,
        status: 'ACTION REQUIRED',
        notes: 'Customer submitted UTR awaiting bank matching',
      },
      {
        metric: 'Active Store Visitors (Last 5m)',
        value: `${analytics?.activeVisitorsCount || 1} Active Shoppers`,
        status: 'LIVE STREAMING',
        notes: 'Neon PostgreSQL pseudonymous visitor heartbeat',
      },
      {
        metric: 'Registered Customer Accounts',
        value: `${customers.length} Accounts`,
        status: 'AUTHENTICATED',
        notes: 'Bcrypt password & OTP verified customer profiles',
      },
      {
        metric: 'Total Apparel Styles in Catalog',
        value: `${inventory.length} Core Styles`,
        status: 'IN PRODUCTION',
        notes: 'T-Shirts, Polos, Hoodies & Sweatshirts',
      },
      {
        metric: 'Total Open Enquiries',
        value: `${contactEnquiries.length + retailEnquiries.length + bulkEnquiries.length} Enquiries`,
        status: 'IN REVIEW',
        notes: 'Contact messages, retail logos & wholesale quotes',
      },
    ];

    if (type === 'pdf') {
      await exportToPDF({
        filename: `FunPrint_Executive_Dashboard_${Date.now()}`,
        title: 'Executive Store Performance & Operations Summary',
        columns,
        data,
      });
      toast.success('Dashboard summary PDF downloaded!');
    } else {
      exportToExcel({
        filename: `FunPrint_Executive_Dashboard_${Date.now()}`,
        title: 'Executive Summary',
        columns,
        data,
      });
      toast.success('Dashboard summary Excel downloaded!');
    }
  };

  const handleExportEnquiries = async (
    type: 'pdf' | 'excel',
    categoryFilter?: 'retail' | 'bulk' | 'brand' | 'contact' | 'all'
  ) => {
    const activeCat = categoryFilter || enquirySubTab || 'all';
    let title = 'Customer Enquiries Master Report';
    let filenamePrefix = 'FunPrint_Enquiries';

    let columns: { header: string; key: string }[] = [];
    const data: any[] = [];

    if (activeCat === 'retail') {
      title = 'Retail Custom Logo Garment Enquiries';
      filenamePrefix = 'FunPrint_Retail_Enquiries';
      columns = [
        { header: 'Customer Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Base Garment', key: 'garment_type' },
        { header: 'Total Pieces', key: 'pieces' },
        { header: 'Colors, Sizes & Placement', key: 'breakdown' },
        { header: 'Logo Instructions', key: 'instructions' },
        { header: 'Status', key: 'status' },
        { header: 'Submission Date', key: 'date' },
      ];
      retailEnquiries.forEach((r) => {
        data.push({
          name: r.customer_name || 'Anonymous Customer',
          email: r.email || r.customer_email || '-',
          phone: r.phone || r.customer_phone || '-',
          garment_type: r.garment_type || 'Custom Apparel',
          pieces: `${r.quantities || r.quantity || 1} pcs`,
          breakdown: r.colors ? r.colors.replace(/;/g, ' | ') : '-',
          instructions: r.instructions || '-',
          status: r.status || 'NEW',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
    } else if (activeCat === 'bulk') {
      title = 'Factory Direct Bulk Wholesale Enquiries';
      filenamePrefix = 'FunPrint_Factory_Bulk_Enquiries';
      columns = [
        { header: 'Contact Name', key: 'name' },
        { header: 'Organization / Company', key: 'organization' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Garment Type', key: 'garment_type' },
        { header: 'Quantity', key: 'quantity' },
        { header: 'Fabric Specs / GSM', key: 'specs' },
        { header: 'Requirements', key: 'requirements' },
        { header: 'Status', key: 'status' },
        { header: 'Submission Date', key: 'date' },
      ];
      bulkEnquiries.forEach((b) => {
        data.push({
          name: b.contact_name || b.company_name || 'Wholesale Buyer',
          organization: b.organization || '-',
          email: b.email || '-',
          phone: b.phone || '-',
          garment_type: b.items?.[0]?.garmentType || 'Bulk Garments',
          quantity: `${b.items?.[0]?.quantity || 50}+ units`,
          specs: b.fabric_specs || b.gsm || 'Wholesale Specs',
          requirements: b.admin_notes || '-',
          status: b.status || 'NEW',
          date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
    } else if (activeCat === 'brand') {
      title = 'Brand Collaboration Bulk Enquiries';
      filenamePrefix = 'FunPrint_Brand_Enquiries';
      columns = [
        { header: 'Contact Person', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Selected Brands', key: 'brands' },
        { header: 'Order Concern & Requirements', key: 'message' },
        { header: 'Status', key: 'status' },
        { header: 'Submission Date', key: 'date' },
      ];
      brandEnquiries.forEach((br) => {
        data.push({
          name: br.name || 'Brand Buyer',
          email: br.email || '-',
          phone: br.phone || '-',
          brands: br.brands || '-',
          message: br.message || '-',
          status: br.status || 'NEW',
          date: br.created_at ? new Date(br.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
    } else if (activeCat === 'contact') {
      title = 'General Contact Submissions';
      filenamePrefix = 'FunPrint_Contact_Messages';
      columns = [
        { header: 'Sender Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Subject / Message', key: 'message' },
        { header: 'Status', key: 'status' },
        { header: 'Submission Date', key: 'date' },
      ];
      contactEnquiries.forEach((c) => {
        data.push({
          name: c.name || 'Anonymous Sender',
          email: c.email || '-',
          phone: c.phone || '-',
          message: c.message || '-',
          status: c.status || 'NEW',
          date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
    } else {
      title = 'All Customer Inquiries & Wholesale Master Report';
      filenamePrefix = 'FunPrint_All_Enquiries';
      columns = [
        { header: 'Category', key: 'category' },
        { header: 'Contact / Sender Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Quantity / Details', key: 'details' },
        { header: 'Status', key: 'status' },
        { header: 'Submission Date', key: 'date' },
      ];
      contactEnquiries.forEach((c) => {
        data.push({
          category: 'General Contact',
          name: c.name || 'Anonymous',
          email: c.email || '-',
          phone: c.phone || '-',
          details: c.message ? `"${c.message.slice(0, 50)}..."` : 'Support Inquiry',
          status: c.status || 'NEW',
          date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
      retailEnquiries.forEach((r) => {
        data.push({
          category: 'Retail Custom Logo',
          name: r.customer_name || 'Anonymous',
          email: r.email || r.customer_email || '-',
          phone: r.phone || r.customer_phone || '-',
          details: `${r.quantities || r.quantity || 1} pcs (${r.garment_type || 'Custom Apparel'}) - ${r.colors || ''}`,
          status: r.status || 'NEW',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
      bulkEnquiries.forEach((b) => {
        data.push({
          category: 'Wholesale Bulk Order',
          name: b.contact_name || b.company_name || 'Wholesale Buyer',
          email: b.email || '-',
          phone: b.phone || '-',
          details: `${b.fabric_specs || b.gsm || 'Custom'} (${b.organization || 'Individual'})`,
          status: b.status || 'NEW',
          date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
      brandEnquiries.forEach((br) => {
        data.push({
          category: 'Brand Bulk Order',
          name: br.name || 'Brand Buyer',
          email: br.email || '-',
          phone: br.phone || '-',
          details: `Brands: ${br.brands || 'All'} - ${br.message ? `"${br.message.slice(0, 40)}..."` : ''}`,
          status: br.status || 'NEW',
          date: br.created_at ? new Date(br.created_at).toLocaleDateString('en-IN') : 'N/A',
        });
      });
    }

    if (type === 'pdf') {
      await exportToPDF({
        filename: `${filenamePrefix}_${Date.now()}`,
        title,
        columns,
        data,
      });
      toast.success(`${title} PDF downloaded!`);
    } else {
      exportToExcel({
        filename: `${filenamePrefix}_${Date.now()}`,
        title,
        columns,
        data,
      });
      toast.success(`${title} Excel downloaded!`);
    }
  };

  const handleExportInventory = async (type: 'pdf' | 'excel') => {
    const columns = [
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Base Price (INR)', key: 'price' },
      { header: 'Fabric GSM', key: 'gsm' },
      { header: 'Colors Available', key: 'colors_count' },
      { header: 'Current Stock', key: 'stock' },
    ];
    const data = inventory.map((p) => ({
      name: p.name,
      category: p.category,
      price: `₹${p.price}`,
      gsm: p.gsm ? `${p.gsm} GSM` : 'Standard',
      colors_count: p.colors ? p.colors.length : 1,
      stock: p.total_stock ?? 150,
    }));

    if (type === 'pdf') {
      await exportToPDF({
        filename: `FunPrint_Inventory_Catalog_${Date.now()}`,
        title: 'Product Catalog & Factory Stock Inventory',
        columns,
        data,
      });
      toast.success('Inventory PDF downloaded!');
    } else {
      exportToExcel({
        filename: `FunPrint_Inventory_Catalog_${Date.now()}`,
        title: 'Inventory Catalog',
        columns,
        data,
      });
      toast.success('Inventory Excel downloaded!');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-50 font-serif text-gray-900 pb-16">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm sm:text-lg font-black text-gray-950 leading-tight">
                FunPrint Control Center
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => loadAllData()}
                disabled={refreshing}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1.5 shadow-xs transition-colors"
                title="Refresh all data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar border-t border-gray-100 text-[10.5px] sm:text-xs font-bold py-1.5 sm:py-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'payments', label: 'Verify Payments', icon: CreditCard, badge: pendingPaymentsCount },
              { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
              { id: 'inventory', label: 'Products & Inventory', icon: Boxes, badge: inventory.length },
              { id: 'customers', label: 'Customers', icon: Users, badge: customers.filter((c) => c.is_active !== false).length },
              {
                id: 'enquiries',
                label: 'Enquiries',
                icon: MessageSquare,
                badge: totalPendingEnquiriesCount,
              },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap flex items-center gap-1 sm:gap-1.5 transition-all text-[10.5px] sm:text-xs ${
                    isActive
                      ? 'bg-gray-950 text-white shadow-xs font-black'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-[#FFC006]' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full font-black ${
                        isActive
                          ? 'bg-[#FFC006] text-gray-950'
                          : 'bg-amber-100 text-amber-950 border border-amber-200'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5 sm:space-y-6">
              {/* Top Overview Header & Export */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div>
                  <h2 className="text-sm sm:text-xl font-black text-gray-950">Executive Overview &amp; Store Performance</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleExportDashboard('pdf')}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 transition-colors"
                    title="Download Executive Dashboard PDF with FunPrint Logo & Header"
                  >
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleExportDashboard('excel')}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 transition-colors"
                    title="Download Executive Dashboard Excel with FunPrint Header"
                  >
                    <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div
                  onClick={() => {
                    setPaymentFilter('confirmed');
                    setActiveTab('payments');
                  }}
                  className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-3xl border border-gray-200/90 shadow-xs cursor-pointer hover:border-gray-300 transition-all"
                  title="View Verified Bank Payments"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    <span>Verified Revenue</span>
                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                  </div>
                  <p className="text-base sm:text-2xl font-black text-gray-950">
                    ₹{Number(analytics?.overview?.totalRevenue || analytics?.totalSales || 499).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9.5px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1">
                    {orders.filter((o) => o.payment_status === 'CONFIRMED').length} paid • Bank confirmed
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-3xl border border-gray-200/90 shadow-xs cursor-pointer hover:border-gray-300 transition-all"
                  title="View All Store Orders"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    <span>Total Orders</span>
                    <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  </div>
                  <p className="text-base sm:text-2xl font-black text-gray-950">
                    {orders.length}
                  </p>
                  <p className="text-[9.5px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1">
                    {orders.filter((o) => o.payment_status === 'CONFIRMED').length} Paid • {orders.filter((o) => o.payment_status !== 'CONFIRMED').length} Pending
                  </p>
                </div>

                <div
                  onClick={() => {
                    setPaymentFilter('pending');
                    setActiveTab('payments');
                  }}
                  className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-3xl border border-gray-200/90 shadow-xs cursor-pointer hover:border-amber-300 transition-all"
                  title="View Pending Payment Verifications"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    <span>Pending UPI Check</span>
                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                  </div>
                  <p className="text-base sm:text-2xl font-black text-amber-600">
                    {pendingUpiCount}
                  </p>
                  <p className="text-[9.5px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1">
                    {pendingUpiCount} UPI check • {pendingCodCount} COD pending
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('analytics')}
                  className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-3xl border border-gray-200/90 shadow-xs cursor-pointer hover:border-emerald-300 transition-all"
                  title="Open Vercel Telemetry & Web Analytics"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    <span>Visitors (7 Days)</span>
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-base sm:text-2xl font-black text-emerald-600">
                    {analytics?.vercelWebAnalytics?.status === 'ok'
                      ? (analytics.vercelWebAnalytics.overview?.visitors ?? 0)
                      : '—'}
                  </p>
                  <p className="text-[9.5px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1">
                    {analytics?.vercelWebAnalytics?.status === 'ok'
                      ? `${analytics.vercelWebAnalytics.overview?.pageViews ?? 0} Page Views • Vercel`
                      : analytics?.vercelWebAnalytics?.status === 'token_missing'
                      ? 'Token required • Vercel'
                      : analytics?.vercelWebAnalytics?.status === 'unauthorized'
                      ? 'Auth required • Vercel'
                      : 'Unavailable • Vercel'}
                  </p>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                {/* Pending UPI & COD Verifications quick box */}
                <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-3xl border border-gray-200/90 p-3 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-extrabold text-xs sm:text-base text-gray-950 flex items-center gap-1.5 sm:gap-2">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      <span>Pending Payment Verifications</span>
                    </h3>
                    <button
                      onClick={() => {
                        setPaymentFilter('pending');
                        setActiveTab('payments');
                      }}
                      className="text-[11px] sm:text-xs font-bold text-amber-700 hover:underline"
                    >
                      View All ({pendingPaymentsCount})
                    </button>
                  </div>

                  {pendingPaymentsList.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-xs text-gray-500">
                      <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
                      All submitted customer payments have been processed!
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {pendingPaymentsList.slice(0, 5).map((p) => {
                        const isCod = (p.payment_method || '').toUpperCase().includes('COD');
                        return (
                          <div key={p.id} className="py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-gray-950">{p.order_id}</span>
                                <span className="font-black text-gray-900">₹{p.amount}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                  isCod ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                                }`}>
                                  {isCod ? 'COD Doorstep' : 'Manual UPI'}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-gray-500">
                                Customer: <span className="font-semibold text-gray-800">{p.customer_name || p.payer_name || 'Customer'}</span> ({p.customer_phone || p.payer_phone || 'No phone'})
                                {!isCod && p.transaction_ref && (
                                  <> • UTR: <span className="font-mono font-bold text-gray-900">{p.transaction_ref}</span></>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPaymentModal({ isOpen: true, mode: 'confirm', payment: p })}
                                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold rounded-full text-[10px] sm:text-xs shadow-xs border border-amber-400/60 transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentModal({ isOpen: true, mode: 'reject', payment: p, reason: '' })}
                                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-full text-[10px] sm:text-xs border border-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right side status column */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Inventory Status Card */}
                  <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200/90 p-3 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-950 flex items-center gap-1.5 sm:gap-2">
                        <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                        <span>Inventory Alerts</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="text-[10px] sm:text-[11px] font-bold text-amber-800 hover:underline"
                      >
                        Catalog ({inventory.length})
                      </button>
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                        <p className="text-xs font-black text-emerald-950">All Inventory Healthy</p>
                        <p className="text-[10px] text-emerald-700">All {inventory.length} catalog items are stocked above their low-stock thresholds.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2 text-[10.5px] sm:text-xs">
                        {lowStockProducts.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                            <span className="font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-[160px]">{item.name}</span>
                            <span className="font-mono font-bold text-red-600">
                              {item.total_stock || 0} in stock
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enquiries Summary Card */}
                  <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200/90 p-3 sm:p-5 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-950 flex items-center gap-1.5 sm:gap-2">
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        <span>Enquiries &amp; Leads</span>
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        totalPendingEnquiriesCount > 0
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {totalPendingEnquiriesCount > 0 ? `${totalPendingEnquiriesCount} Pending` : 'All Resolved'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                      <div className="p-2 rounded-xl bg-stone-50/80 border border-gray-100">
                        <span className="text-gray-500 block text-[9.5px]">Retail Custom</span>
                        <span className="font-black text-gray-950">
                          {pendingRetailCount} pending <span className="text-gray-400 font-normal">/ {retailEnquiries.length}</span>
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50/80 border border-gray-100">
                        <span className="text-gray-500 block text-[9.5px]">Factory Bulk</span>
                        <span className="font-black text-gray-950">
                          {pendingBulkCount} pending <span className="text-gray-400 font-normal">/ {bulkEnquiries.length}</span>
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50/80 border border-gray-100">
                        <span className="text-gray-500 block text-[9.5px]">Brand Collab</span>
                        <span className="font-black text-gray-950">
                          {pendingBrandCount} pending <span className="text-gray-400 font-normal">/ {brandEnquiries.length}</span>
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50/80 border border-gray-100">
                        <span className="text-gray-500 block text-[9.5px]">General Contact</span>
                        <span className="font-black text-gray-950">
                          {pendingContactCount} pending <span className="text-gray-400 font-normal">/ {contactEnquiries.length}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="w-full py-1.5 sm:py-2 bg-stone-50 hover:bg-stone-100 border border-gray-200 text-gray-900 font-bold text-[10.5px] sm:text-xs rounded-full transition-colors shadow-2xs"
                    >
                      Manage Enquiries ({totalEnquiriesCount})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL WEB ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Vercel Header Bar */}
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-gray-950">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                  <a
                    href="https://funprints.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-gray-950 hover:text-blue-600 transition"
                  >
                    <span>funprints.vercel.app</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    1 online
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-stone-100 text-gray-700 border border-gray-200">
                    Production
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-stone-100 p-0.5 rounded-full border border-gray-200">
                    {['today', '7d', '30d'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1 rounded-full uppercase transition-all ${
                          analyticsRange === r
                            ? 'bg-gray-950 text-white font-black shadow-xs'
                            : 'text-gray-600 hover:text-gray-950'
                        }`}
                      >
                        {r === '7d' ? 'Last 7 Days' : r}
                      </button>
                    ))}
                  </div>

                  {analyticsLastSynced && (
                    <span className="text-[11px] text-gray-400 font-medium hidden md:inline">
                      Synced {analyticsLastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}

                  <button
                    onClick={loadAllData}
                    disabled={refreshing}
                    className="px-3.5 py-1.5 rounded-full bg-gray-950 text-white hover:bg-gray-800 text-xs font-black flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                    title="Synchronize Live with Vercel Web Analytics"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Sync Live</span>
                  </button>
                </div>
              </div>

              {/* Vercel Web Analytics Top KPI Tabs & Trend Area Chart */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                {/* Diagnostic Status Banners */}
                {analytics?.vercelWebAnalytics?.status === 'token_missing' && (
                  <div className="p-3 sm:p-4 bg-amber-50/90 border-b border-amber-200 text-amber-950 flex items-start gap-2.5 sm:gap-3 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-amber-950 text-xs sm:text-[13px]">Vercel Web Analytics API Token Not Configured</p>
                      <p className="text-amber-800 leading-relaxed text-[11px] sm:text-xs">
                        To query official Vercel Web Analytics in this admin dashboard, configure <code className="font-mono bg-amber-100/90 px-1.5 py-0.5 rounded font-bold text-amber-950">VERCEL_API_TOKEN</code> in your server environment variables. Project ID: <code className="font-mono bg-amber-100/90 px-1 py-0.5 rounded text-[10.5px]">prj_lEB0bm4c3VRX7YTfgSeM3iIsAUZa</code>.
                      </p>
                    </div>
                  </div>
                )}
                {analytics?.vercelWebAnalytics?.status === 'unauthorized' && (
                  <div className="p-3 sm:p-4 bg-rose-50/90 border-b border-rose-200 text-rose-950 flex items-start gap-2.5 sm:gap-3 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-rose-950 text-xs sm:text-[13px]">Vercel API Authentication Failed (401 / 403)</p>
                      <p className="text-rose-800 leading-relaxed text-[11px] sm:text-xs">
                        The configured Vercel API token is expired, invalid, or unauthorized for project <code className="font-mono bg-rose-100/90 px-1.5 py-0.5 rounded font-bold text-rose-950">prj_lEB0bm4c3VRX7YTfgSeM3iIsAUZa</code>. Verify your Personal Access Token in Vercel settings.
                      </p>
                    </div>
                  </div>
                )}
                {analytics?.vercelWebAnalytics?.status === 'error' && (
                  <div className="p-3 sm:p-4 bg-rose-50/90 border-b border-rose-200 text-rose-950 flex items-start gap-2.5 sm:gap-3 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-rose-950 text-xs sm:text-[13px]">Upstream Vercel Analytics API Error</p>
                      <p className="text-rose-800 leading-relaxed text-[11px] sm:text-xs">
                        {analytics?.vercelWebAnalytics?.message || 'Unable to fetch telemetry from api.vercel.com. Please retry.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metric Tabs */}
                <div className="grid grid-cols-2 border-b border-gray-200 bg-white">
                  <button
                    onClick={() => setAnalyticsMetricTab('visitors')}
                    className={`p-3.5 sm:p-5 text-left transition-colors border-b-2 ${
                      analyticsMetricTab === 'visitors'
                        ? 'border-gray-950 bg-stone-50/70'
                        : 'border-transparent hover:bg-stone-50/40'
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Visitors</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-xl sm:text-3xl font-black text-gray-950 mt-1">
                        {analytics?.vercelWebAnalytics?.status === 'ok'
                          ? (analytics.vercelWebAnalytics.overview?.visitors ?? 0)
                          : '—'}
                      </p>
                      {analytics?.vercelWebAnalytics?.status && analytics.vercelWebAnalytics.status !== 'ok' && (
                        <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                          {analytics.vercelWebAnalytics.status === 'token_missing' ? 'Token required' : 'Auth required'}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setAnalyticsMetricTab('views')}
                    className={`p-3.5 sm:p-5 text-left transition-colors border-b-2 border-l border-gray-200 ${
                      analyticsMetricTab === 'views'
                        ? 'border-gray-950 bg-stone-50/70'
                        : 'border-transparent hover:bg-stone-50/40'
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Page Views</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-xl sm:text-3xl font-black text-gray-950 mt-1">
                        {analytics?.vercelWebAnalytics?.status === 'ok'
                          ? (analytics.vercelWebAnalytics.overview?.pageViews ?? 0)
                          : '—'}
                      </p>
                      {analytics?.vercelWebAnalytics?.status && analytics.vercelWebAnalytics.status !== 'ok' && (
                        <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                          {analytics.vercelWebAnalytics.status === 'token_missing' ? 'Token required' : 'Auth required'}
                        </span>
                      )}
                    </div>
                  </button>
                </div>

                {/* Recharts Area / Line Chart with Clean White Theme */}
                <div className="p-4 sm:p-6 space-y-2 bg-white">
                  {(() => {
                    const timeseries = analytics?.vercelWebAnalytics?.timeseries || [];

                    if (!chartMounted || loading) {
                      return (
                        <div className="w-full h-48 sm:h-56 bg-stone-50 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-400">
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                            Loading live telemetry...
                          </span>
                        </div>
                      );
                    }

                    if (timeseries.length === 0) {
                      const vStatus = analytics?.vercelWebAnalytics?.status;
                      if (vStatus === 'token_missing') {
                        return (
                          <div className="w-full h-48 sm:h-56 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-stone-50/60 border border-gray-200/60 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-700">
                              <KeyRound className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-gray-950">Vercel Web Analytics Token Required</h4>
                            <p className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                              Configure <code className="font-mono bg-stone-100 text-gray-900 px-1 py-0.5 rounded font-semibold text-[10px]">VERCEL_API_TOKEN</code> in your server environment to stream live production traffic metrics.
                            </p>
                          </div>
                        );
                      }
                      if (vStatus === 'unauthorized') {
                        return (
                          <div className="w-full h-48 sm:h-56 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-rose-50/40 border border-rose-200/60 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-gray-950">Vercel API Authentication Failed</h4>
                            <p className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                              The configured token was rejected by Vercel with status 401/403. Check personal access token permissions for project <code className="font-mono text-[10px]">prj_lEB0bm4c3VRX7YTfgSeM3iIsAUZa</code>.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="w-full h-48 sm:h-56 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4 space-y-1">
                          <p className="font-semibold text-gray-700">Zero visits recorded for this period</p>
                          <p className="text-[11px] text-gray-400">Live telemetry will appear here as users browse the production store.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="w-full h-48 sm:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={timeseries}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="analyticsBlueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0070F3" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#0070F3" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis
                              dataKey="date"
                              stroke="#9CA3AF"
                              fontSize={11}
                              tickLine={false}
                              axisLine={{ stroke: '#E5E7EB' }}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-gray-200 shadow-md text-xs space-y-1.5 z-50">
                                      <p className="font-black text-gray-950 border-b border-gray-100 pb-1">{label}</p>
                                      {payload.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-gray-600 font-medium">{item.name}:</span>
                                          </div>
                                          <span className="font-black text-gray-950">{item.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            {analyticsMetricTab === 'visitors' && (
                              <Area
                                type="monotone"
                                dataKey="visitors"
                                name="Visitors"
                                stroke="#0070F3"
                                strokeWidth={2.5}
                                fill="url(#analyticsBlueGrad)"
                                activeDot={{ r: 5, fill: '#0070F3', stroke: '#ffffff', strokeWidth: 2 }}
                              />
                            )}
                            {analyticsMetricTab === 'views' && (
                              <Area
                                type="monotone"
                                dataKey="views"
                                name="Page Views"
                                stroke="#0070F3"
                                strokeWidth={2.5}
                                fill="url(#analyticsBlueGrad)"
                                activeDot={{ r: 5, fill: '#0070F3', stroke: '#ffffff', strokeWidth: 2 }}
                              />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Two Column Layout: Pages / Routes / Hostnames and Referrers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Card 1: Pages / Routes / Hostnames */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {(['pages', 'routes', 'hostnames'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setPagesTab(tab)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                            pagesTab === tab
                              ? 'bg-gray-950 text-white shadow-2xs'
                              : 'text-gray-600 hover:text-gray-950'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Page Views</span>
                      <span>Visitors</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {pagesTab === 'pages' && (
                      (analytics?.vercelWebAnalytics?.pages && analytics.vercelWebAnalytics.pages.length > 0) ? (
                        analytics.vercelWebAnalytics.pages.map((item: any, idx: number) => (
                          <div key={idx} className="relative overflow-hidden p-2.5 rounded-xl bg-stone-50/70 border border-gray-200/80 hover:bg-stone-100/70 transition">
                            <div
                              className="absolute inset-y-0 left-0 bg-blue-100/70 rounded-xl transition-all"
                              style={{ width: `${item.pct || 0}%` }}
                            />
                            <div className="relative flex items-center justify-between gap-2">
                              <span className="font-mono text-gray-900 truncate font-semibold">{item.path}</span>
                              <div className="flex items-center gap-6 shrink-0 font-bold">
                                <span className="text-gray-400 text-[11px] w-6 text-right">{item.pct || 0}%</span>
                                <span className="text-gray-950 w-6 text-right font-black">{item.views}</span>
                                <span className="text-gray-600 w-6 text-right">{item.visitors}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-xs font-medium">No page visits recorded for this period.</p>
                      )
                    )}

                    {pagesTab === 'routes' && (
                      (analytics?.vercelWebAnalytics?.routes && analytics.vercelWebAnalytics.routes.length > 0) ? (
                        analytics.vercelWebAnalytics.routes.map((item: any, idx: number) => (
                          <div key={idx} className="relative overflow-hidden p-2.5 rounded-xl bg-stone-50/70 border border-gray-200/80 hover:bg-stone-100/70 transition">
                            <div
                              className="absolute inset-y-0 left-0 bg-blue-100/70 rounded-xl transition-all"
                              style={{ width: `${item.pct || 0}%` }}
                            />
                            <div className="relative flex items-center justify-between gap-2">
                              <span className="font-mono text-gray-900 truncate font-semibold">{item.route}</span>
                              <div className="flex items-center gap-6 shrink-0 font-bold">
                                <span className="text-gray-400 text-[11px] w-6 text-right">{item.pct || 0}%</span>
                                <span className="text-gray-950 w-6 text-right font-black">{item.views}</span>
                                <span className="text-gray-600 w-6 text-right">{item.visitors}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-xs font-medium">No route visits recorded for this period.</p>
                      )
                    )}

                    {pagesTab === 'hostnames' && (
                      (analytics?.vercelWebAnalytics?.hostnames && analytics.vercelWebAnalytics.hostnames.length > 0) ? (
                        analytics.vercelWebAnalytics.hostnames.map((item: any, idx: number) => (
                          <div key={idx} className="relative overflow-hidden p-3 rounded-xl bg-stone-50/70 border border-gray-200/80">
                            <div className="absolute inset-y-0 left-0 bg-blue-100/70 rounded-xl" style={{ width: `${item.pct || 100}%` }} />
                            <div className="relative flex items-center justify-between gap-2">
                              <span className="font-mono text-gray-900 font-semibold">{item.hostname}</span>
                              <div className="flex items-center gap-6 shrink-0 font-bold">
                                <span className="text-gray-400 text-[11px]">{item.pct || 100}%</span>
                                <span className="text-gray-950 font-black">{item.views}</span>
                                <span className="text-gray-600">{item.visitors}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-xs font-medium">No hostname telemetry recorded.</p>
                      )
                    )}
                  </div>
                </div>

                {/* Card 2: Referrers */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">Referrers</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Views</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {(analytics?.vercelWebAnalytics?.referrers && analytics.vercelWebAnalytics.referrers.length > 0) ? (
                      analytics.vercelWebAnalytics.referrers.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-stone-50/70 border border-gray-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-gray-900 font-semibold">{item.referrer}</span>
                          </div>
                          <div className="flex items-center gap-3 font-bold">
                            {item.pct !== undefined && <span className="text-gray-400 text-[11px]">{item.pct}%</span>}
                            <span className="font-black text-gray-950">{item.views}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8 text-xs font-medium">No referrers recorded for this period.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Three Column Breakdown: Countries, Devices/Browsers & Operating Systems */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Countries Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">Countries</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Views</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(analytics?.vercelWebAnalytics?.countries && analytics.vercelWebAnalytics.countries.length > 0) ? (
                      analytics.vercelWebAnalytics.countries.map((c: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-stone-50/70 border border-gray-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{c.flag || '🌐'}</span>
                            <span className="font-bold text-gray-900">{c.country}</span>
                          </div>
                          <div className="flex items-center gap-3 font-bold">
                            <span className="text-[10px] text-gray-400">{c.pct || 0}%</span>
                            <span className="text-gray-950 font-black">{c.views}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-6 text-xs font-medium">No country telemetry recorded.</p>
                    )}
                  </div>
                </div>

                {/* Devices & Browsers Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTechTab('devices')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          techTab === 'devices' ? 'text-gray-950 border-b-2 border-gray-950' : 'text-gray-400 hover:text-gray-950'
                        }`}
                      >
                        Devices
                      </button>
                      <button
                        onClick={() => setTechTab('browsers')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          techTab === 'browsers' ? 'text-gray-950 border-b-2 border-gray-950' : 'text-gray-400 hover:text-gray-950'
                        }`}
                      >
                        Browsers
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Views</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {techTab === 'devices' ? (
                      (analytics?.vercelWebAnalytics?.devices && analytics.vercelWebAnalytics.devices.length > 0) ? (
                        analytics.vercelWebAnalytics.devices.map((d: any, i: number) => (
                          <div key={i} className="p-2 rounded-xl bg-stone-50/70 border border-gray-200/80 flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{d.device || d.name}</span>
                            <div className="flex items-center gap-2.5 font-bold">
                              <span className="text-[10px] text-gray-400">{d.pct || 0}%</span>
                              <span className="text-gray-950 font-black">{d.views}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-xs font-medium">No device telemetry recorded.</p>
                      )
                    ) : (
                      (analytics?.vercelWebAnalytics?.browsers && analytics.vercelWebAnalytics.browsers.length > 0) ? (
                        analytics.vercelWebAnalytics.browsers.map((b: any, i: number) => (
                          <div key={i} className="p-1.5 px-2 rounded-lg bg-stone-50/70 border border-gray-200/60 flex items-center justify-between text-[11px]">
                            <span className="text-gray-800 truncate max-w-[140px] font-medium">{b.browser || b.name}</span>
                            <div className="flex items-center gap-2 font-bold">
                              <span className="text-[10px] text-gray-400">{b.pct || 0}%</span>
                              <span className="text-gray-950 font-black">{b.views}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-6 text-xs font-medium">No browser telemetry recorded.</p>
                      )
                    )}
                  </div>
                </div>

                {/* Operating Systems Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider">Operating Systems</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Views</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {(analytics?.vercelWebAnalytics?.operatingSystems && analytics.vercelWebAnalytics.operatingSystems.length > 0) ? (
                      analytics.vercelWebAnalytics.operatingSystems.map((os: any, i: number) => (
                        <div key={i} className="p-1.5 px-2.5 rounded-xl bg-stone-50/70 border border-gray-200/80 flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-900">{os.os || os.name}</span>
                          <div className="flex items-center gap-2.5 font-bold">
                            <span className="text-[10px] text-gray-400">{os.pct || 0}%</span>
                            <span className="text-gray-950 font-black">{os.views}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-6 text-xs font-medium">No OS telemetry recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* TAB 4: VERIFY PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {/* Header & Export Toolbar */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-xl font-black text-gray-950">Customer Payments &amp; Orders Verification (COD &amp; UPI)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review and verify customer payments (Manual UPI &amp; Cash on Delivery). Orders transition to <strong>CONFIRMED</strong> once verified by admin.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => handleExportPayments('pdf')}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-stone-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-2xs flex items-center gap-1.5 transition-colors"
                    title="Export Filtered Payments to PDF"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleExportPayments('excel')}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-stone-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-2xs flex items-center gap-1.5 transition-colors"
                    title="Export Filtered Payments to Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    onClick={loadAllData}
                    disabled={refreshing}
                    className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gray-950 text-white hover:bg-gray-800 text-[10.5px] sm:text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* Summary Counts Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div
                  onClick={() => setPaymentFilter('all')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    paymentFilter === 'all'
                      ? 'bg-stone-50/90 border-gray-900 shadow-xs'
                      : 'bg-white border-gray-200 shadow-2xs hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-gray-500 text-[10.5px] sm:text-xs font-bold mb-1">
                    <span>Total Payments</span>
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-gray-950">{totalPaymentsCount}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                    {upiPaymentsCount} UPI • {codPaymentsCount} COD records
                  </p>
                </div>

                <div
                  onClick={() => setPaymentFilter('pending')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    paymentFilter === 'pending'
                      ? 'bg-amber-50/90 border-amber-600 shadow-xs'
                      : 'bg-white border-gray-200 shadow-2xs hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-amber-800 text-[10.5px] sm:text-xs font-bold mb-1">
                    <span>Pending Action</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-amber-700">{pendingPaymentsCount}</p>
                  <p className="text-[10px] sm:text-[11px] text-amber-800 mt-0.5">
                    {pendingUpiCount} UPI checks • {pendingCodCount} COD pending
                  </p>
                </div>

                <div
                  onClick={() => setPaymentFilter('confirmed')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    paymentFilter === 'confirmed'
                      ? 'bg-emerald-50/90 border-emerald-600 shadow-xs'
                      : 'bg-white border-gray-200 shadow-2xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-emerald-800 text-[10.5px] sm:text-xs font-bold mb-1">
                    <span>Verified &amp; Confirmed</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-emerald-700">{confirmedPaymentsCount}</p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 mt-0.5">
                    Bank verified revenue
                  </p>
                </div>

                <div
                  onClick={() => setPaymentFilter('rejected')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                    paymentFilter === 'rejected'
                      ? 'bg-red-50/90 border-red-600 shadow-xs'
                      : 'bg-white border-gray-200 shadow-2xs hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-red-800 text-[10.5px] sm:text-xs font-bold mb-1">
                    <span>Rejected</span>
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-red-700">{rejectedPaymentsCount}</p>
                  <p className="text-[10px] sm:text-[11px] text-red-800 mt-0.5">
                    Discrepancy / cancelled
                  </p>
                </div>
              </div>

              {/* Search & Filter Controls Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-3 sm:p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Order ID, customer, phone, UTR ref, method..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50/70 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-gray-900 transition"
                    />
                    {paymentSearch && (
                      <button
                        onClick={() => setPaymentSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {[
                      { id: 'all', label: 'All', count: totalPaymentsCount },
                      { id: 'pending', label: 'Pending Action', count: pendingPaymentsCount },
                      { id: 'confirmed', label: 'Confirmed', count: confirmedPaymentsCount },
                      { id: 'rejected', label: 'Rejected', count: rejectedPaymentsCount },
                      { id: 'upi', label: 'Manual UPI', count: upiPaymentsCount },
                      { id: 'cod', label: 'COD', count: codPaymentsCount },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          paymentFilter === tab.id
                            ? 'bg-gray-950 text-white font-black shadow-xs'
                            : 'bg-stone-100 text-gray-600 hover:text-gray-950 hover:bg-stone-200/70'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          paymentFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto pt-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                        <th className="pb-2">Order ID</th>
                        <th className="pb-2">Payment Method</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Customer &amp; Phone</th>
                        <th className="pb-2">Bank UTR / Collection Ref</th>
                        <th className="pb-2">Verification Status</th>
                        <th className="pb-2">Submitted At</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400 space-y-1">
                            <p className="font-semibold text-gray-600 text-xs">No payment records match the current filter or search criteria.</p>
                            {(paymentSearch || paymentFilter !== 'all') && (
                              <button
                                onClick={() => {
                                  setPaymentSearch('');
                                  setPaymentFilter('all');
                                }}
                                className="text-blue-600 font-bold hover:underline text-xs"
                              >
                                Reset search and filters
                              </button>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => {
                          const isCod = (p.payment_method || '').toUpperCase().includes('COD');
                          const isVerified = p.payment_status === 'CONFIRMED' || p.payment_status === 'VERIFIED' || p.status === 'VERIFIED';
                          const isRejected = p.payment_status === 'REJECTED' || p.status === 'REJECTED';
                          const customerName = p.customer_name || p.payer_name || 'N/A';
                          const customerPhone = p.customer_phone || p.payer_phone || 'N/A';
                          const utr = p.transaction_ref || p.transaction_reference || (isCod ? `COD-${p.order_id}` : 'N/A');
                          const formattedAmount = `₹${Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          const submittedAt = p.payment_date || p.created_at
                            ? new Date(p.payment_date || p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                            : 'N/A';

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-2 font-mono font-bold text-gray-950 whitespace-nowrap">{p.order_id}</td>
                              <td className="py-3 px-2">
                                {isCod ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                      Cash on Delivery (COD)
                                    </span>
                                    <p className="text-[9.5px] text-blue-700 font-medium mt-0.5">Pay cash or UPI upon package handover at your doorstep</p>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                      Manual UPI Payment
                                    </span>
                                    <p className="text-[9.5px] text-purple-700 font-medium mt-0.5">Direct Scan &amp; Pay</p>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-2 font-black text-gray-950 whitespace-nowrap">{formattedAmount}</td>
                              <td className="py-3 px-2">
                                <p className="font-semibold text-gray-900 leading-tight">{customerName}</p>
                                <p className="text-[11px] text-gray-500 font-mono">{customerPhone}</p>
                                {!isCod && p.payer_name && (
                                  <p className="text-[10px] text-purple-700 font-medium mt-0.5">
                                    UPI: {p.payer_name} {p.payer_phone ? `• ${p.payer_phone}` : ''}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                {isCod ? (
                                  <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs inline-block">
                                    COD Doorstep Collection
                                  </span>
                                ) : (
                                  <span className="font-mono font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-xs inline-block">
                                    {utr}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isVerified
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : isRejected
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : 'bg-amber-100 text-amber-950 border border-amber-200'
                                  }`}
                                >
                                  {isVerified ? 'Verified & Confirmed' : isRejected ? 'Rejected' : isCod ? 'Pending Collection' : 'Pending Verification'}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-gray-500 font-sans text-xs whitespace-nowrap">
                                {submittedAt}
                              </td>
                              <td className="py-3 px-2 text-right whitespace-nowrap">
                                {!isVerified && !isRejected ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setPaymentModal({ isOpen: true, mode: 'confirm', payment: p })}
                                      className="px-3 py-1 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-full text-xs shadow-xs border border-amber-400/60 transition-all"
                                    >
                                      Verify Payment
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPaymentModal({ isOpen: true, mode: 'reject', payment: p, reason: '' })}
                                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-full text-xs border border-red-200 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                                    <XCircle className="w-3 h-3 text-red-600" />
                                    Rejected
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="block sm:hidden space-y-3 pt-1">
                  {filteredPayments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 space-y-1">
                      <p className="font-semibold text-gray-600">No payment records match the current filter or search criteria.</p>
                      {(paymentSearch || paymentFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setPaymentSearch('');
                            setPaymentFilter('all');
                          }}
                          className="text-blue-600 font-bold hover:underline text-xs"
                        >
                          Reset search and filters
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredPayments.map((p) => {
                      const isCod = (p.payment_method || '').toUpperCase().includes('COD');
                      const isVerified = p.payment_status === 'CONFIRMED' || p.payment_status === 'VERIFIED' || p.status === 'VERIFIED';
                      const isRejected = p.payment_status === 'REJECTED' || p.status === 'REJECTED';
                      const customerName = p.customer_name || p.payer_name || 'N/A';
                      const customerPhone = p.customer_phone || p.payer_phone || 'N/A';
                      const utr = p.transaction_ref || p.transaction_reference || (isCod ? `COD-${p.order_id}` : 'N/A');
                      const formattedAmount = `₹${Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                      const submittedAt = p.payment_date || p.created_at
                        ? new Date(p.payment_date || p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'N/A';

                      return (
                        <div key={p.id} className="p-3.5 bg-stone-50/70 border border-gray-200 rounded-2xl shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                            <div>
                              <span className="font-mono font-bold text-xs text-gray-950 block">{p.order_id}</span>
                              <span className="text-[10px] text-gray-400">{submittedAt}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-sm text-gray-950 block">{formattedAmount}</span>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isRejected
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-amber-100 text-amber-950 border border-amber-200'
                                }`}
                              >
                                {isVerified ? 'Verified' : isRejected ? 'Rejected' : isCod ? 'Pending Collection' : 'Pending Verification'}
                              </span>
                            </div>
                          </div>

                          {/* Payment Method Badge */}
                          <div>
                            {isCod ? (
                              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-2 space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                  Cash on Delivery (COD)
                                </span>
                                <p className="text-[10px] text-blue-700 font-medium">
                                  Pay cash or UPI upon package handover at your doorstep
                                </p>
                              </div>
                            ) : (
                              <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-2 space-y-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                  Manual UPI Payment
                                </span>
                                <p className="text-[10px] text-purple-700 font-medium">
                                  Direct Scan &amp; Pay
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-gray-900 leading-tight">{customerName}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{customerPhone}</p>
                            {!isCod && p.payer_name && (
                              <p className="text-[10.5px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block">
                                UPI: {p.payer_name} {p.payer_phone ? `• ${p.payer_phone}` : ''}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs">
                            <span className="text-gray-500 font-semibold text-[10px] uppercase">
                              {isCod ? 'Collection Ref:' : 'Bank UTR / Ref:'}
                            </span>
                            <span className="font-mono font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-[11px]">
                              {utr}
                            </span>
                          </div>

                          <div className="pt-1">
                            {!isVerified && !isRejected ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPaymentModal({ isOpen: true, mode: 'confirm', payment: p })}
                                  className="w-full py-2 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-xl text-xs shadow-xs border border-amber-400/60 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-950" />
                                  <span>Verify Payment</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPaymentModal({ isOpen: true, mode: 'reject', payment: p, reason: '' })}
                                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : isVerified ? (
                              <div className="w-full py-1.5 bg-emerald-50 rounded-xl text-center font-bold text-emerald-800 text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Order &amp; Payment Verified</span>
                              </div>
                            ) : (
                              <div className="w-full py-1.5 bg-red-50 rounded-xl text-center font-bold text-red-800 text-xs flex items-center justify-center gap-1.5 border border-red-200">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span>Payment Rejected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200 p-3 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm sm:text-lg font-black text-gray-950">Customer Orders ({orders.length})</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search order or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-56 pl-7 sm:pl-8 pr-3 py-1 sm:py-1.5 rounded-full border border-gray-300 text-[10px] sm:text-xs focus:outline-none focus:border-[#FFC006]"
                    />
                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 absolute left-2.5 top-2 sm:top-2.5" />
                  </div>

                  <button
                    onClick={() => handleExportOrders('pdf')}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 transition-colors"
                    title="Download Customer Orders PDF with FunPrint Header"
                  >
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleExportOrders('excel')}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 transition-colors"
                    title="Download Customer Orders Excel with FunPrint Header"
                  >
                    <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-[10px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase text-[9px] sm:text-[10px]">
                      <th className="pb-1.5 sm:pb-2">Order ID</th>
                      <th className="pb-1.5 sm:pb-2">Customer</th>
                      <th className="pb-1.5 sm:pb-2">Amount</th>
                      <th className="pb-1.5 sm:pb-2">Payment</th>
                      <th className="pb-1.5 sm:pb-2">Order Status</th>
                      <th className="pb-1.5 sm:pb-2">Tracking</th>
                      <th className="pb-1.5 sm:pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders
                      .filter(
                        (o) =>
                          !searchTerm ||
                          o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((o) => (
                        <tr key={o.id}>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 font-mono font-bold text-gray-950 whitespace-nowrap">{o.id}</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2">
                            <p className="font-semibold text-gray-900 leading-tight">{o.customer_name}</p>
                            <p className="text-[9.5px] sm:text-[11px] text-gray-500">{o.customer_email}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 font-extrabold text-gray-950 whitespace-nowrap">₹{o.total_amount}</td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                                o.payment_status === 'VERIFIED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap">
                            {o.order_status === 'DELIVERED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                                Order Delivered
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                {o.order_status}
                              </span>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 font-mono text-[10px] sm:text-[11px] text-gray-600 whitespace-nowrap">
                            {o.tracking_id || <span className="text-gray-400 italic">No AWB yet</span>}
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              {o.order_status === 'DELIVERED' ? (
                                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-emerald-100 text-emerald-900 font-black rounded-full text-[10px] sm:text-xs border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                                  <span>Order Delivered</span>
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkOrderDelivered(o.id)}
                                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-full text-[10px] sm:text-xs shadow-xs flex items-center gap-1 transition-all"
                                    title="Mark Order Delivered Successfully and notify customer via email"
                                  >
                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>Mark Delivered</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTrackingModal(o)}
                                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-full text-[10px] sm:text-xs shadow-xs border border-amber-400/60 transition-all"
                                  >
                                    Update Status
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (Clean & Responsive) */}
              <div className="block sm:hidden space-y-3">
                {orders
                  .filter(
                    (o) =>
                      !searchTerm ||
                      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((o) => (
                    <div key={o.id} className="p-3.5 bg-stone-50/70 border border-gray-200 rounded-2xl shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                        <span className="font-mono font-bold text-xs text-gray-950">{o.id}</span>
                        <span className="font-black text-sm text-gray-950">₹{o.total_amount}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-gray-900 truncate">{o.customer_name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{o.customer_email}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            o.payment_status === 'VERIFIED' || o.payment_status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 font-semibold text-[10px] uppercase">Status:</span>
                          {o.order_status === 'DELIVERED' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Delivered
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              {o.order_status}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-gray-700">
                          AWB: <span className="font-bold text-gray-950">{o.tracking_id || 'None'}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        {o.order_status === 'DELIVERED' ? (
                          <div className="w-full py-2 bg-emerald-100 text-emerald-900 font-black text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Order Delivered Successfully</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleMarkOrderDelivered(o.id)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Delivered</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTrackingModal(o)}
                              className="w-full py-2 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-xl text-xs shadow-xs border border-amber-400/60 transition-all flex items-center justify-center gap-1"
                            >
                              Update Status
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}



          {/* TAB 7: PRODUCTS & INVENTORY WITH IMAGE CARDS */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Top Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 pb-1 sm:pb-2">
                <div>
                  <h2 className="text-sm sm:text-xl font-black text-gray-950">Product Catalog &amp; Inventory Cards</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => handleExportInventory('pdf')}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                    title="Download Product Catalog PDF with FunPrint Header"
                  >
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleExportInventory('excel')}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                    title="Download Product Catalog Excel with FunPrint Header"
                  >
                    <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs">
                {/* Category Pills */}
                <div className="flex gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:py-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-gray-950 text-white shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:flex-initial min-w-[160px] sm:min-w-[200px]">
                  <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 absolute left-2.5 sm:left-3 top-2 sm:top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-7 sm:pl-8 pr-3 py-1 sm:py-1.5 rounded-full border border-gray-200 text-[10px] sm:text-xs focus:border-[#FFC006] outline-none"
                  />
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredInventory.map((p) => {
                  const imageSrc = getProductImage(p);
                  const colorMap = new Map<string, { name: string; hex: string; count: number }>();
                  const sizeMap = new Map<string, { size: string; count: number }>();

                  (p.variants || []).forEach((v: any) => {
                    const cName = v.colorName || v.color;
                    if (cName) {
                      const existing = colorMap.get(cName);
                      if (existing) {
                        existing.count += 1;
                      } else {
                        const hexVal = (v.colorHex && v.colorHex !== '#000000') ? v.colorHex : getColorDisplay(cName);
                        colorMap.set(cName, { name: cName, hex: hexVal, count: 1 });
                      }
                    }
                    const sName = v.size;
                    if (sName) {
                      const existing = sizeMap.get(sName);
                      if (existing) {
                        existing.count += 1;
                      } else {
                        sizeMap.set(sName, { size: sName, count: 1 });
                      }
                    }
                  });

                  const distinctColorsList = Array.from(colorMap.values());
                  const distinctSizesList = Array.from(sizeMap.values());

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                    >
                      <div>
                        {/* Product Image Banner */}
                        <div className="h-40 sm:h-52 bg-stone-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100 group">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={p.name}
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallback = (p.id && PUBLIC_PRODUCT_FRONT_IMAGES[p.id])
                                  ? PUBLIC_PRODUCT_FRONT_IMAGES[p.id]
                                  : '/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg';
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                }
                              }}
                              className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-300">
                              <Package className="w-10 h-10 sm:w-14 sm:h-14 mb-1" />
                              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">Front View Preview</span>
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/90 backdrop-blur-xs text-gray-900 text-[9px] sm:text-[10px] font-black rounded-full border border-gray-200 shadow-xs">
                            {p.category}
                          </span>

                          {/* Visibility Pill Toggle */}
                          <button
                            onClick={() => handleToggleProductVisibility(p.id, p.is_visible)}
                            title="Click to toggle store visibility"
                            className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black rounded-full shadow-xs border flex items-center gap-1 transition-all ${
                              p.is_visible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.is_visible ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            <span>{p.is_visible ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3">
                          {/* Title & Description */}
                          <div>
                            <h3 className="font-black text-sm sm:text-base text-gray-950 leading-tight">
                              {p.name}
                            </h3>
                            <p className="text-[10.5px] sm:text-xs text-gray-500 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed">
                              {p.description || 'Premium custom garment engineered for crisp prints.'}
                            </p>
                          </div>

                          {/* Price Edit Box */}
                          <div className="p-2 sm:p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                Base Price
                              </span>
                              {editingPriceFor === p.id ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs sm:text-sm font-black text-gray-950">₹</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(Number(e.target.value))}
                                    className="w-16 sm:w-20 px-1.5 sm:px-2 py-0.5 border border-[#FFC006] rounded-lg text-xs sm:text-sm font-black outline-none bg-white"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdateProductPrice(p.id, tempPrice)}
                                    className="px-2 sm:px-2.5 py-0.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 rounded-full text-[10px] sm:text-xs font-black shadow-xs"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPriceFor(null)}
                                    className="px-1.5 sm:px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-[10px] sm:text-xs font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span className="text-base sm:text-xl font-black text-gray-950">
                                  ₹{p.price}
                                </span>
                              )}
                            </div>

                            {editingPriceFor !== p.id && (
                              <button
                                onClick={() => {
                                  setEditingPriceFor(p.id);
                                  setTempPrice(Number(p.price));
                                }}
                                className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white hover:bg-gray-50 text-gray-800 font-bold text-[10px] sm:text-xs rounded-full border border-gray-200 shadow-xs flex items-center gap-1 transition-colors"
                              >
                                <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                                <span>Edit Price</span>
                              </button>
                            )}
                          </div>

                          {/* Sizes & Colors Controls inside Product Card */}
                          <div className="space-y-2.5 sm:space-y-3 pt-0.5">
                            {/* Stock Overview */}
                            <div className="flex items-center justify-between text-[10.5px] sm:text-xs text-gray-500 bg-stone-50 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-gray-100">
                              <span className="font-bold">Total Stock:</span>
                              <span className="font-black text-gray-900">{p.total_stock || 0} units</span>
                            </div>

                            {/* COLORS CONTROL ROW */}
                            <div className="p-2 sm:p-3 bg-stone-50/80 rounded-xl sm:rounded-2xl border border-gray-200/80 space-y-1.5 sm:space-y-2">
                              <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-gray-200">
                                <span className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                                  <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                                  <span>Colors ({distinctColorsList.length})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddColorToProduct(p.id)}
                                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 rounded-full text-[9px] sm:text-[10px] font-black shadow-xs flex items-center gap-0.5 sm:gap-1 transition-all"
                                  title="Add new color to this product"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>Add Color</span>
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                                {distinctColorsList.length === 0 ? (
                                  <span className="text-[10px] sm:text-[11px] text-gray-400 italic">No colors added yet</span>
                                ) : (
                                  distinctColorsList.map((c) => {
                                    const isWhite = c.hex.toLowerCase() === '#ffffff' || c.name.toLowerCase().includes('white');
                                    return (
                                      <div
                                        key={c.name}
                                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-gray-900 shadow-2xs hover:border-amber-400 transition-all"
                                      >
                                        <span
                                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 shadow-2xs ${
                                            isWhite ? 'border-2 border-gray-400' : 'border border-gray-300'
                                          }`}
                                          style={{ backgroundColor: c.hex }}
                                          title={`${c.name} (${c.hex})`}
                                        />
                                        <span className="font-semibold text-[10px] sm:text-[11px]">{c.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleEditColor(p.id, c.name, c.hex)}
                                          title={`Edit color "${c.name}"`}
                                          className="p-0.5 text-gray-400 hover:text-amber-600 transition-colors ml-0.5"
                                        >
                                          <Edit className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteColor(p.id, c.name)}
                                          title={`Delete color "${c.name}"`}
                                          className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                          <Trash2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* SIZES CONTROL ROW */}
                            <div className="p-2 sm:p-3 bg-stone-50/80 rounded-xl sm:rounded-2xl border border-gray-200/80 space-y-1.5 sm:space-y-2">
                              <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-gray-200">
                                <span className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
                                  <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                                  <span>Sizes ({distinctSizesList.length})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddSizeToProduct(p.id)}
                                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 rounded-full text-[9px] sm:text-[10px] font-black shadow-xs flex items-center gap-0.5 sm:gap-1 transition-all"
                                  title="Add new size to this product"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>Add Size</span>
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                                {distinctSizesList.length === 0 ? (
                                  <span className="text-[10px] sm:text-[11px] text-gray-400 italic">No sizes added yet</span>
                                ) : (
                                  distinctSizesList.map((s) => (
                                    <div
                                      key={s.size}
                                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-50/90 border border-amber-200/90 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black text-amber-950 shadow-2xs hover:border-amber-400 transition-all"
                                    >
                                      <span className="font-mono text-[10px] sm:text-[11px]">{s.size}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleEditSize(p.id, s.size)}
                                        title={`Edit size "${s.size}"`}
                                        className="p-0.5 text-amber-700 hover:text-amber-950 transition-colors ml-0.5"
                                      >
                                        <Edit className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSize(p.id, s.size)}
                                        title={`Delete size "${s.size}"`}
                                        className="p-0.5 text-amber-700 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expandable Stock / Variant Editor */}
                          {expandedVariantsFor === p.id && (
                            <div className="p-2.5 sm:p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-gray-200 text-[10.5px] sm:text-xs space-y-2 mt-2">
                              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                                <span className="font-black text-gray-900">Variant Stock Controls</span>
                                <button
                                  type="button"
                                  onClick={() => setShowAddVariantModal(p.id)}
                                  className="text-[9.5px] sm:text-[10px] font-black text-amber-800 hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>Add Variant</span>
                                </button>
                              </div>
                              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                                {(p.variants || []).map((v: any) => {
                                  const vHex = (v.colorHex && v.colorHex !== '#000000') ? v.colorHex : getColorDisplay(v.colorName || v.color || '');
                                  const isWhiteVariant = vHex.toLowerCase() === '#ffffff' || (v.colorName && v.colorName.toLowerCase().includes('white'));
                                  return (
                                    <div
                                      key={v.id}
                                      className="flex items-center justify-between py-1 px-2 sm:px-2.5 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-2xs gap-1.5"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                            isWhiteVariant ? 'border-2 border-gray-400' : 'border border-gray-300'
                                          }`}
                                          style={{ backgroundColor: vHex }}
                                          title={`${v.colorName || v.color} (${vHex})`}
                                        />
                                        <span className="font-bold text-gray-800 text-[10px] sm:text-[11px] truncate">
                                          {v.colorName || v.color} - {v.size}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateVariantStock(v.id, (v.stockQuantity || 0) - 1)}
                                          className="w-5 h-5 rounded-full bg-red-50 text-red-700 flex items-center justify-center hover:bg-red-100"
                                        >
                                          <Minus className="w-2.5 h-2.5" />
                                        </button>
                                        <input
                                          type="number"
                                          defaultValue={v.stockQuantity ?? 10}
                                          onBlur={(e) => handleUpdateVariantStock(v.id, parseInt(e.target.value) || 0)}
                                          className="w-10 sm:w-12 text-center font-bold text-[10.5px] sm:text-xs border border-gray-200 rounded py-0.5"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateVariantStock(v.id, (v.stockQuantity || 0) + 1)}
                                          className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100"
                                        >
                                          <Plus className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteVariant(v.id, `${v.colorName || v.color} - ${v.size}`)}
                                          title="Delete this variant"
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-0.5 sm:ml-1"
                                        >
                                          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 sm:p-5 pt-0 border-t border-gray-100 flex flex-wrap gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedVariantsFor(expandedVariantsFor === p.id ? null : p.id)}
                          className="flex-1 py-1 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold rounded-full text-[10px] sm:text-xs transition-colors text-center"
                        >
                          {expandedVariantsFor === p.id ? 'Close Stock' : 'Stock Controls'}
                        </button>

                        <button
                          onClick={() => setEditingProduct(p)}
                          className="flex-1 py-1 sm:py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold rounded-full text-[10px] sm:text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                          <span>Edit</span>
                        </button>

                        <Link
                          href={`/products/${p.id}`}
                          target="_blank"
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-full text-[10px] sm:text-xs shadow-xs border border-amber-400/60 flex items-center justify-center"
                          title="Preview in Store"
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-base font-bold text-gray-800">No products match your filter</p>
                  <p className="text-xs text-gray-500 mt-1">Try resetting the category filter or search term</p>
                </div>
              )}
            </div>
          )}



          {/* TAB 8: CUSTOMERS */}
          {activeTab === 'customers' && (() => {
            const filteredCusts = customers.filter((c) => {
              const q = customerSearch.trim().toLowerCase();
              const matchesSearch =
                !q ||
                (c.full_name && c.full_name.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.phone && String(c.phone).includes(q));

              const matchesStatus =
                customerStatusFilter === 'all'
                  ? true
                  : customerStatusFilter === 'active'
                  ? Boolean(c.is_active)
                  : !c.is_active;

              return matchesSearch && matchesStatus;
            });

            const activeCustCount = customers.filter((c) => c.is_active).length;
            const disabledCustCount = customers.filter((c) => !c.is_active).length;

            return (
              <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200 p-3 sm:p-6 shadow-xs space-y-4">
                {/* Header & Export Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-gray-950">
                      Customer Directory ({customers.length})
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Manage registered FunPrint user accounts, communicate directly, or delete profiles.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleExportCustomers('pdf')}
                      className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                      title="Download Customers PDF with FunPrint Header"
                    >
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => handleExportCustomers('excel')}
                      className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                      title="Download Customers Excel with FunPrint Header"
                    >
                      <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                      <span>Download Excel</span>
                    </button>
                  </div>
                </div>

                {/* Search & Filters Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-stone-50/70 p-2.5 sm:p-3.5 rounded-2xl border border-gray-200/80">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC006]/50 focus:border-amber-400"
                      />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => setCustomerSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Status Filter Pills */}
                    <div className="inline-flex items-center gap-1 bg-white p-0.5 rounded-xl border border-gray-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setCustomerStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          customerStatusFilter === 'all'
                            ? 'bg-gray-950 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-950'
                        }`}
                      >
                        All ({customers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerStatusFilter('active')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          customerStatusFilter === 'active'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-emerald-700'
                        }`}
                      >
                        Active ({activeCustCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerStatusFilter('disabled')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          customerStatusFilter === 'disabled'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-rose-700'
                        }`}
                      >
                        Disabled ({disabledCustCount})
                      </button>
                    </div>

                    {(customerSearch || customerStatusFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerSearch('');
                          setCustomerStatusFilter('all');
                        }}
                        className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline px-1"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                    Showing <span className="text-gray-950 font-black">{filteredCusts.length}</span> of {customers.length} records
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-2.5 px-2">Customer Name</th>
                        <th className="pb-2.5 px-2">Email</th>
                        <th className="pb-2.5 px-2">Phone</th>
                        <th className="pb-2.5 px-2">Registration Date</th>
                        <th className="pb-2.5 px-2">Account Status</th>
                        <th className="pb-2.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCusts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-gray-400">
                            {customers.length === 0
                              ? 'Registered customer records will appear here upon account creation.'
                              : 'No customers found matching your search and filter criteria.'}
                          </td>
                        </tr>
                      ) : (
                        filteredCusts.map((c) => (
                          <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-3 px-2 font-black text-gray-950 whitespace-nowrap">
                              {c.full_name || 'Anonymous User'}
                            </td>
                            <td className="py-3 px-2 text-gray-700 whitespace-nowrap">
                              {c.email || '—'}
                            </td>
                            <td className="py-3 px-2 font-mono whitespace-nowrap text-gray-800">
                              {c.phone || '—'}
                            </td>
                            <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  c.is_active
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {c.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <ContactActions
                                  name={c.full_name || 'Customer'}
                                  phone={c.phone}
                                  email={c.email}
                                  contextMessage={`Hi ${c.full_name || ''}, thank you for contacting FunPrint! How can we assist you with your apparel orders today?`}
                                  compact={false}
                                />
                                <button
                                  type="button"
                                  disabled={deletingCustomerId === c.id}
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Delete Customer Account?',
                                      message: `Are you sure you want to delete ${c.full_name || 'this customer'} (${c.email || 'No email'})? Associated orders, payments, and financial history will remain safely preserved in compliance with store auditing rules.`,
                                      confirmLabel: 'Confirm Delete',
                                      isDestructive: true,
                                      onConfirm: () => handleDeleteCustomer(c.id),
                                    });
                                  }}
                                  title={`Delete customer profile for ${c.full_name}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="block sm:hidden space-y-2.5">
                  {filteredCusts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      {customers.length === 0
                        ? 'Registered customer records will appear here upon account creation.'
                        : 'No customers found matching your search and filter criteria.'}
                    </div>
                  ) : (
                    filteredCusts.map((c) => (
                      <div key={c.id} className="p-3 bg-stone-50/70 border border-gray-200 rounded-2xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-gray-950">{c.full_name || 'Anonymous User'}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                              c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 truncate">{c.email || 'No email provided'}</div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="font-mono text-gray-800">{c.phone || 'No phone'}</span>
                          <span className="text-[10px]">
                            Joined: {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between gap-1.5">
                          <ContactActions
                            name={c.full_name || 'Customer'}
                            phone={c.phone}
                            email={c.email}
                            compact={false}
                          />
                          <button
                            type="button"
                            disabled={deletingCustomerId === c.id}
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Delete Customer Account?',
                                message: `Are you sure you want to delete ${c.full_name || 'this customer'}? Associated order history will be preserved.`,
                                confirmLabel: 'Confirm Delete',
                                isDestructive: true,
                                onConfirm: () => handleDeleteCustomer(c.id),
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10.5px] border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 9: ENQUIRIES — FOUR SEPARATE SECTIONS */}
          {activeTab === 'enquiries' && (() => {
            const retailCounts = {
              total: retailEnquiries.length,
              pending: retailEnquiries.filter((e) => e.status !== 'RESOLVED').length,
              resolved: retailEnquiries.filter((e) => e.status === 'RESOLVED').length,
            };

            const bulkCounts = {
              total: bulkEnquiries.length,
              pending: bulkEnquiries.filter((e) => e.status !== 'RESOLVED').length,
              resolved: bulkEnquiries.filter((e) => e.status === 'RESOLVED').length,
            };

            const brandCounts = {
              total: brandEnquiries.length,
              pending: brandEnquiries.filter((e) => e.status !== 'RESOLVED').length,
              resolved: brandEnquiries.filter((e) => e.status === 'RESOLVED').length,
            };

            const contactCounts = {
              total: contactEnquiries.length,
              pending: contactEnquiries.filter((e) => e.status !== 'RESOLVED').length,
              resolved: contactEnquiries.filter((e) => e.status === 'RESOLVED').length,
            };

            const filterEnquiryList = (items: any[], type: 'retail' | 'bulk' | 'brand' | 'contact') => {
              const q = enquirySearch.trim().toLowerCase();
              return items.filter((item) => {
                const isResolved = item.status === 'RESOLVED';
                if (enquiryStatusFilter === 'pending' && isResolved) return false;
                if (enquiryStatusFilter === 'resolved' && !isResolved) return false;

                if (!q) return true;

                const nameMatch = (item.customer_name || item.contact_name || item.name || '').toLowerCase().includes(q);
                const emailMatch = (item.email || item.customer_email || '').toLowerCase().includes(q);
                const phoneMatch = String(item.phone || item.customer_phone || '').includes(q);
                const idMatch = String(item.id || '').toLowerCase().includes(q);

                if (nameMatch || emailMatch || phoneMatch || idMatch) return true;

                if (type === 'retail') {
                  return (
                    (item.garment_type && item.garment_type.toLowerCase().includes(q)) ||
                    (item.colors && item.colors.toLowerCase().includes(q)) ||
                    (item.instructions && item.instructions.toLowerCase().includes(q))
                  );
                } else if (type === 'bulk') {
                  return (
                    (item.organization && item.organization.toLowerCase().includes(q)) ||
                    (item.fabric_specs && item.fabric_specs.toLowerCase().includes(q)) ||
                    (item.admin_notes && item.admin_notes.toLowerCase().includes(q))
                  );
                } else if (type === 'brand') {
                  return (
                    (item.brands && item.brands.toLowerCase().includes(q)) ||
                    (item.message && item.message.toLowerCase().includes(q))
                  );
                } else if (type === 'contact') {
                  return item.message && item.message.toLowerCase().includes(q);
                }
                return false;
              });
            };

            const filteredRetail = filterEnquiryList(retailEnquiries, 'retail');
            const filteredBulk = filterEnquiryList(bulkEnquiries, 'bulk');
            const filteredBrand = filterEnquiryList(brandEnquiries, 'brand');
            const filteredContact = filterEnquiryList(contactEnquiries, 'contact');

            const currentSubTabCounts =
              enquirySubTab === 'retail'
                ? retailCounts
                : enquirySubTab === 'bulk'
                ? bulkCounts
                : enquirySubTab === 'brand'
                ? brandCounts
                : contactCounts;

            const currentFilteredCount =
              enquirySubTab === 'retail'
                ? filteredRetail.length
                : enquirySubTab === 'bulk'
                ? filteredBulk.length
                : enquirySubTab === 'brand'
                ? filteredBrand.length
                : filteredContact.length;

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* Enquiries Header & Export Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-5 rounded-xl sm:rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-gray-950">
                      Customer Inquiries &amp; Wholesale Requests
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Segmented inquiries divided across retail custom logos, wholesale factory bulk, brand collaborations, and support.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleExportEnquiries('pdf', enquirySubTab)}
                      className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                      title="Download active category PDF with FunPrint Header"
                    >
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => handleExportEnquiries('excel', enquirySubTab)}
                      className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors"
                      title="Download active category Excel with FunPrint Header"
                    >
                      <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                      <span>Download Excel</span>
                    </button>
                  </div>
                </div>

                {/* 4 CLEARLY SEPARATED TABS / SEGMENTED CONTROLS WITH 3 REAL COUNTS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
                  {/* Tab A: Retail Enquiry */}
                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySubTab('retail');
                      setEnquirySearch('');
                      setEnquiryStatusFilter('all');
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                      enquirySubTab === 'retail'
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Retail Enquiry
                      </span>
                      {retailCounts.pending > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-200 text-amber-950 font-black rounded-full text-[9px] animate-pulse">
                          {retailCounts.pending} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-gray-600">Total: <strong className="text-gray-950 font-black">{retailCounts.total}</strong></span>
                      <span className="text-amber-800">Pending: <strong className="font-black">{retailCounts.pending}</strong></span>
                      <span className="text-emerald-700">Resolved: <strong className="font-black">{retailCounts.resolved}</strong></span>
                    </div>
                  </button>

                  {/* Tab B: Factory Direct Bulk Enquiries */}
                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySubTab('bulk');
                      setEnquirySearch('');
                      setEnquiryStatusFilter('all');
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                      enquirySubTab === 'bulk'
                        ? 'bg-purple-500/10 border-purple-400 ring-2 ring-purple-400/40 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-purple-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        Factory Direct Bulk
                      </span>
                      {bulkCounts.pending > 0 && (
                        <span className="px-1.5 py-0.2 bg-purple-200 text-purple-950 font-black rounded-full text-[9px] animate-pulse">
                          {bulkCounts.pending} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-gray-600">Total: <strong className="text-gray-950 font-black">{bulkCounts.total}</strong></span>
                      <span className="text-purple-800">Pending: <strong className="font-black">{bulkCounts.pending}</strong></span>
                      <span className="text-emerald-700">Resolved: <strong className="font-black">{bulkCounts.resolved}</strong></span>
                    </div>
                  </button>

                  {/* Tab C: Brand Collaboration Bulk Enquiries */}
                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySubTab('brand');
                      setEnquirySearch('');
                      setEnquiryStatusFilter('all');
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                      enquirySubTab === 'brand'
                        ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Brand Collaboration
                      </span>
                      {brandCounts.pending > 0 && (
                        <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-950 font-black rounded-full text-[9px] animate-pulse">
                          {brandCounts.pending} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-gray-600">Total: <strong className="text-gray-950 font-black">{brandCounts.total}</strong></span>
                      <span className="text-emerald-800">Pending: <strong className="font-black">{brandCounts.pending}</strong></span>
                      <span className="text-emerald-700">Resolved: <strong className="font-black">{brandCounts.resolved}</strong></span>
                    </div>
                  </button>

                  {/* Tab D: General Contact Submissions */}
                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySubTab('contact');
                      setEnquirySearch('');
                      setEnquiryStatusFilter('all');
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                      enquirySubTab === 'contact'
                        ? 'bg-blue-500/10 border-blue-400 ring-2 ring-blue-400/40 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-blue-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        General Contact
                      </span>
                      {contactCounts.pending > 0 && (
                        <span className="px-1.5 py-0.2 bg-blue-200 text-blue-950 font-black rounded-full text-[9px] animate-pulse">
                          {contactCounts.pending} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-gray-600">Total: <strong className="text-gray-950 font-black">{contactCounts.total}</strong></span>
                      <span className="text-blue-800">Pending: <strong className="font-black">{contactCounts.pending}</strong></span>
                      <span className="text-emerald-700">Resolved: <strong className="font-black">{contactCounts.resolved}</strong></span>
                    </div>
                  </button>
                </div>

                {/* Search & Filter Controls for the Active Tab */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={
                          enquirySubTab === 'retail'
                            ? 'Search retail by customer, garment, colors...'
                            : enquirySubTab === 'bulk'
                            ? 'Search bulk by contact, company, specs...'
                            : enquirySubTab === 'brand'
                            ? 'Search by contact, selected brands...'
                            : 'Search support by sender, message...'
                        }
                        value={enquirySearch}
                        onChange={(e) => setEnquirySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC006]/50 focus:border-amber-400"
                      />
                      {enquirySearch && (
                        <button
                          type="button"
                          onClick={() => setEnquirySearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="inline-flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setEnquiryStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          enquiryStatusFilter === 'all'
                            ? 'bg-gray-950 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-950'
                        }`}
                      >
                        All ({currentSubTabCounts.total})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquiryStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          enquiryStatusFilter === 'pending'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-amber-800'
                        }`}
                      >
                        Pending ({currentSubTabCounts.pending})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquiryStatusFilter('resolved')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          enquiryStatusFilter === 'resolved'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:text-emerald-800'
                        }`}
                      >
                        Resolved ({currentSubTabCounts.resolved})
                      </button>
                    </div>

                    {(enquirySearch || enquiryStatusFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEnquirySearch('');
                          setEnquiryStatusFilter('all');
                        }}
                        className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline px-1"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                    Showing <span className="text-gray-950 font-black">{currentFilteredCount}</span> of {currentSubTabCounts.total} enquiries
                  </div>
                </div>

                {/* ===================== TAB A: RETAIL ENQUIRY ===================== */}
                {enquirySubTab === 'retail' && (
                  <div className="space-y-3">
                    {filteredRetail.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
                        <p className="text-xs sm:text-sm font-bold text-gray-600">
                          {retailEnquiries.length === 0
                            ? 'No retail customization enquiries found.'
                            : 'No retail customization requests match your search criteria.'}
                        </p>
                        {retailEnquiries.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEnquirySearch('');
                              setEnquiryStatusFilter('all');
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredRetail.map((e) => {
                        const itemsList = e.colors
                          ? e.colors.split(';').map((s: string) => s.trim()).filter(Boolean)
                          : [];
                        const isResolved = e.status === 'RESOLVED';
                        const isExpanded = expandedRetailIds.includes(e.id);
                        const submittedDate = e.created_at
                          ? new Date(e.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'N/A';

                        return (
                          <div
                            key={e.id}
                            className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200/90 bg-white shadow-xs space-y-3"
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                                  Retail Enquiry
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-gray-500">{submittedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                                    isResolved
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}
                                >
                                  {e.status || 'NEW'}
                                </span>
                                <button
                                  type="button"
                                  disabled={updatingEnquiryId === e.id}
                                  onClick={() =>
                                    handleUpdateEnquiryStatus(
                                      'retail',
                                      e.id,
                                      isResolved ? 'NEW' : 'RESOLVED'
                                    )
                                  }
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[9.5px] shadow-2xs transition-colors ${
                                    isResolved
                                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {isResolved ? 'Reopen (Mark New)' : 'Mark Resolved'}
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingEnquiryId === e.id}
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Delete Retail Enquiry?',
                                      message: `Are you sure you want to delete this custom apparel retail inquiry from ${e.customer_name || 'Customer'}?`,
                                      confirmLabel: 'Confirm Delete',
                                      isDestructive: true,
                                      onConfirm: () => handleDeleteEnquiry('retail', e.id),
                                    });
                                  }}
                                  title="Delete enquiry"
                                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Customer Summary & Shared Contact Actions */}
                            <div className="bg-amber-50/40 p-3 sm:p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Customer Name
                                  </span>
                                  <p className="font-black text-xs sm:text-sm text-gray-950 leading-tight">
                                    {e.customer_name || 'Anonymous Customer'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Total Pieces
                                  </span>
                                  <span className="font-black text-xs sm:text-sm text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-block">
                                    {e.quantities || e.quantity || 1} pcs
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
                                <div className="text-xs text-gray-600">
                                  <span className="font-mono text-gray-900 font-semibold">{e.phone || 'No phone'}</span>
                                  {e.email && <span className="ml-2 text-gray-500">({e.email})</span>}
                                </div>
                                <ContactActions
                                  name={e.customer_name || 'Customer'}
                                  phone={e.phone}
                                  email={e.email}
                                  contextMessage={`Hi ${e.customer_name || ''}, thank you for contacting FunPrint! Regarding your custom apparel retail order enquiry (${e.quantities || e.quantity || 1} pcs)...`}
                                  compact={false}
                                />
                              </div>
                            </div>

                            {/* Base Garment & Expandable Breakdown */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs bg-amber-50/50 px-3 py-1.5 rounded-lg border border-amber-200/70">
                                <span className="text-gray-500 uppercase text-[10px] font-bold">Base Garment:</span>
                                <span className="font-black text-gray-950">{e.garment_type || 'Custom Apparel'}</span>
                              </div>

                              {/* Concise Summary with Expand/Collapse Option */}
                              {itemsList.length > 0 && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">
                                      Custom Garments Breakdown ({itemsList.length} items):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedRetailIds((prev) =>
                                          prev.includes(e.id)
                                            ? prev.filter((id) => id !== e.id)
                                            : [...prev, e.id]
                                        );
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950"
                                    >
                                      <span>{isExpanded ? 'Hide Breakdown' : 'Expand Full Breakdown'}</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  {!isExpanded ? (
                                    <div className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-2.5 text-xs text-gray-700 font-medium">
                                      <p className="line-clamp-2">
                                        {itemsList.join(' • ')}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                                      {itemsList.map((item: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-2 text-xs text-gray-900 font-medium flex items-center gap-2 shadow-2xs"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                          <span className="leading-snug">{item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Logo Instructions Callout */}
                            {e.instructions && (
                              <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5 sm:p-3 text-xs text-amber-950 font-sans">
                                <strong className="font-black uppercase text-[10px] text-amber-900 tracking-wider block mb-1">
                                  Customization &amp; Logo Requirements:
                                </strong>
                                <p className="whitespace-pre-wrap leading-relaxed">{e.instructions}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ===================== TAB B: FACTORY DIRECT BULK ENQUIRIES ===================== */}
                {enquirySubTab === 'bulk' && (
                  <div className="space-y-3">
                    {filteredBulk.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
                        <p className="text-xs sm:text-sm font-bold text-gray-600">
                          No factory direct bulk enquiries found.
                        </p>
                        {bulkEnquiries.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEnquirySearch('');
                              setEnquiryStatusFilter('all');
                            }}
                            className="px-3 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredBulk.map((b) => {
                        const isResolved = b.status === 'RESOLVED';
                        const submittedDate = b.created_at
                          ? new Date(b.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'N/A';

                        return (
                          <div
                            key={b.id}
                            className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-purple-200/90 bg-white shadow-xs space-y-3"
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-950 border border-purple-300">
                                  Factory Direct Bulk
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-gray-500">{submittedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                                    isResolved
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                                  }`}
                                >
                                  {b.status || 'NEW'}
                                </span>
                                <button
                                  type="button"
                                  disabled={updatingEnquiryId === b.id}
                                  onClick={() =>
                                    handleUpdateEnquiryStatus(
                                      'bulk',
                                      b.id,
                                      isResolved ? 'NEW' : 'RESOLVED'
                                    )
                                  }
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[9.5px] shadow-2xs transition-colors ${
                                    isResolved
                                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {isResolved ? 'Reopen (Mark New)' : 'Mark Resolved'}
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingEnquiryId === b.id}
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Delete Factory Bulk Enquiry?',
                                      message: `Are you sure you want to delete this wholesale order inquiry from ${b.contact_name || b.company_name || 'Wholesale Buyer'}?`,
                                      confirmLabel: 'Confirm Delete',
                                      isDestructive: true,
                                      onConfirm: () => handleDeleteEnquiry('bulk', b.id),
                                    });
                                  }}
                                  title="Delete enquiry"
                                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Contact & Company Details */}
                            <div className="bg-purple-50/40 p-3 sm:p-3.5 rounded-xl border border-purple-200/80 shadow-2xs space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Contact &amp; Company Information
                                  </span>
                                  <p className="font-black text-xs sm:text-sm text-gray-950 leading-tight">
                                    {b.contact_name || b.company_name || 'Anonymous Wholesale Contact'}
                                  </p>
                                  {b.organization && (
                                    <span className="text-[10.5px] font-semibold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                                      {b.organization}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Requested Quantity
                                  </span>
                                  <span className="font-black text-xs sm:text-sm text-purple-950 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300 inline-block">
                                    {b.items?.[0]?.quantity || 50}+ units
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-200/60">
                                <div className="text-xs text-gray-600">
                                  <span className="font-mono text-gray-900 font-semibold">{b.phone || 'No phone'}</span>
                                  {b.email && <span className="ml-2 text-gray-500">({b.email})</span>}
                                </div>
                                <ContactActions
                                  name={b.contact_name || b.company_name || 'Wholesale Buyer'}
                                  phone={b.phone}
                                  email={b.email}
                                  contextMessage={`Hi ${b.contact_name || ''}, thank you for your wholesale bulk enquiry with FunPrint! Regarding your order for ${b.organization || 'custom garments'}...`}
                                  compact={false}
                                />
                              </div>
                            </div>

                            {/* Specs & Products */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="bg-purple-50/30 p-2.5 rounded-xl border border-purple-200/60">
                                <span className="text-gray-400 uppercase text-[9.5px] font-bold block">
                                  Requested Garment
                                </span>
                                <span className="font-bold text-gray-950">
                                  {b.items?.[0]?.garmentType || 'Bulk Custom Apparel'}
                                </span>
                              </div>
                              <div className="bg-purple-50/30 p-2.5 rounded-xl border border-purple-200/60">
                                <span className="text-gray-400 uppercase text-[9.5px] font-bold block">
                                  Fabric / GSM Specifications
                                </span>
                                <span className="font-bold text-gray-950">
                                  {b.fabric_specs || b.gsm || 'Standard Factory Specs'}
                                </span>
                              </div>
                            </div>

                            {/* Requirements & Notes */}
                            {b.admin_notes && (
                              <div className="bg-purple-50/90 border border-purple-300/80 rounded-xl p-2.5 sm:p-3 text-xs text-purple-950 font-sans">
                                <strong className="font-black uppercase text-[10px] text-purple-900 tracking-wider block mb-1">
                                  Wholesale Requirements &amp; Notes:
                                </strong>
                                <p className="whitespace-pre-wrap leading-relaxed">{b.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ===================== TAB C: BRAND COLLABORATION BULK ENQUIRIES ===================== */}
                {enquirySubTab === 'brand' && (
                  <div className="space-y-3">
                    {filteredBrand.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
                        <p className="text-xs sm:text-sm font-bold text-gray-600">
                          No brand collaboration bulk enquiries found.
                        </p>
                        {brandEnquiries.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEnquirySearch('');
                              setEnquiryStatusFilter('all');
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredBrand.map((br) => {
                        const isResolved = br.status === 'RESOLVED';
                        const submittedDate = br.created_at
                          ? new Date(br.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'N/A';
                        const brandList = (br.brands || '')
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean);

                        return (
                          <div
                            key={br.id}
                            className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-200/90 bg-white shadow-xs space-y-3"
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
                                  Brand Collaboration
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-gray-500">{submittedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                                    isResolved
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  {br.status || 'NEW'}
                                </span>
                                <button
                                  type="button"
                                  disabled={updatingEnquiryId === br.id}
                                  onClick={() =>
                                    handleUpdateEnquiryStatus(
                                      'brand',
                                      br.id,
                                      isResolved ? 'NEW' : 'RESOLVED'
                                    )
                                  }
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[9.5px] shadow-2xs transition-colors ${
                                    isResolved
                                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {isResolved ? 'Reopen (Mark New)' : 'Mark Resolved'}
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingEnquiryId === br.id}
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Delete Brand Enquiry?',
                                      message: `Are you sure you want to delete this brand collaboration bulk inquiry from ${br.name || 'Brand Buyer'}?`,
                                      confirmLabel: 'Confirm Delete',
                                      isDestructive: true,
                                      onConfirm: () => handleDeleteEnquiry('brand', br.id),
                                    });
                                  }}
                                  title="Delete enquiry"
                                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Contact Box */}
                            <div className="bg-emerald-50/40 p-3 sm:p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Contact Person
                                  </span>
                                  <p className="font-black text-xs sm:text-sm text-gray-950 leading-tight">
                                    {br.name || 'Anonymous Brand Buyer'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                    Selected Brands Count
                                  </span>
                                  <span className="font-black text-xs sm:text-sm text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 inline-block">
                                    {brandList.length} Brand{brandList.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/60">
                                <div className="text-xs text-gray-600">
                                  <span className="font-mono text-gray-900 font-semibold">{br.phone || 'No phone'}</span>
                                  {br.email && <span className="ml-2 text-gray-500">({br.email})</span>}
                                </div>
                                <ContactActions
                                  name={br.name || 'Brand Buyer'}
                                  phone={br.phone}
                                  email={br.email}
                                  contextMessage={`Hi ${br.name || ''}, thank you for contacting FunPrint! Regarding your brand bulk order enquiry for ${br.brands || 'selected brands'}...`}
                                  compact={false}
                                />
                              </div>
                            </div>

                            {/* Selected Brands Chips (Loaded from Neon PostgreSQL) */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider block">
                                Selected Brand Collaborations:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {brandList.length === 0 ? (
                                  <span className="text-xs text-gray-500 italic">No specific brands selected</span>
                                ) : (
                                  brandList.map((brandName: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="bg-emerald-950 text-emerald-100 border border-emerald-800 rounded-lg px-2.5 py-1 text-xs font-bold shadow-2xs flex items-center gap-1.5"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      <span>{brandName}</span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Customer Requirements / Message */}
                            {br.message && (
                              <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-xl p-2.5 sm:p-3 text-xs text-emerald-950 font-sans">
                                <strong className="font-black uppercase text-[10px] text-emerald-900 tracking-wider block mb-1">
                                  Customer Requirements &amp; Order Concern:
                                </strong>
                                <p className="whitespace-pre-wrap leading-relaxed">{br.message}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ===================== TAB D: GENERAL CONTACT SUBMISSIONS ===================== */}
                {enquirySubTab === 'contact' && (
                  <div className="space-y-3">
                    {filteredContact.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-2">
                        <p className="text-xs sm:text-sm font-bold text-gray-600">
                          No general contact submissions found.
                        </p>
                        {contactEnquiries.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEnquirySearch('');
                              setEnquiryStatusFilter('all');
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-950 text-xs font-bold"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredContact.map((e) => {
                        const isResolved = e.status === 'RESOLVED';
                        const submittedDate = e.created_at
                          ? new Date(e.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'N/A';

                        return (
                          <div
                            key={e.id}
                            className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-200/90 bg-white shadow-xs space-y-3"
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-950 border border-blue-300">
                                  General Contact
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-gray-500">{submittedDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                                    isResolved
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                                  }`}
                                >
                                  {e.status || 'NEW'}
                                </span>
                                <button
                                  type="button"
                                  disabled={updatingEnquiryId === e.id}
                                  onClick={() =>
                                    handleUpdateEnquiryStatus(
                                      'contact',
                                      e.id,
                                      isResolved ? 'NEW' : 'RESOLVED'
                                    )
                                  }
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[9.5px] shadow-2xs transition-colors ${
                                    isResolved
                                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {isResolved ? 'Reopen (Mark New)' : 'Mark Resolved'}
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingEnquiryId === e.id}
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Delete Contact Message?',
                                      message: `Are you sure you want to delete this support inquiry from ${e.name || 'Sender'}?`,
                                      confirmLabel: 'Confirm Delete',
                                      isDestructive: true,
                                      onConfirm: () => handleDeleteEnquiry('contact', e.id),
                                    });
                                  }}
                                  title="Delete enquiry"
                                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Sender Details */}
                            <div className="bg-blue-50/40 p-3 sm:p-3.5 rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
                              <div>
                                <span className="text-gray-400 text-[9.5px] uppercase font-bold tracking-wider block">
                                  Sender Information
                                </span>
                                <p className="font-black text-xs sm:text-sm text-gray-950 leading-tight">
                                  {e.name || 'Anonymous Sender'}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/60">
                                <div className="text-xs text-gray-600">
                                  <span className="font-mono text-gray-900 font-semibold">{e.phone || 'No phone'}</span>
                                  {e.email && <span className="ml-2 text-gray-500">({e.email})</span>}
                                </div>
                                <ContactActions
                                  name={e.name || 'Customer'}
                                  phone={e.phone}
                                  email={e.email}
                                  contextMessage={`Hi ${e.name || ''}, thank you for contacting FunPrint! Regarding your support message...`}
                                  compact={false}
                                />
                              </div>
                            </div>

                            {/* Message Content */}
                            <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3 sm:p-3.5 text-xs text-blue-950 font-sans shadow-2xs">
                              <span className="text-blue-800 text-[10px] uppercase font-black tracking-wider block mb-1">
                                Message / Query Content:
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed text-blue-950 font-medium">
                                &ldquo;{e.message}&rdquo;
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 10: OPERATIONAL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5 max-w-2xl">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-950">Operational Settings</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-3 sm:space-y-4 text-[11px] sm:text-xs">
                <div>
                  <label className="block font-bold text-gray-800 mb-1 sm:mb-1.5">
                    Merchant UPI ID <span className="text-amber-800 font-normal">(Used for QR code and copy buttons)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.upiId}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                    placeholder="e.g. yourbusiness@bankupi"
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white rounded-lg sm:rounded-xl border border-gray-300 font-mono text-[11px] sm:text-xs focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1 sm:mb-1.5">
                    Merchant UPI Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.upiName}
                    onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                    placeholder="e.g. FunPrint Official"
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white rounded-lg sm:rounded-xl border border-gray-300 text-[11px] sm:text-xs focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1 sm:mb-1.5">
                    Business WhatsApp Contact <span className="text-amber-800 font-normal">(Direct support and order dispatch notifications)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="e.g. 919876543210"
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white rounded-lg sm:rounded-xl border border-gray-300 font-mono text-[11px] sm:text-xs focus:border-[#FFC006] focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  />
                </div>

                <div className="pt-1.5 sm:pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black rounded-full text-[11px] sm:text-xs shadow-sm border border-amber-400/60 transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save & Update Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Tracking Update Modal (Strictly 4 fields: Courier Company, Tracking ID, Optional Tracking URL, Status) */}
        <AnimatePresence>
          {selectedOrderForTracking && (() => {
            const currentStatus = (selectedOrderForTracking.order_status || 'ORDER_PLACED').toUpperCase();
            const currentRank = TRACKING_STATUS_RANKS[currentStatus] || 1;
            const isOrderDelivered = currentStatus === 'DELIVERED';

            return (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200 text-xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <div>
                      <h3 className="font-black text-sm text-gray-950">
                        Update Tracking: {selectedOrderForTracking.order_code || selectedOrderForTracking.id}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        Customer: {selectedOrderForTracking.customer_name || 'Valued Customer'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForTracking(null)}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {isOrderDelivered ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-black text-xs">Shipment Delivered Successfully</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          This order has reached the final delivery step. All 7 tracking steps are completed and sequential updates are locked.
                        </p>
                        {selectedOrderForTracking.courier_name && (
                          <div className="mt-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px] flex items-center justify-between">
                            <span>
                              Courier: {selectedOrderForTracking.courier_name} • AWB: {selectedOrderForTracking.tracking_id || 'N/A'}
                            </span>
                            {selectedOrderForTracking.tracking_id && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator?.clipboard) {
                                    navigator.clipboard.writeText(selectedOrderForTracking.tracking_id);
                                    toast.success('AWB copied to clipboard!');
                                  }
                                }}
                                className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition-colors inline-flex items-center gap-1 font-sans text-[10.5px]"
                                title="Copy AWB number"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy AWB</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTracking(null)}
                          className="px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                        >
                          Order Delivered
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveTracking} className="space-y-3.5">
                      {/* 1. Courier Company */}
                      <div>
                        <label className="block font-bold text-gray-800 mb-1 text-xs">
                          Courier Company
                        </label>
                        <input
                          type="text"
                          list="courier-suggestions"
                          value={trackingForm.courierCompany}
                          onChange={(e) => setTrackingForm({ ...trackingForm, courierCompany: e.target.value })}
                          placeholder="e.g. Blue Dart, Delhivery, DTDC"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                        />
                        <datalist id="courier-suggestions">
                          <option value="Blue Dart" />
                          <option value="Delhivery" />
                          <option value="DTDC" />
                          <option value="India Post" />
                          <option value="Xpressbees" />
                          <option value="Shadowfax" />
                          <option value="Professional Couriers" />
                        </datalist>
                      </div>

                      {/* 2. Tracking ID / AWB */}
                      <div>
                        <label className="block font-bold text-gray-800 mb-1 text-xs">
                          Tracking ID / AWB
                        </label>
                        <input
                          type="text"
                          value={trackingForm.trackingId}
                          onChange={(e) => setTrackingForm({ ...trackingForm, trackingId: e.target.value })}
                          placeholder="e.g. BD948201948IN"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs font-mono"
                        />
                      </div>

                      {/* 3. Tracking URL (Optional) */}
                      <div>
                        <label className="block font-bold text-gray-800 mb-1 text-xs">
                          Tracking URL <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          value={trackingForm.trackingUrl}
                          onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                          placeholder="https://www.bluedart.com/tracking/..."
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                        />
                      </div>

                      {/* 4. Status (7 steps with sequential progression locking) */}
                      <div>
                        <label className="block font-bold text-gray-800 mb-1 text-xs">
                          Shipment Status
                        </label>
                        <select
                          value={trackingForm.status}
                          onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] bg-white text-xs font-bold text-gray-950 outline-none"
                        >
                          {TRACKING_STEPS_7.map((step) => {
                            const isPast = step.rank < currentRank;
                            return (
                              <option
                                key={step.key}
                                value={step.key}
                                disabled={isPast}
                              >
                                {step.label} {isPast ? '(Completed - Locked)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Sequential tracking: Completed steps are locked and cannot be selected again.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTracking(null)}
                          className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingTracking}
                          className="px-5 py-2 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black text-xs shadow-xs border border-amber-400/60 transition-all disabled:opacity-50"
                        >
                          {savingTracking ? 'Saving...' : trackingForm.status === 'DELIVERED' ? 'Mark Delivered' : 'Save Status'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* Compact Confirm Dialog Modal (Replaces browser confirm) */}
        <AnimatePresence>
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  {confirmDialog.isDestructive ? (
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                  <h3 className="font-black text-sm text-gray-950">{confirmDialog.title}</h3>
                </div>
                <p className="text-gray-600 text-xs mb-5 pl-10 leading-relaxed">
                  {confirmDialog.message}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                    className="px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={async () => {
                      await confirmDialog.onConfirm();
                      setConfirmDialog({ ...confirmDialog, isOpen: false });
                    }}
                    className={`px-4 py-1.5 rounded-full font-black text-xs shadow-xs transition-colors disabled:opacity-50 ${
                      confirmDialog.isDestructive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 border border-amber-400/60'
                    }`}
                  >
                    {isProcessingAction ? 'Processing...' : confirmDialog.confirmLabel}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Compact Color Management Modal (Replaces browser prompt) */}
        <AnimatePresence>
          {colorModal.isOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h3 className="font-black text-sm text-gray-950 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-600" />
                    <span>{colorModal.mode === 'add' ? 'Add Color to Product' : 'Edit Color Name'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setColorModal({ ...colorModal, isOpen: false })}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-xs">Color Name *</label>
                    <input
                      type="text"
                      required
                      value={colorModal.colorName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoHex = getColorDisplay(val);
                        setColorModal({ ...colorModal, colorName: val, colorHex: autoHex });
                      }}
                      placeholder="e.g. Royal Blue, Bottle Green, Charcoal Melange"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-gray-100">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300 shrink-0 shadow-xs"
                      style={{ backgroundColor: colorModal.colorHex || getColorDisplay(colorModal.colorName) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-xs truncate">
                        {colorModal.colorName || 'Color Swatch Preview'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Hex: {colorModal.colorHex || getColorDisplay(colorModal.colorName)}
                      </div>
                    </div>
                    <input
                      type="color"
                      value={colorModal.colorHex.startsWith('#') && colorModal.colorHex.length === 7 ? colorModal.colorHex : '#000000'}
                      onChange={(e) => setColorModal({ ...colorModal, colorHex: e.target.value })}
                      title="Adjust swatch hex"
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0 bg-transparent"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => setColorModal({ ...colorModal, isOpen: false })}
                      className="px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingAction || !colorModal.colorName.trim()}
                      onClick={handleSaveColorModal}
                      className="px-4 py-1.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black shadow-xs border border-amber-400/60 disabled:opacity-50"
                    >
                      {isProcessingAction ? 'Saving...' : 'Save Color'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Compact Size Management Modal (Replaces browser prompt) */}
        <AnimatePresence>
          {sizeModal.isOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h3 className="font-black text-sm text-gray-950 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-amber-600" />
                    <span>{sizeModal.mode === 'add' ? 'Add Size to Product' : 'Edit Size'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSizeModal({ ...sizeModal, isOpen: false })}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1 text-xs">Size Label *</label>
                    <input
                      type="text"
                      list="size-suggestions"
                      required
                      value={sizeModal.size}
                      onChange={(e) => setSizeModal({ ...sizeModal, size: e.target.value.toUpperCase() })}
                      placeholder="e.g. S, M, L, XL, XXL, 3XL"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs font-mono font-bold"
                    />
                    <datalist id="size-suggestions">
                      <option value="XS" />
                      <option value="S" />
                      <option value="M" />
                      <option value="L" />
                      <option value="XL" />
                      <option value="XXL" />
                      <option value="2XL" />
                      <option value="3XL" />
                      <option value="4XL" />
                      <option value="5XL" />
                    </datalist>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => setSizeModal({ ...sizeModal, isOpen: false })}
                      className="px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingAction || !sizeModal.size.trim()}
                      onClick={handleSaveSizeModal}
                      className="px-4 py-1.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black shadow-xs border border-amber-400/60 disabled:opacity-50"
                    >
                      {isProcessingAction ? 'Saving...' : 'Save Size'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Compact Payment Verification & Rejection Popover Modal */}
        <AnimatePresence>
          {paymentModal.isOpen && paymentModal.payment && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 text-xs"
              >
                {paymentModal.mode === 'confirm' ? (
                  <div>
                    {(() => {
                      const isCod = (paymentModal.payment.payment_method || '').toUpperCase().includes('COD');
                      return (
                        <>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${isCod ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center`}>
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="font-black text-sm text-gray-950">
                                  {isCod ? 'Verify Cash on Delivery (COD) Order' : 'Verify Manual UPI Payment'}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-mono">
                                  Order #{paymentModal.payment.order_id}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="bg-stone-50 rounded-2xl p-4 border border-gray-200 space-y-2 mb-4 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Order Amount:</span>
                              <span className="font-extrabold text-gray-950 text-sm">
                                ₹{Number(paymentModal.payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Payment Method:</span>
                              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${isCod ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                                {isCod ? 'Cash on Delivery (COD)' : 'Manual UPI Payment'}
                              </span>
                            </div>
                            {isCod && (
                              <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-xl text-[10.5px] text-blue-800 font-medium">
                                Pay cash or UPI upon package handover at your doorstep
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Customer Name:</span>
                              <span className="font-bold text-gray-900">{paymentModal.payment.customer_name || 'Customer'}</span>
                            </div>
                            {paymentModal.payment.customer_phone && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Customer Phone:</span>
                                <span className="font-mono text-gray-800">{paymentModal.payment.customer_phone}</span>
                              </div>
                            )}
                            {!isCod && paymentModal.payment.payer_name && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Payer UPI Name:</span>
                                <span className="font-bold text-purple-900">{paymentModal.payment.payer_name}</span>
                              </div>
                            )}
                            {!isCod && paymentModal.payment.payer_phone && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Payer UPI Number:</span>
                                <span className="font-mono text-purple-900">{paymentModal.payment.payer_phone}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">{isCod ? 'Collection Ref:' : 'Bank UTR / Ref:'}</span>
                              <span className="font-mono font-bold text-gray-950 bg-white px-2 py-0.5 rounded border border-gray-200">
                                {paymentModal.payment.transaction_ref || paymentModal.payment.utr_number || (isCod ? `COD-${paymentModal.payment.order_id}` : 'N/A')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Submission Date &amp; Time:</span>
                              <span className="font-sans text-gray-700">
                                {paymentModal.payment.payment_date || paymentModal.payment.created_at
                                  ? new Date(paymentModal.payment.payment_date || paymentModal.payment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl mb-4 text-[11px] leading-relaxed border ${isCod ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                            {isCod ? (
                              <span>
                                <strong>Admin Verification:</strong> Verifying this COD order confirms customer intent and advances the order to <strong>CONFIRMED</strong> status for production and dispatch.
                              </span>
                            ) : (
                              <span>
                                <strong>Important:</strong> Verification should only occur after checking the actual merchant bank or UPI transaction record. This action logs your administrative ID permanently.
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                              className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={handleConfirmPaymentModal}
                              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors disabled:opacity-50"
                            >
                              {isProcessingAction ? 'Verifying...' : (isCod ? 'Confirm & Verify COD Order' : 'Confirm Order & Verify Payment')}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-gray-950">Cancel Order / Reject Payment</h3>
                          <p className="text-[10px] text-gray-500 font-mono">
                            Order #{paymentModal.payment.order_id}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="text-gray-600 text-xs">
                        Are you sure you want to reject this payment of ₹{Number(paymentModal.payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} and cancel Order #{paymentModal.payment.order_id}?
                      </p>
                      <div>
                        <label className="block font-bold text-gray-800 mb-1 text-xs">
                          Cancellation / Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={paymentModal.reason || ''}
                          onChange={(e) => setPaymentModal({ ...paymentModal, reason: e.target.value })}
                          placeholder="e.g. UTR not matching statement, transaction timed out, incorrect amount"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                        className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={isProcessingAction || !paymentModal.reason?.trim()}
                        onClick={handleRejectPaymentModal}
                        className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isProcessingAction ? 'Cancelling...' : 'Cancel Order & Reject Payment'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Product Details Modal */}
        <AnimatePresence>
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="font-black text-sm text-gray-950">
                    Edit Product: {editingProduct.name}
                  </h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProductDetails} className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs bg-white"
                    >
                      <option value="Round Neck">Round Neck</option>
                      <option value="Polo">Polo</option>
                      <option value="V-Neck">V-Neck</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Zip Hoodie">Zip Hoodie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Description</label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black text-xs shadow-xs border border-amber-400/60"
                    >
                      Save Product Details
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add New Product Modal */}
        <AnimatePresence>
          {showAddProductModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="font-black text-sm text-gray-950">Add New Product to Catalog</h3>
                  <button
                    onClick={() => setShowAddProductModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      placeholder="e.g. Classic Bio-Wash Heavy Crewneck"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Category</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs bg-white"
                    >
                      <option value="Round Neck">Round Neck</option>
                      <option value="Polo">Polo</option>
                      <option value="V-Neck">V-Neck</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Zip Hoodie">Zip Hoodie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Description</label>
                    <textarea
                      value={newProductForm.description}
                      onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      placeholder="Fabric specifications and features"
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-[#FFC006] outline-none text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black text-xs shadow-xs border border-amber-400/60"
                    >
                      Create Product
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add New Variant Modal */}
        <AnimatePresence>
          {showAddVariantModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h3 className="font-black text-sm text-gray-950">Add Size & Color Variant</h3>
                  <button
                    onClick={() => setShowAddVariantModal(null)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddVariant} className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Color Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Blue, Crimson Red"
                      value={newVariantForm.colorName}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, colorName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Size *</label>
                    <select
                      value={newVariantForm.size}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, size: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs bg-white font-bold"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="3XL">3XL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Initial Stock Units</label>
                    <input
                      type="number"
                      min="0"
                      value={newVariantForm.stockQuantity}
                      onChange={(e) => setNewVariantForm({ ...newVariantForm, stockQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVariantModal(null)}
                      className="px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black shadow-xs border border-amber-400/60"
                    >
                      Add Variant
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}

export default AdminDashboardView;

