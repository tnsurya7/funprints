'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image: string;
  }>;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.paymentStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    completed: orders.filter(o => o.orderStatus === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and payments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-brand-100 rounded-lg">
                <Package className="w-6 h-6 text-brand-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/products" className="card p-6 hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold mb-2">👕 Manage Products</h3>
            <p className="text-gray-600">Upload images, change prices, manage stock</p>
          </Link>

          <Link href="/admin/orders" className="card p-6 hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold mb-2">📦 Manage Orders</h3>
            <p className="text-gray-600">View and update order status</p>
          </Link>

          <div className="card p-6 hover:shadow-xl transition-all cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">💬 Bulk Enquiries</h3>
            <p className="text-gray-600">Manage bulk order requests</p>
          </div>
        </div>

        {/* Recent Orders */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-lg">{order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.customerName} • {order.customerMobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-purple-600">₹{order.totalAmount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/admin/orders">
              <button className="mt-6 w-full btn-primary">View All Orders</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
