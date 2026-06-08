'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore, useWishlistStore } from '../../lib/store';
import ArtworkCard from '../../components/gallery/ArtworkCard';

export default function WishlistPage() {
  const [wishlistArtworks, setWishlistArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { fetchWishlist, wishlist } = useWishlistStore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const loadWishlist = async () => {
      try {
        setLoading(true);
        // Fetch wishlist items
        const wishlistRes = await fetchWishlist();
        
        if (wishlistRes && wishlistRes.length > 0) {
          // Fetch all artworks and filter by wishlist IDs
          const artworksRes = await api.get('/artworks?limit=100');
          const allArtworks = artworksRes.data.artworks || [];
          
          // Filter to get only wishlist items
          const wishlistIds = wishlistRes.map(item => item._id || item);
          const filtered = allArtworks.filter(artwork => 
            wishlistIds.includes(artwork._id)
          );
          
          setWishlistArtworks(filtered);
        } else {
          setWishlistArtworks([]);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setWishlistArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user?._id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Sign in to view wishlist</h2>
          <Link href="/auth/login" className="btn-primary text-sm tracking-widest uppercase">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <Link href="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-4xl font-bold">My Wishlist</h1>
          <Link href="/gallery" className="btn-primary text-sm tracking-widest uppercase flex items-center gap-2">
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : wishlistArtworks.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-neutral-200 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2 text-neutral-500">Your wishlist is empty</h2>
            <p className="text-neutral-600 mb-6">Start adding artworks to your wishlist!</p>
            <Link href="/gallery" className="btn-primary text-sm tracking-widest uppercase inline-block">
              Explore Gallery
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-neutral-600 mb-8">{wishlistArtworks.length} artwork{wishlistArtworks.length !== 1 ? 's' : ''} in your wishlist</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistArtworks.map(artwork => (
                <ArtworkCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
