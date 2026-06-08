'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, User, Calendar, DollarSign, Eye } from 'lucide-react';
import api from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function ArtistSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgPrice: 0
  });
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'artist') {
      fetchSalesData();
    }
  }, [user]);

  const fetchSalesData = async () => {
    try {
      const res = await api.get('/orders/artist/stats');
      const recentSales = res.data.stats.recentSales || [];
      setSales(recentSales);
      setStats({
        totalRevenue: res.data.stats.totalRevenue,
        totalSales: recentSales.length,
        avgPrice: recentSales.length > 0 ? Math.round(res.data.stats.totalRevenue / recentSales.length) : 0
      });
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'artist') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-neutral-500 mb-6">This page is for artists only.</p>
          <Link href="/" className="btn-primary text-sm tracking-widest uppercase">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <Link href="/artist" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="font-display text-4xl font-bold mb-10">Sales & Customers</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 border border-neutral-100">
            <div className="flex items-center gap-3">
              <DollarSign className="text-blue-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border border-neutral-100">
            <div className="flex items-center gap-3">
              <Package className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Total Sales</p>
                <p className="text-3xl font-bold">{stats.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border border-neutral-100">
            <div className="flex items-center gap-3">
              <Eye className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Avg Sale Price</p>
                <p className="text-3xl font-bold">₹{stats.avgPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border border-neutral-100">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-display text-2xl font-bold">Recent Sales</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">No sales yet</h3>
              <p className="text-neutral-600">Your artworks haven't been purchased yet. Keep creating!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="text-left p-4 font-medium text-neutral-600">Customer</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Artwork</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Price</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Date</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-neutral-900">{sale.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-neutral-500">{sale.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          {sale.orderItems?.map((item, idx) => (
                            <p key={idx} className="text-neutral-700 truncate">
                              {item.artwork?.title || 'Artwork'}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-neutral-900">₹{sale.totalPrice?.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-neutral-600">
                          {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-3 py-1 rounded capitalize ${STATUS_STYLES[sale.orderStatus] || 'bg-neutral-100'}`}>
                          {sale.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {sales.length > 0 && (
          <div className="mt-10 bg-white border border-neutral-100 p-6">
            <h3 className="font-display text-lg font-bold mb-4">Top Selling Artworks</h3>
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-700">{idx + 1}. {sale.orderItems?.[0]?.artwork?.title}</span>
                  <span className="font-medium">₹{sale.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
