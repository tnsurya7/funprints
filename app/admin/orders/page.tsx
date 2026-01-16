'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, XCircle, Download, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'verified' | 'failed';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image: string;
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
      const res = await fetch('/api/orders');
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

  const updateOrderStatus = async (orderId: string, orderStatus: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    return order.orderStatus === filter;
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

  return (
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
              {f !== 'all' && ` (${orders.filter(o => o.orderStatus === f).length})`}
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
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600 mb-1">{order.orderId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-lg mb-3">👤 Customer</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${order.customerMobile}`} className="hover:text-purple-600">
                          {order.customerMobile}
                        </a>
                      </div>
                      {order.customerEmail && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${order.customerEmail}`} className="hover:text-purple-600">
                            {order.customerEmail}
                          </a>
                        </div>
                      )}
                      <p className="text-gray-600 mt-2">{order.customerAddress}</p>
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-gray-500">Payment Method</span>
                        <p className="font-semibold">{order.paymentMethod}</p>
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
                            {item.image ? (
                              <Image
                                src={item.image}
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
                        <span className="text-2xl font-bold text-purple-600">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                  {order.paymentStatus === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, order.orderStatus, 'verified')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Verify Payment
                    </button>
                  )}
                  
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'processing')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      Mark Processing
                    </button>
                  )}
                  
                  {order.orderStatus === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'completed')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Completed
                    </button>
                  )}
                  
                  <button
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Print File
                  </button>

                  <a
                    href={`https://wa.me/${order.customerMobile}?text=Hi ${order.customerName}, your order ${order.orderId} update...`}
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
  );
}
