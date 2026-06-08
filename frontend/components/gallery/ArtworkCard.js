'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '../../lib/store';
import { getPrimaryImage } from '../../lib/api';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ArtworkCard({ artwork }) {
  const addItem = useCartStore(s => s.addItem);
  const items = useCartStore(s => s.items);
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();
  const { user, openAuthModal } = useAuthStore();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const inCart = items.some(i => i._id === artwork._id);
  const primaryImage = getPrimaryImage(artwork);

  useEffect(() => {
    if (user) {
      fetchWishlist().then(() => {
        setInWishlist(isInWishlist(artwork._id));
      }).catch(err => console.error('Wishlist fetch error:', err));
    }
  }, [user?._id]);

  useEffect(() => {
    setInWishlist(isInWishlist(artwork._id));
  }, [artwork._id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      openAuthModal('cart');
      return;
    }

    if (!artwork.isAvailable) return toast.error('This artwork is not available');
    addItem(artwork); // store now auto-opens drawer
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal('wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      const added = await toggleWishlist(artwork._id);
      setInWishlist(added);
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="artwork-card group bg-white border border-neutral-100 card-hover relative flex flex-col">
      <Link href={`/artwork/${artwork._id}`} className="block">
        <div className="relative overflow-hidden aspect-[4/5] bg-neutral-100">
          {primaryImage ? (
            <Image src={primaryImage} alt={artwork.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
          )}

          {/* Overlay with Quick View */}
          <div className="artwork-overlay absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-4 py-2 tracking-widest uppercase border border-white/30 hover:bg-white hover:text-neutral-900 transition-all flex items-center gap-1.5">
              <Eye size={14} /> Quick View
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {artwork.isFeatured && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 font-medium tracking-wide">Featured</span>
            )}
            {!artwork.isAvailable && (
              <span className="bg-neutral-800 text-white text-xs px-2 py-0.5 font-medium tracking-wide">Sold</span>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all disabled:opacity-50"
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              className={`transition-all ${inWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600 hover:text-red-500'}`}
            />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-amber-600 tracking-widest uppercase font-medium mb-1">
            {artwork.artist?.name || 'Unknown Artist'}
          </p>
          <h3 className="font-display text-lg font-semibold text-neutral-900 leading-tight mb-1 line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-xs text-neutral-400 mb-3">{artwork.medium} · {artwork.year}</p>
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-neutral-900">
              ₹{artwork.price?.toLocaleString('en-IN')}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!artwork.isAvailable || inCart}
              className={`p-2 transition-all ${
                inCart ? 'text-amber-500 bg-amber-50' :
                artwork.isAvailable ? 'hover:text-amber-500 hover:bg-amber-50' : 'opacity-30 cursor-not-allowed'
              }`}
              title={inCart ? 'In cart' : 'Add to cart'}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </Link>

      {/* View Details Button */}
      <div className="px-4 pb-4 mt-auto">
        <Link
          href={`/artwork/${artwork._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-neutral-200 text-neutral-700 text-xs font-semibold tracking-widest uppercase hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
        >
          <Eye size={13} />
          View Details
        </Link>
      </div>
    </div>
  );
}
