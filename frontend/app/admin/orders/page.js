'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const STATUS_COLORS = { pending:'text-yellow-700 bg-yellow-50', confirmed:'text-blue-700 bg-blue-50', processing:'text-purple-700 bg-purple-50', shipped:'text-indigo-700 bg-indigo-50', delivered:'text-green-700 bg-green-50', cancelled:'text-red-700 bg-red-50' };

export default function AdminOrders() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    api.get('/orders/admin/all').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: status });
      setOrders(orders.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-10 h-10 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-neutral-400 hover:text-neutral-900"><ArrowLeft size={20} /></Link>
          <h1 className="font-display text-3xl font-bold">Manage Orders</h1>
          <span className="ml-2 text-sm text-neutral-400">{orders.length} total orders</span>
        </div>

        <div className="bg-white border border-neutral-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>{['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-xs text-neutral-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-bold">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select value={order.orderStatus}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 border-0 rounded focus:outline-none cursor-pointer ${STATUS_COLORS[order.orderStatus] || 'bg-neutral-100'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/orders`} className="text-amber-600 text-xs hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-12 text-neutral-400">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
