'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User, Heart, Search } from 'lucide-react';
import { useAuthStore, useCartStore } from '../../lib/store';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore(s => s.count());
  const toggleCart = useCartStore(s => s.toggleCart);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navClass = isHome && !scrolled
    ? 'fixed top-0 left-0 right-0 z-50 bg-transparent text-white'
    : 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm text-neutral-900 shadow-sm';

  const links = [
    { href: '/gallery', label: 'Gallery' },
    { href: '/artists', label: 'Artists' },
    { href: '/gallery?featured=true', label: 'Featured' },
  ];

  return (
    <>
      <nav className={`${navClass} transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-bold tracking-wider">
            LUMINARY
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium tracking-widest uppercase hover:text-amber-500 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-amber-500 transition-colors">
              <Search size={20} />
            </button>

            {/* Cart Icon → opens drawer */}
            <button
              onClick={toggleCart}
              className="relative hover:text-amber-500 transition-colors p-1"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <Link href="/wishlist" className="hover:text-amber-500 transition-colors" title="Wishlist">
              <Heart size={20} />
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <User size={20} />
                  <span className="hidden md:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl border border-neutral-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-b">Admin Panel</Link>
                  )}
                  {user.role === 'artist' && (
                    <Link href="/artist" className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-b">Artist Studio</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-b">My Profile</Link>
                  <Link href="/orders" className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-b">My Orders</Link>
                  <Link href="/wishlist" className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50">Wishlist</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-amber-500 transition-colors">
                <User size={18} /> Sign In
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3">
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/gallery?search=${searchQuery}`; }}>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks, artists..."
                className="w-full bg-transparent border-b border-current pb-2 focus:outline-none text-inherit placeholder-current/60 text-sm tracking-wide"
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white text-neutral-900 border-t shadow-lg">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block px-6 py-4 text-sm font-medium tracking-wider border-b border-neutral-100 hover:bg-neutral-50">
                {l.label}
              </Link>
            ))}
            {user?.role === 'artist' && (
              <Link href="/artist" onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-sm font-medium">
                Artist Studio
              </Link>
            )}
            {!user && (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-6 py-4 text-sm font-medium">
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Global Cart Drawer */}
      <CartDrawer />

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
}
