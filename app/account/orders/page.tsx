'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Truck,
  Check,
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  ShoppingBag,
  CheckCircle2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AuthModal from '@/components/auth/AuthModal';

interface TrackingEvent {
  id: string;
  status: string;
  location?: string;
  message?: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  color?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  shipping_cost: number;
  subtotal: number;
  payment_status: string;
  order_status: string;
  courier_name?: string;
  tracking_id?: string;
  tracking_url?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
  tracking_events: TrackingEvent[];
}

interface TrackingStepItem {
  step: number;
  key: string;
  title: string;
  message: string;
  state: 'COMPLETED' | 'CURRENT' | 'PENDING';
  dateStr?: string;
  timeStr?: string;
}

const PREDEFINED_7_STEPS = [
  {
    step: 1,
    key: 'ORDER_PLACED',
    title: 'Order Placed',
    message: 'Your order has been placed successfully.',
  },
  {
    step: 2,
    key: 'ORDER_CONFIRMED',
    title: 'Order Confirmed',
    message: 'Your order has been confirmed and is being processed.',
  },
  {
    step: 3,
    key: 'PACKED',
    title: 'Packed',
    message: 'Your item has been packed and is ready for dispatch.',
  },
  {
    step: 4,
    key: 'SHIPPED',
    title: 'Shipped',
    message: 'Your item has been shipped.',
  },
  {
    step: 5,
    key: 'IN_TRANSIT',
    title: 'In Transit',
    message: 'Your package has been scanned and is on its way to the destination.',
  },
  {
    step: 6,
    key: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    message: 'Your package is out for delivery and will arrive soon.',
  },
  {
    step: 7,
    key: 'DELIVERED',
    title: 'Delivered',
    message: 'Your package has been delivered successfully.',
  },
] as const;

function formatMilestoneDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatMilestoneTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getStatusStepIndex(status: string | undefined): number {
  if (!status) return 1;
  const normalized = status.toUpperCase().trim();
  switch (normalized) {
    case 'ORDER_PLACED':
      return 1;
    case 'ORDER_CONFIRMED':
    case 'PROCESSING':
      return 2;
    case 'PACKED':
      return 3;
    case 'SHIPPED':
      return 4;
    case 'IN_TRANSIT':
      return 5;
    case 'OUT_FOR_DELIVERY':
      return 6;
    case 'DELIVERED':
      return 7;
    default:
      return 1;
  }
}

/**
 * Derives the cumulative 7-step customer timeline from order status.
 * Never invents historical timestamps for steps that were not recorded.
 */
function getSequential7Steps(order: Order): TrackingStepItem[] {
  const currentStep = getStatusStepIndex(order.order_status);
  const events = order.tracking_events || [];

  const findEventTime = (keys: string[]): string | undefined => {
    const ev = [...events].reverse().find((e) => keys.includes(e.status?.toUpperCase()));
    return ev?.createdAt;
  };

  const stepsDef = [
    {
      step: 1,
      key: 'ORDER_PLACED',
      title: 'Order Placed',
      message: 'Your order has been placed successfully.',
      timestamp: order.created_at,
    },
    {
      step: 2,
      key: 'ORDER_CONFIRMED',
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being processed.',
      timestamp: findEventTime(['ORDER_CONFIRMED', 'PROCESSING']),
    },
    {
      step: 3,
      key: 'PACKED',
      title: 'Packed',
      message: 'Your item has been packed and is ready for dispatch.',
      timestamp: findEventTime(['PACKED']),
    },
    {
      step: 4,
      key: 'SHIPPED',
      title: 'Shipped',
      message: 'Your item has been shipped.',
      timestamp: findEventTime(['SHIPPED']),
    },
    {
      step: 5,
      key: 'IN_TRANSIT',
      title: 'In Transit',
      message: 'Your package has been scanned and is on its way to the destination.',
      timestamp: findEventTime(['IN_TRANSIT']),
    },
    {
      step: 6,
      key: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      message: 'Your package is out for delivery and will arrive soon.',
      timestamp: findEventTime(['OUT_FOR_DELIVERY']),
    },
    {
      step: 7,
      key: 'DELIVERED',
      title: 'Delivered',
      message: 'Your package has been delivered successfully.',
      timestamp: findEventTime(['DELIVERED']),
    },
  ];

  return stepsDef.map((s) => {
    let state: 'COMPLETED' | 'CURRENT' | 'PENDING';
    if (currentStep === 7) {
      // When delivered: all 7 steps are completed
      state = 'COMPLETED';
    } else if (s.step < currentStep) {
      state = 'COMPLETED';
    } else if (s.step === currentStep) {
      state = 'CURRENT';
    } else {
      state = 'PENDING';
    }

    return {
      step: s.step,
      key: s.key,
      title: s.title,
      message: s.message,
      state,
      dateStr: s.timestamp ? formatMilestoneDate(s.timestamp) : undefined,
      timeStr: s.timestamp ? formatMilestoneTime(s.timestamp) : undefined,
    };
  });
}

function CustomerOrdersContent() {
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');

  const [customer, setCustomer] = useState<{
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
  } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Accordion state for items inside each order card
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Timeline visibility state (all default to true so tracking is visible right inside order details)
  const [timelineVisible, setTimelineVisible] = useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const toggleTimeline = (orderId: string) => {
    setTimelineVisible((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedText(text);
          toast.success(`${label} copied to clipboard!`);
          setTimeout(() => setCopiedText(null), 2500);
        })
        .catch(() => {
          toast.error('Could not copy to clipboard');
        });
    } else {
      toast.error('Clipboard access not supported');
    }
  };

  useEffect(() => {
    fetchCustomerAndOrders();
  }, []);

  const fetchCustomerAndOrders = async () => {
    try {
      const authRes = await fetch('/api/customer/auth');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.customer) {
          setCustomer(authData.customer);
          await fetchOrders();
          return;
        }
      }
      setCustomer(null);
    } catch (err) {
      console.error('Failed to verify customer authentication', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/customer/orders');
      if (res.ok) {
        const data = await res.json();
        const fetchedOrders: Order[] = data.orders || [];
        setOrders(fetchedOrders);

        // Initialize timeline visibility as open for all orders
        const initialTimelines: Record<string, boolean> = {};
        fetchedOrders.forEach((o) => {
          initialTimelines[o.id] = true;
        });
        setTimelineVisible(initialTimelines);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/auth', { method: 'DELETE' });
      toast.success('Signed out successfully');
      setCustomer(null);
      setOrders([]);
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'ORDER_CONFIRMED':
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Order Confirmed
          </span>
        );
      case 'PACKED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Packed</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Shipped</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">In Transit</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Out for Delivery</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Order Placed</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">Paid (Verified)</span>;
      case 'SUBMITTED_FOR_VERIFICATION':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">Verification Pending</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Payment Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center font-serif text-sm text-gray-500">
        Loading your account orders...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/70 pt-28 pb-16 font-serif">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-md">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 mb-2">My Account & Orders</h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Please log in with your email or phone to view your order history and live shipment tracking.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-bold text-xs sm:text-sm shadow-sm transition-all border border-amber-400/60"
            >
              Sign In / Register
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(loggedInCustomer) => {
            if (loggedInCustomer) {
              setCustomer(loggedInCustomer);
              fetchOrders();
            } else {
              fetchCustomerAndOrders();
            }
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pt-20 sm:pt-28 pb-12 sm:pb-16 font-serif">
      <div className="max-w-3xl mx-auto px-3 sm:px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/90 shadow-xs mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-950 text-white flex items-center justify-center font-bold text-xs sm:text-base shrink-0">
              {customer.fullName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-black text-gray-950 truncate leading-tight">{customer.fullName}</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{customer.email} {customer.phone ? `• ${customer.phone}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/products"
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[10.5px] sm:text-xs transition-colors flex items-center gap-1 sm:gap-1.5"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Catalog</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10.5px] sm:text-xs transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            <h2 className="text-sm sm:text-lg font-black text-gray-950">
              Order History &amp; Tracking ({orders.length})
            </h2>
          </div>
        </div>

        {/* ORDERS LIST WITH INLINE 7-STEP SHIPMENT TRACKING */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 text-center">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">No Orders Found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              You haven&apos;t placed any custom apparel orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#FFC006] text-gray-950 font-bold text-xs sm:text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isItemsExpanded = !!expandedOrders[order.id];
              const isTrackingOpen = timelineVisible[order.id] !== false;
              const orderSteps = getSequential7Steps(order);
              const isDelivered = order.order_status === 'DELIVERED';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
                    highlightedOrderId === order.id
                      ? 'border-amber-400 shadow-md ring-2 ring-amber-200'
                      : 'border-gray-200/90 shadow-xs'
                  }`}
                >
                  {/* Order Card Header */}
                  <div className="p-3.5 sm:p-5 border-b border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-sans font-bold">
                          Order ID
                        </span>
                        <p className="text-xs sm:text-sm font-extrabold text-gray-950 font-mono">
                          {order.id}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] sm:text-[11px] text-gray-500">Date</span>
                        <p className="text-[11px] sm:text-xs text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Middle Row: Status & Badges */}
                    <div className="pt-2.5 sm:pt-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-bold text-[10.5px] sm:text-xs">Status:</span>
                          {getStatusBadge(order.order_status)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-bold text-[10.5px] sm:text-xs">Payment:</span>
                          {getPaymentBadge(order.payment_status)}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm font-extrabold text-gray-950">
                        Total: ₹{order.total_amount}
                      </div>
                    </div>

                    {/* Courier Logistics (if assigned) */}
                    {(order.courier_name || order.tracking_id) && (
                      <div className="mt-2.5 sm:mt-3 p-2 sm:p-3 rounded-xl bg-stone-50 border border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-700">
                          <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Courier: <strong className="text-gray-950">{order.courier_name || 'Standard'}</strong>
                          </span>
                          {order.tracking_id && (
                            <span className="inline-flex items-center gap-1 bg-white px-1.5 sm:px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                              <span className="text-gray-500 font-semibold">• AWB:</span>
                              <strong className="font-mono text-gray-950">{order.tracking_id}</strong>
                              <button
                                type="button"
                                onClick={() => handleCopy(order.tracking_id!, 'AWB number')}
                                className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-800 transition-colors inline-flex items-center gap-0.5"
                                title="Copy AWB number"
                              >
                                {copiedText === order.tracking_id ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] text-emerald-600 font-bold">
                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" /> Copied!
                                  </span>
                                ) : (
                                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                )}
                              </button>
                            </span>
                          )}
                        </div>
                        {order.tracking_url && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-800 hover:text-amber-950 font-bold underline"
                              title="Go to courier tracking link"
                            >
                              <span>Courier Portal</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.tracking_url!, 'Tracking link')}
                              className="px-1.5 sm:px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 hover:text-gray-950 hover:bg-gray-50 text-[10px] sm:text-[10.5px] font-medium transition-colors inline-flex items-center gap-0.5 shadow-2xs"
                              title="Copy tracking link"
                            >
                              {copiedText === order.tracking_url ? (
                                <span className="inline-flex items-center gap-0.5 text-[9.5px] text-emerald-600 font-bold">
                                  <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" /> Copied!
                                </span>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Success State Banner (When Delivered) */}
                  {isDelivered && (
                    <div className="mx-3 sm:mx-5 mt-3 sm:mt-4 p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-black text-emerald-950 leading-tight">
                          Order Delivered Successfully!
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-700 mt-0.5">
                          Your package has been delivered successfully. Thank you for choosing FunPrint!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INLINE 7-STEP SHIPMENT TRACKING TIMELINE */}
                  <div className="p-3.5 sm:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                        <span>Shipment Tracking Timeline</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleTimeline(order.id)}
                        className="text-[11px] sm:text-xs font-bold text-gray-600 hover:text-gray-950 flex items-center gap-1"
                      >
                        <span>{isTrackingOpen ? 'Collapse' : 'Expand Timeline'}</span>
                        {isTrackingOpen ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                      </button>
                    </div>

                    {isTrackingOpen && (
                      <div className="space-y-0 pt-1">
                        {orderSteps.map((item, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === orderSteps.length - 1;
                          const isDeliveredStep = item.step === 7;

                          // Color Styling per Part 4:
                          // Steps 1 to 6: yellow styling (amber)
                          // Step 7: green styling
                          // Future steps: neutral/muted
                          const isYellow = item.step <= 6 && item.state !== 'PENDING';
                          const isGreen = isDeliveredStep && item.state !== 'PENDING';
                          const isCurrent = item.state === 'CURRENT';

                          return (
                            <div
                              key={item.step}
                              className="grid grid-cols-[50px_22px_1fr] sm:grid-cols-[72px_32px_1fr] gap-x-2 sm:gap-x-4 items-start"
                            >
                              {/* Left Column: Date & Time if recorded (never invent fake dates) */}
                              <div className="text-left pt-0.5 whitespace-nowrap">
                                {item.dateStr ? (
                                  <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-800 leading-tight">{item.dateStr}</p>
                                    {item.timeStr && (
                                      <p className="text-[9px] sm:text-[10px] text-gray-400 font-sans mt-0.5">{item.timeStr}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-4" />
                                )}
                              </div>

                              {/* Center Column: Node & Connector Line */}
                              <div className="relative flex flex-col items-center h-full min-h-[58px]">
                                {/* Top connector */}
                                {!isFirst && (
                                  <div
                                    className={`absolute top-0 w-0.5 h-2.5 ${
                                      item.state === 'PENDING'
                                        ? 'bg-slate-200'
                                        : isGreen
                                        ? 'bg-[#10b981]'
                                        : 'bg-[#FFC006]'
                                    }`}
                                  />
                                )}

                                {/* Node */}
                                {item.state === 'COMPLETED' && (
                                  <div
                                    className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shadow-2xs ${
                                      isGreen ? 'bg-[#10b981]' : 'bg-[#FFC006] text-gray-950 font-bold'
                                    }`}
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}

                                {item.state === 'CURRENT' && (
                                  <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFC006] text-gray-950 flex items-center justify-center ring-4 ring-amber-200 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-gray-950 animate-ping" />
                                  </div>
                                )}

                                {item.state === 'PENDING' && (
                                  <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  </div>
                                )}

                                {/* Bottom connector */}
                                {!isLast && (
                                  <div
                                    className={`absolute top-5 sm:top-6 bottom-0 w-0.5 ${
                                      orderSteps[idx + 1]?.state === 'PENDING'
                                        ? 'bg-slate-200'
                                        : 'bg-[#FFC006]'
                                    }`}
                                  />
                                )}
                              </div>

                              {/* Right Column: Predefined Step Title & Predefined Description ONLY (No "Completed" or "Pending" text) */}
                              <div className="min-w-0 pb-3.5 sm:pb-5">
                                <div>
                                  <span
                                    className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-bold ${
                                      isGreen
                                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                        : isYellow && isCurrent
                                        ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-1 sm:ring-2 ring-amber-300/60'
                                        : isYellow
                                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                        : 'bg-slate-50 text-slate-400 border border-slate-200'
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                </div>

                                <p
                                  className={`text-[10.5px] sm:text-xs leading-relaxed mt-0.5 sm:mt-1 ${
                                    isCurrent
                                      ? 'font-bold text-gray-950'
                                      : item.state === 'COMPLETED'
                                      ? 'text-gray-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Footer with Purchased Items Accordion */}
                  <div className="p-3 sm:p-5 bg-slate-50/70 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="text-gray-700 hover:text-gray-950 font-bold flex items-center gap-1"
                    >
                      <span>{isItemsExpanded ? 'Hide Items' : 'View Purchased Items'}</span>
                      {isItemsExpanded ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    </button>

                    <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      {order.items?.length || 0} item(s)
                    </span>
                  </div>

                  {/* Expanded Purchased Items Section */}
                  {isItemsExpanded && (
                    <div className="bg-slate-50 p-3 sm:p-5 border-t border-gray-200/80 space-y-2.5 sm:space-y-3 text-[11px] sm:text-xs">
                      <div className="divide-y divide-gray-200 bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                        {order.items?.map((item) => (
                          <div key={item.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                            <div className="min-w-0">
                              <p className="font-bold text-gray-950 truncate text-[11px] sm:text-xs">{item.productName}</p>
                              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                                Size: <span className="font-semibold text-gray-700">{item.size || 'Standard'}</span> • Color:{' '}
                                <span className="font-semibold text-gray-700">{item.color || 'Default'}</span> • Qty:{' '}
                                {item.quantity}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-gray-950 text-xs sm:text-sm">₹{item.subtotal}</p>
                              <p className="text-[9.5px] sm:text-[10px] text-gray-400">₹{item.unitPrice} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 text-center text-sm font-serif">Loading orders...</div>}>
      <CustomerOrdersContent />
    </Suspense>
  );
}
