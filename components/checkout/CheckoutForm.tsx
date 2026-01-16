'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import IndianAddressForm from './IndianAddressForm';
import toast from 'react-hot-toast';
import { Home, Briefcase, User, Mail, Phone } from 'lucide-react';

export default function CheckoutForm() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
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

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
        <button onClick={() => router.push('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof formData]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleAddressChange = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
    // Clear errors for changed fields
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

    // Save to localStorage for WhatsApp message
    localStorage.setItem('checkoutInfo', JSON.stringify(formData));
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'UPI') {
      router.push(`/payment/upi?amount=${getTotalPrice()}`);
    } else {
      // COD Order
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customer: formData,
            paymentMethod: 'COD',
            total: getTotalPrice(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          clearCart();
          router.push(`/order-success?orderId=${data.orderId}`);
        } else {
          toast.error('Failed to place order');
        }
      } catch (error) {
        toast.error('Failed to place order');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gradient p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gradient">Delivery Information</h2>
            <form onSubmit={handleSubmitAddress} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
                          errors.name
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
                      errors.mobile
                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.mobile && (
                    <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
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
              <div className="pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'home' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.addressType === 'home'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Home className={`w-6 h-6 mx-auto mb-2 ${
                      formData.addressType === 'home' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                    <p className="text-sm font-semibold">Home</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'work' })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.addressType === 'work'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                      formData.addressType === 'work' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                    <p className="text-sm font-semibold">Work</p>
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary btn-glow"
              >
                Continue to Payment
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setStep(1)}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        <OrderSummary items={items} total={getTotalPrice()} />
      </div>
    </div>
  );
}
