'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import IndianAddressForm from './IndianAddressForm';
import AuthModal from '@/components/auth/AuthModal';
import { calculateShipping } from '@/lib/enhanced-products';
import toast from 'react-hot-toast';
import { Home, Briefcase, User, Mail, Phone, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'funprints_checkout_draft';

export default function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    buildingNumber: '',
    landmark: '',
    pincode: '',
    district: '',
    state: '',
    city: '',
    addressType: 'home' as 'home' | 'work',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [customer, setCustomer] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Manual UPI form details
  const [upiDetails, setUpiDetails] = useState({
    payerName: '',
    payerPhone: '',
    transactionRef: '',
    paymentDateTime: new Date().toISOString().slice(0, 16),
  });

  // 1. Restore draft on initial mount
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY) || localStorage.getItem('checkoutInfo');
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        const savedForm = parsed.formData || parsed;
        if (savedForm && typeof savedForm === 'object') {
          const hasAnyData = Object.values(savedForm).some(
            (v) => typeof v === 'string' && v.trim().length > 0
          );
          if (hasAnyData) {
            setFormData((prev) => ({
              ...prev,
              ...savedForm,
            }));
            if (parsed.paymentMethod && ['COD', 'UPI'].includes(parsed.paymentMethod)) {
              setPaymentMethod(parsed.paymentMethod);
            }
            if (parsed.upiDetails && typeof parsed.upiDetails === 'object') {
              setUpiDetails((prev) => ({
                ...prev,
                ...parsed.upiDetails,
              }));
            }
            setIsDraftRestored(true);
            setLastSavedTime(parsed.lastSavedAt || new Date().toISOString());
            toast.success('Saved draft restored! Your address details are loaded.', {
              id: 'draft-restored',
              duration: 3500,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to restore checkout draft:', e);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  // 2. Auto-save draft on user entry
  useEffect(() => {
    if (!draftLoaded) return;

    const hasAnyData = Object.values(formData).some(
      (v) => typeof v === 'string' && v.trim().length > 0
    );
    if (hasAnyData) {
      try {
        const now = new Date().toISOString();
        const draftPayload = {
          formData,
          paymentMethod,
          upiDetails,
          step,
          lastSavedAt: now,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
        localStorage.setItem('checkoutInfo', JSON.stringify(formData));
        setLastSavedTime(now);
      } catch (e) {
        console.warn('Failed to save checkout draft:', e);
      }
    }
  }, [formData, paymentMethod, upiDetails, step, draftLoaded]);

  // 3. Online/offline connection handling
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet reconnected. Your address draft is safely loaded.', {
        id: 'network-status',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('Network disconnected. Your filled address is safely saved locally.', {
        icon: '💾',
        id: 'network-status',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to top when switching steps (e.g. Address to Payment or Back)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [step]);

  // Fetch logged in customer
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.customer) {
          setCustomer(data.customer);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || data.customer.fullName || '',
            email: prev.email || data.customer.email || '',
            mobile: prev.mobile || data.customer.phone || '',
          }));
          setUpiDetails((prev) => ({
            ...prev,
            payerName: prev.payerName || data.customer.fullName || '',
            payerPhone: prev.payerPhone || data.customer.phone || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem('checkoutInfo');
      setFormData({
        name: customer?.fullName || '',
        email: customer?.email || '',
        mobile: customer?.phone || '',
        buildingNumber: '',
        landmark: '',
        pincode: '',
        district: '',
        state: '',
        city: '',
        addressType: 'home',
      });
      setUpiDetails({
        payerName: customer?.fullName || '',
        payerPhone: customer?.phone || '',
        transactionRef: '',
        paymentDateTime: new Date().toISOString().slice(0, 16),
      });
      setIsDraftRestored(false);
      setLastSavedTime(null);
      toast.success('Address draft cleared');
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <p className="text-lg sm:text-xl text-gray-600 mb-4">Your cart is empty</p>
        <button onClick={() => router.push('/products')} className="btn-primary text-xs sm:text-sm">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof formData]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleAddressChange = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      delete newErrors[key as keyof typeof formData];
    });
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};

    // Personal details validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    // Address validation
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'PIN code must be 6 digits';
    }
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.city.trim()) newErrors.city = 'City/Area is required';
    if (!formData.buildingNumber.trim()) newErrors.buildingNumber = 'Building address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!customer) {
      setShowAuthModal(true);
      toast('Please log in or create an account to continue checkout', {
        icon: '🔒',
      });
      return;
    }

    // Pre-fill UPI details if empty
    setUpiDetails((prev) => ({
      ...prev,
      payerName: prev.payerName || formData.name,
      payerPhone: prev.payerPhone || formData.mobile,
    }));

    // Save to localStorage
    const now = new Date().toISOString();
    const draftPayload = {
      formData,
      paymentMethod,
      upiDetails,
      step: 2,
      lastSavedAt: now,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
    localStorage.setItem('checkoutInfo', JSON.stringify(formData));
    setLastSavedTime(now);
    setStep(2);
  };

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal, formData.state || 'Tamil Nadu');
  const finalTotal = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!customer) {
      setShowAuthModal(true);
      toast.error('Please log in or register to place your order');
      return;
    }

    if (paymentMethod === 'UPI') {
      if (!upiDetails.payerName.trim()) {
        toast.error('Please enter customer UPI name');
        return;
      }
      if (!upiDetails.payerPhone.trim() || !/^\d{10}$/.test(upiDetails.payerPhone.trim())) {
        toast.error('Please enter a valid 10-digit UPI/mobile number');
        return;
      }
      const cleanRef = upiDetails.transactionRef.trim();
      if (!cleanRef || !/^[a-zA-Z0-9]{6,30}$/.test(cleanRef)) {
        toast.error('Please enter a valid UPI Transaction ID / 12-digit UTR');
        return;
      }
      if (!upiDetails.paymentDateTime) {
        toast.error('Please select the payment date and time');
        return;
      }
    }

    setSubmittingOrder(true);

    const orderData = {
      items,
      customer: {
        ...formData,
        customerId: customer.id,
      },
      paymentMethod,
      total: finalTotal,
      paymentDetails: paymentMethod === 'UPI' ? {
        ...upiDetails,
        transactionRef: upiDetails.transactionRef.trim(),
        payerName: upiDetails.payerName.trim(),
        payerPhone: upiDetails.payerPhone.trim(),
      } : undefined,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to place order');
        setSubmittingOrder(false);
        return;
      }

      // If manual UPI, also post to /api/payments/submit to ensure tracking
      if (paymentMethod === 'UPI') {
        try {
          await fetch('/api/payments/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              transactionRef: upiDetails.transactionRef.trim(),
              payerName: upiDetails.payerName.trim(),
              payerPhone: upiDetails.payerPhone.trim(),
              paymentDate: upiDetails.paymentDateTime,
            }),
          });
        } catch (e) {
          // Handled gracefully as order already contains details
        }
      }

      clearCart();
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem('checkoutInfo');
      setIsDraftRestored(false);
      setLastSavedTime(null);

      if (paymentMethod === 'UPI') {
        toast.success('Order placed! Payment details submitted for verification.');
        router.push(`/order-success?orderId=${data.orderId}&payment=UPI`);
      } else {
        toast.success('Order placed successfully with Cash on Delivery!');
        router.push(`/order-success?orderId=${data.orderId}`);
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <div className="lg:col-span-2">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950">Delivery Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your address details are auto-saved as a draft
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(isDraftRestored || lastSavedTime) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved Draft</span>
                  </span>
                )}
                {(formData.name || formData.pincode || formData.buildingNumber || formData.mobile) && (
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-[11px] font-semibold text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                    title="Clear saved draft address"
                  >
                    Clear Draft
                  </button>
                )}
              </div>
            </div>

            {!isOnline && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are currently offline. Your entered address is safely saved on this device and will be ready when you reconnect.</span>
              </div>
            )}

            <form onSubmit={handleSubmitAddress} className="space-y-4 sm:space-y-6">
              {/* Personal Details */}
              <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-full bg-gray-900 text-white">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
                        errors.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      }`}
                      placeholder="Surya Kumar"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      }`}
                      placeholder="surya@gmail.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
                      errors.mobile
                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                  )}
                </div>
              </div>

              {/* Indian Address Form */}
              <IndianAddressForm
                formData={formData}
                onChange={handleAddressChange}
                errors={errors}
              />

              {/* Address Type */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'home' })}
                    className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                      formData.addressType === 'home'
                        ? 'border-gray-900 bg-gray-50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Home className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                      formData.addressType === 'home' ? 'text-gray-950' : 'text-gray-500'
                    }`} />
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Home</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'work' })}
                    className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                      formData.addressType === 'work'
                        ? 'border-gray-900 bg-gray-50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                      formData.addressType === 'work' ? 'text-gray-950' : 'text-gray-500'
                    }`} />
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Work</p>
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3 sm:py-3.5 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 text-xs sm:text-sm"
              >
                Continue to Payment
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            totalAmount={finalTotal}
            upiDetails={upiDetails}
            setUpiDetails={setUpiDetails}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setStep(1)}
            isSubmitting={submittingOrder}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        <OrderSummary 
          items={items} 
          total={subtotal} 
          shippingState={formData.state || "Tamil Nadu"} 
        />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(cust) => {
          setCustomer(cust);
          setFormData((prev) => ({
            ...prev,
            name: cust.fullName || prev.name,
            email: cust.email || prev.email,
            mobile: cust.phone || prev.mobile,
          }));
          setUpiDetails((prev) => ({
            ...prev,
            payerName: cust.fullName || prev.payerName,
            payerPhone: cust.phone || prev.payerPhone,
          }));
          toast.success('Account verified! You can now proceed to payment.');
          setStep(2);
        }}
      />
    </div>
  );
}
