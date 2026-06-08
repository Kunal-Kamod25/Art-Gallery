'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette, DollarSign, ShoppingCart, TrendingUp, Plus, Eye, BarChart3, Star, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function ArtistDashboard() {
  const [stats, setStats] = useState({
    totalArtworks: 0,
    soldArtworks: 0,
    totalRevenue: 0,
    recentSales: []
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'artist') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const statsRes = await api.get('/orders/artist/stats');
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      setStats({
        totalArtworks: 0,
        soldArtworks: 0,
        totalRevenue: 0,
        recentSales: []
      });
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-4xl font-bold">Artist Dashboard</h1>
          <Link href="/admin/artworks" className="btn-primary text-sm tracking-widest uppercase flex items-center gap-2">
            <Plus size={16} /> Add Artwork
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 border border-neutral-100">
            <div className="flex items-center gap-3">
              <Palette className="text-amber-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Total Artworks</p>
                <p className="text-3xl font-bold">{stats.totalArtworks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border border-neutral-100">
            <div className="flex items-center gap-3">
              <ShoppingCart className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Sold Artworks</p>
                <p className="text-3xl font-bold">{stats.soldArtworks}</p>
              </div>
            </div>
          </div>
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
              <TrendingUp className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-wider">Avg Price</p>
                <p className="text-3xl font-bold">₹{stats.totalArtworks > 0 ? Math.round(stats.totalRevenue / stats.totalArtworks).toLocaleString('en-IN') : 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/admin/artworks" className="bg-white p-6 border border-neutral-100 hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="text-amber-500" size={20} />
              <h3 className="font-semibold">Manage Artworks</h3>
            </div>
            <p className="text-sm text-neutral-600">Add, edit, or remove your artworks</p>
          </Link>
          <Link href="/artist/sales" className="bg-white p-6 border border-neutral-100 hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="text-blue-500" size={20} />
              <h3 className="font-semibold">View Sales</h3>
            </div>
            <p className="text-sm text-neutral-600">Track sales and see who bought your art</p>
          </Link>
          <Link href="/profile" className="bg-white p-6 border border-neutral-100 hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-green-500" size={20} />
              <h3 className="font-semibold">Profile Settings</h3>
            </div>
            <p className="text-sm text-neutral-600">Update your artist profile and bio</p>
          </Link>
        </div>

        {/* Recent Sales */}
        <div className="bg-white border border-neutral-100 p-6">
          <h2 className="font-display text-2xl font-bold mb-6">Recent Sales</h2>
          {stats.recentSales.length === 0 ? (
            <p className="text-neutral-500">No sales yet. Start by adding artworks!</p>
          ) : (
            <div className="space-y-4">
              {stats.recentSales.map(order => (
                <div key={order._id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-neutral-500">
                      {order.orderItems.filter(item => item.artwork).map(item => item.artwork.title).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.totalPrice}</p>
                    <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}