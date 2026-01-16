'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download } from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('ALL');

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-green-100 text-green-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    DISPATCHED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // API call to update status
    console.log('Updating order', orderId, 'to', newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Orders Management</h1>
            <p className="text-gray-600">View and manage all orders</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Orders
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'NEW', 'PAYMENT_PENDING', 'VERIFIED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerMobile}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.totalAmount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}
                        >
                          <option value="NEW">New</option>
                          <option value="PAYMENT_PENDING">Payment Pending</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DISPATCHED">Dispatched</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.createdAt}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-brand-600 hover:text-brand-700 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
