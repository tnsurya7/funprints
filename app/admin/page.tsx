'use client';

import AuthGuard from '@/components/admin/AuthGuard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image_url: string;
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
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.payment_status === 'PENDING').length,
    processing: orders.filter(o => o.order_status === 'PROCESSING').length,
    completed: orders.filter(o => o.order_status === 'COMPLETED').length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage orders and payments</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <div key={order.order_id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-lg">{order.order_id}</p>
                        <p className="text-sm text-gray-600">{order.customer_name} • {order.customer_mobile}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-purple-600">₹{order.total_amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.payment_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
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
    </AuthGuard>
  );
}
