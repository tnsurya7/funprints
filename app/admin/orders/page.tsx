'use client';

import AuthGuard from '@/components/admin/AuthGuard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, XCircle, Download, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  order_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image_url: string;
    logo_url?: string;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders.reverse()); // Latest first
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: Order['order_status'], paymentStatus?: Order['payment_status']) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });

      if (res.ok) {
        toast.success('Order updated!');
        fetchOrders();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.order_status === filter.toUpperCase();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const generatePrintFile = async (order: Order) => {
    try {
      const item = order.items[0];
      if (!item) return;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 3000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load and draw t-shirt image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 3000, 3000);

        // If logo exists, draw it
        if (item.logo_url) {
          const logoImg = new window.Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            // Draw logo on chest area (centered, scaled)
            const logoSize = 800;
            const logoX = (3000 - logoSize) / 2;
            const logoY = 1000; // Chest position
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

            // Download
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `print-${order.order_id}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }, 'image/png');
          };
          logoImg.src = item.logo_url;
        } else {
          // No logo, just download t-shirt
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `print-${order.order_id}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      };
      img.src = item.image_url;
    } catch (error) {
      console.error('Print generation error:', error);
      toast.error('Failed to generate print file');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Orders</h1>
          <p className="text-gray-600">View and update order status</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'processing', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && ` (${orders.filter(o => o.order_status === f.toUpperCase()).length})`}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600 mb-1">{order.order_id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.payment_status.toLowerCase())}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.order_status.toLowerCase())}`}>
                      {order.order_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-lg mb-3">👤 Customer</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${order.customer_mobile}`} className="hover:text-purple-600">
                          {order.customer_mobile}
                        </a>
                      </div>
                      {order.customer_email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${order.customer_email}`} className="hover:text-purple-600">
                            {order.customer_email}
                          </a>
                        </div>
                      )}
                      <p className="text-gray-600 mt-2">{order.customer_address}</p>
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-gray-500">Payment Method</span>
                        <p className="font-semibold">{order.payment_method}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-lg mb-3">📦 Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">
                              {item.color} • Size: {item.size} • Qty: {item.quantity}
                            </p>
                            <p className="text-lg font-bold text-purple-600 mt-1">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                        <span className="text-lg font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-purple-600">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                  {order.payment_status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.order_id, order.order_status, 'VERIFIED')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Verify Payment
                    </button>
                  )}
                  
                  {order.order_status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'PROCESSING')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      Mark Processing
                    </button>
                  )}
                  
                  {order.order_status === 'PROCESSING' && (
                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'COMPLETED')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Completed
                    </button>
                  )}
                  
                  <button
                    onClick={() => generatePrintFile(order)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Print File
                  </button>

                  <a
                    href={`https://wa.me/${order.customer_mobile}?text=Hi ${order.customer_name}, your order ${order.order_id} update...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}
