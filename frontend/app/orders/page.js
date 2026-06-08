'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    api.get('/orders/my-orders').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <h2 className="font-display text-2xl mb-4">Sign in to view your orders</h2>
        <Link href="/auth/login" className="btn-primary text-sm tracking-widest uppercase">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold mb-10">My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white h-28 animate-pulse border" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="text-neutral-200 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2 text-neutral-500">No orders yet</h2>
            <Link href="/gallery" className="btn-primary text-sm tracking-widest uppercase mt-4 inline-block">Start Collecting</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white border border-neutral-100 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-xs text-neutral-400 font-mono mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 border capitalize tracking-wider ${STATUS_STYLES[order.orderStatus] || 'bg-neutral-100'}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-neutral-600">₹{item.price?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="font-display text-lg font-bold">Total: ₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                  {order.trackingNumber && (
                    <p className="text-xs text-neutral-500">Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
