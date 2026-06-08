'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Heart, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function AuthModal() {
  const { authModal, closeAuthModal } = useAuthStore();
  const modalRef = useRef(null);

  const isOpen = authModal?.isOpen;
  const reason = authModal?.reason || 'cart'; // 'cart' | 'wishlist'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeAuthModal(); };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  const isCart = reason === 'cart';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-[#0b0f1a]/80 backdrop-blur-xl transition-all duration-500"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-[2.5rem] overflow-hidden glass-card border-white/5 bg-white/[0.03] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        style={{
          animation: 'modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all group"
        >
          <X size={18} className="text-neutral-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
        </button>

        {/* Top Content */}
        <div className="px-8 pt-12 pb-8 text-center relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-md">
              {isCart
                ? <ShoppingBag size={32} className="text-amber-500" />
                : <Heart size={32} className="text-amber-500" />
              }
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3 tracking-tight">
              {isCart ? 'Collector Account' : 'Save to Wishlist'}
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px] mx-auto">
              {isCart
                ? 'Sign in to add this masterpiece to your cart and complete your collection.'
                : 'Join the community to save this artwork and receive updates from the artist.'
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-12 pt-4 space-y-4 relative z-10">
          <Link
            href="/auth/register"
            onClick={closeAuthModal}
            className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white py-4 font-bold text-xs tracking-[0.15em] uppercase transition-all rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Sparkles size={18} className="relative z-10" />
            <span className="relative z-10">Create Free Account</span>
          </Link>
          
          <Link
            href="/auth/login"
            onClick={closeAuthModal}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 font-bold text-xs tracking-[0.15em] uppercase transition-all rounded-2xl active:scale-[0.98]"
          >
            Sign In <ArrowRight size={18} className="text-neutral-500" />
          </Link>

          <button
            onClick={closeAuthModal}
            className="w-full text-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-amber-500 transition-colors pt-4"
          >
            Not now, just browsing
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
