'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import { useCartStore } from '../../lib/store';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const shipping = items.length > 0 ? 150 : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white">
      <div className="w-28 h-28 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={52} className="text-neutral-300" />
      </div>
      <h2 className="font-display text-3xl font-bold text-neutral-900 mb-3">Your cart is empty</h2>
      <p className="text-neutral-400 mb-8 text-sm">Explore our gallery to discover extraordinary art.</p>
      <Link href="/gallery" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-sm tracking-widest uppercase font-semibold transition-colors">
        Browse Gallery
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-neutral-400 text-sm mb-10">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const img = item.images?.find(i => i.isPrimary)?.url || item.images?.[0]?.url;
              return (
                <div key={item._id} className="bg-white p-5 flex gap-5 border border-neutral-100 hover:border-neutral-200 transition-colors group">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-32 flex-shrink-0 bg-neutral-50 overflow-hidden rounded-sm">
                    {img && (
                      <Image
                        src={img}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="112px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold tracking-wider uppercase mb-1">
                        {item.artist?.name}
                      </p>
                      <h3 className="font-display font-semibold text-lg leading-tight text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {[item.medium, item.year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        href={`/artwork/${item._id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 border border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 px-3 py-1.5 transition-all tracking-wide uppercase"
                      >
                        <Eye size={12} />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="font-display text-xl font-bold text-neutral-900">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className="text-sm text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1.5 mt-2"
            >
              <Trash2 size={14} /> Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-neutral-100 p-6 h-fit sticky top-24">
            <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping & Handling</span>
                <span>₹{shipping}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span className="font-display">Total</span>
                <span className="font-display text-amber-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 mt-8 bg-amber-500 hover:bg-amber-600 text-white py-4 font-semibold text-sm tracking-widest uppercase transition-colors"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link
              href="/gallery"
              className="text-center text-sm text-neutral-500 hover:text-neutral-900 mt-4 flex items-center justify-center gap-1 transition-colors"
            >
              ← Continue Shopping
            </Link>

            <div className="mt-6 pt-5 border-t space-y-1">
              <p className="text-xs text-neutral-400 text-center">🔒 Secure SSL encrypted checkout</p>
              <p className="text-xs text-neutral-400 text-center">📦 All artworks professionally packed & insured</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
