'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Users, Palette, TrendingUp, Plus, Settings, LogOut, BarChart3 } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
    Promise.all([
      api.get('/orders/admin/stats'),
      api.get('/artworks?limit=8&sort=newest'),
      api.get('/artists?limit=4'),
    ]).then(([statsRes, artRes]) => {
      setStats(statsRes.data.stats);
      setArtworks(artRes.data.artworks);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { icon: Package, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: TrendingUp, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Palette, label: 'Total Artworks', value: artworks?.length || '—', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Users, label: 'Pending Orders', value: stats?.ordersByStatus?.find(s => s._id === 'pending')?.count || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-neutral-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-600 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white border border-neutral-100 p-6">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <div className="font-display text-2xl font-bold text-neutral-900">{value}</div>
              <div className="text-sm text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            { href: '/admin/artworks', icon: Palette, label: 'Manage Artworks', desc: 'Add, edit, or remove artworks', color: 'bg-purple-600' },
            { href: '/admin/artists', icon: Users, label: 'Manage Artists', desc: 'Artist profiles and portfolios', color: 'bg-blue-600' },
            { href: '/admin/orders', icon: Package, label: 'Manage Orders', desc: 'Track and update order status', color: 'bg-green-600' },
          ].map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href} className="bg-white border border-neutral-100 p-6 hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${color} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{label}</h3>
              <p className="text-sm text-neutral-400">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Artworks */}
        <div className="bg-white border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Recent Artworks</h2>
            <Link href="/admin/artworks" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {['Title', 'Artist', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {artworks.map(a => (
                  <tr key={a._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 pr-4 font-medium">{a.title}</td>
                    <td className="py-3 pr-4 text-neutral-500">{a.artist?.name}</td>
                    <td className="py-3 pr-4 font-medium">₹{a.price?.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 font-medium ${a.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {a.isAvailable ? 'Available' : 'Sold'}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href={`/artwork/${a._id}`} className="text-amber-600 hover:underline text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        {stats?.recentOrders?.length > 0 && (
          <div className="bg-white border border-neutral-100 p-6 mt-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {stats.recentOrders.map(o => (
                <div key={o._id} className="flex justify-between items-center py-2 border-b border-neutral-50">
                  <div>
                    <p className="font-medium text-sm">{o.user?.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">#{o._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{o.totalPrice?.toLocaleString('en-IN')}</p>
                    <p className={`text-xs capitalize ${o.orderStatus === 'delivered' ? 'text-green-600' : o.orderStatus === 'pending' ? 'text-yellow-600' : 'text-blue-600'}`}>{o.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
