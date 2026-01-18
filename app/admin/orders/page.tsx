'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, TrendingUp, ArrowLeft, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    product_variants: {
      color: string;
      size: string;
      products: {
        name: string;
        category: string;
      };
    };
  }>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

  const updateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      
      if (res.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'printing': return 'bg-yellow-100 text-yellow-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['CREATED', 'CONFIRMED', 'PRINTING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
  const paymentStatusOptions = ['PENDING', 'UPLOADED', 'VERIFIED', 'FAILED'];

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => 
    order.order_status.toLowerCase() === filter.toLowerCase()
  );

  const orderCounts = {
    all: orders.length,
    created: orders.filter(o => o.order_status === 'CREATED').length,
    confirmed: orders.filter(o => o.order_status === 'CONFIRMED').length,
    printing: orders.filter(o => o.order_status === 'PRINTING').length,
    dispatched: orders.filter(o => o.order_status === 'DISPATCHED').length,
    delivered: orders.filter(o => o.order_status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(orderCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Order #{order.order_code}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    ₹{order.total_amount}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_email}</p>
                  <p className="text-sm text-gray-600">{order.customer_mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium">
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Products</p>
                <div className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>
                        {item.product_variants.products.name} - {item.product_variants.color} ({item.product_variants.size})
                      </span>
                      <span className="font-medium">
                        {item.quantity} × ₹{item.unit_price} = ₹{item.quantity * item.unit_price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex gap-2">
                  <select
                    value={order.order_status}
                    onChange={(e) => updateOrderStatus(order.order_code, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={order.payment_status}
                    onChange={(e) => updateOrderStatus(order.order_code, order.order_status, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {paymentStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/admin/orders/${order.order_code}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {order.payment_method === 'UPI' && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Package className="w-4 h-4" />
                    Print File
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">No orders found</p>
            <p className="text-gray-500">
              {filter === 'all' ? 'No orders have been placed yet' : `No ${filter} orders found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}