'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '../../lib/store';
import { getPrimaryImage } from '../../lib/api';

export default function CartDrawer() {
  const { items, removeItem, clearCart, isOpen, closeCart } = useCartStore();
  const drawerRef = useRef(null);

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0), 0);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        closeCart();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-[999] h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-400 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-900">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-amber-400" />
            <h2 className="font-display text-lg font-bold text-white tracking-wide">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-neutral-300" />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h3>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                Discover extraordinary artworks and add them to your collection.
              </p>
              <Link
                href="/gallery"
                onClick={closeCart}
                className="bg-neutral-900 text-white px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-amber-500 transition-colors"
              >
                Browse Gallery
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {items.map((item) => {
                const img = getPrimaryImage(item);
                return (
                  <div key={item._id} className="p-4 flex gap-4 hover:bg-neutral-50 transition-colors group">
                    {/* Artwork Thumbnail */}
                    <div className="relative w-[80px] h-[90px] flex-shrink-0 bg-neutral-100 overflow-hidden rounded-sm">
                      {img ? (
                        <Image
                          src={img}
                          alt={item.title || 'Artwork'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] text-amber-600 font-semibold tracking-wider uppercase mb-0.5 truncate">
                          {item.artist?.name || 'Unknown Artist'}
                        </p>
                        <h3 className="font-display text-sm font-semibold text-neutral-900 leading-tight line-clamp-2 mb-1">
                          {item.title}
                        </h3>
                        {(item.medium || item.year) && (
                          <p className="text-[11px] text-neutral-400 truncate">
                            {[item.medium, item.year].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-display text-base font-bold text-neutral-900">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                        <Link
                          href={`/artwork/${item._id}`}
                          onClick={closeCart}
                          className="text-[11px] font-semibold text-amber-600 border border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 px-3 py-1 transition-all tracking-wide uppercase"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="self-start mt-1 text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-100 bg-white px-6 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 font-medium">Subtotal</span>
              <span className="font-display text-xl font-bold text-neutral-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-neutral-400">Shipping, taxes, and discounts calculated at checkout.</p>

            {/* Actions */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-4 font-semibold text-sm tracking-widest uppercase transition-colors"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex-1 text-center border border-neutral-300 text-neutral-700 py-3 text-sm font-medium hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all tracking-wide"
              >
                View Full Cart
              </Link>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-red-500 transition-colors px-3 py-3 border border-neutral-200 hover:border-red-200"
                title="Clear cart"
              >
                <Trash2 size={14} />
                <span className="text-xs">Clear</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-neutral-100">
              <span className="text-[10px] text-neutral-400 tracking-wide">🔒 Secure checkout</span>
              <span className="text-[10px] text-neutral-400 tracking-wide">📦 Professionally packed</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
