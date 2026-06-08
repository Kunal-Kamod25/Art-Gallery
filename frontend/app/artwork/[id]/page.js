'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, Heart, ArrowLeft, Award, Ruler, Tag,
  Star, CheckCircle, Package, Share2, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewCard from '../../../components/gallery/ReviewCard';
import ReviewForm from '../../../components/gallery/ReviewForm';
import api from '../../../lib/api';
import { useCartStore, useAuthStore, useWishlistStore } from '../../../lib/store';
import { getPrimaryImage, getAllImages } from '../../../lib/api';

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { addItem, items } = useCartStore();
  const { user, openAuthModal } = useAuthStore();
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();
  const inCart = items.some(i => i._id === id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, revRes] = await Promise.all([
          api.get(`/artworks/${id}`),
          api.get(`/reviews/artwork/${id}`)
        ]);
        setArtwork(artRes.data.artwork);
        setReviews(revRes.data.reviews);
      } catch {
        router.push('/gallery');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchWishlist().then(() => {
        setInWishlist(isInWishlist(id));
      }).catch(() => {});
    }
  }, [user?._id, id]);

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('cart');
      return;
    }
    if (!artwork.isAvailable) return toast.error('This artwork is sold');
    addItem(artwork); // auto-opens drawer
    toast.success(`"${artwork.title}" added to cart!`);
  };

  const handleWishlist = async () => {
    if (!user) {
      openAuthModal('wishlist');
      return;
    }
    setWishlistLoading(true);
    try {
      const added = await toggleWishlist(artwork._id);
      setInWishlist(added);
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: artwork.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
  if (!artwork) return null;

  const allImages = getAllImages(artwork);
  const primaryImage = getPrimaryImage(artwork);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* ─── Images ─── */}
          <div>
            <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden mb-4 rounded-sm">
              <Image
                src={allImages[selectedImage]?.url || primaryImage}
                alt={artwork.title}
                fill
                className="object-contain transition-opacity duration-300"
                priority
              />
              {!artwork.isAvailable && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-white text-neutral-900 px-8 py-3 font-display text-xl font-bold tracking-widest">
                    SOLD
                  </span>
                </div>
              )}
              {artwork.isFeatured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white text-xs px-3 py-1 font-semibold tracking-widest uppercase">
                    Featured
                  </span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, i) => (
                  <button
                    key={img._id || i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 overflow-hidden border-2 transition-all rounded-sm ${
                      i === selectedImage ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Details ─── */}
          <div className="space-y-6">
            {/* Artist & Title */}
            <div>
              <Link
                href={`/artists/${artwork.artist?._id}`}
                className="text-amber-600 text-sm tracking-widest uppercase font-semibold hover:text-amber-700 transition-colors"
              >
                {artwork.artist?.name}
              </Link>
              <h1 className="font-display text-4xl font-bold text-neutral-900 mt-2 leading-tight">
                {artwork.title}
              </h1>
              <p className="text-neutral-400 mt-2 text-sm">
                {artwork.year}{artwork.category?.name ? ` · ${artwork.category.name}` : ''}
              </p>

              {/* Rating summary */}
              {avgRating && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={16}
                        className={s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">{avgRating}</span>
                  <span className="text-sm text-neutral-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="font-display text-4xl font-bold text-neutral-900">
                ₹{artwork.price?.toLocaleString('en-IN')}
              </span>
              {artwork.originalPrice && (
                <span className="text-neutral-400 line-through text-lg">
                  ₹{artwork.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-neutral-600 leading-relaxed text-sm">{artwork.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-neutral-100">
              {[
                { icon: Tag, label: 'Medium', value: artwork.medium },
                {
                  icon: Ruler,
                  label: 'Dimensions',
                  value: artwork.dimensions
                    ? `${artwork.dimensions.width}×${artwork.dimensions.height}${artwork.dimensions.depth ? `×${artwork.dimensions.depth}` : ''} ${artwork.dimensions.unit}`
                    : 'N/A'
                },
                { icon: Award, label: 'Edition', value: artwork.edition },
                { icon: CheckCircle, label: 'Certificate', value: artwork.certificate ? 'Included' : 'Not included' },
              ].map(({ icon: Icon, label, value }) => (
                value ? (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400 tracking-wide">{label}</p>
                      <p className="text-sm font-medium text-neutral-800">{value}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!artwork.isAvailable || inCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm tracking-widest uppercase font-semibold transition-all ${
                  inCart
                    ? 'bg-amber-50 text-amber-600 border-2 border-amber-300 cursor-default'
                    : artwork.isAvailable
                    ? 'bg-neutral-900 text-white hover:bg-amber-500'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={18} />
                {inCart ? 'Added to Cart ✓' : artwork.isAvailable ? 'Add to Cart' : 'Sold Out'}
              </button>

              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`px-4 py-4 border-2 transition-all ${
                  inWishlist
                    ? 'border-red-300 bg-red-50 text-red-500'
                    : 'border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-500'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} className={inWishlist ? 'fill-red-500' : ''} />
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-4 border-2 border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-stone-50 p-4 text-sm border border-stone-100 rounded-sm">
              <p className="font-semibold text-neutral-700 mb-1 flex items-center gap-2">
                <Package size={15} className="text-amber-500" /> Shipping & Handling
              </p>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Estimated delivery: {artwork.shippingInfo?.estimatedDays || 14} business days.
                Artwork is professionally packed and fully insured.
              </p>
            </div>

            {/* Tags */}
            {artwork.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Artist Bio ─── */}
        {artwork.artist && (
          <div className="mt-16 border-t pt-12">
            <h2 className="font-display text-2xl font-bold mb-6">About the Artist</h2>
            <div className="flex items-start gap-6">
              {artwork.artist.profileImage && (
                <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-amber-100">
                  <Image src={artwork.artist.profileImage} alt={artwork.artist.name} fill className="object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-semibold">{artwork.artist.name}</h3>
                <p className="text-amber-600 text-sm mb-2">{artwork.artist.nationality}</p>
                <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl">{artwork.artist.bio}</p>
                <Link
                  href={`/artists/${artwork.artist._id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 mt-3 hover:text-amber-600 transition-colors"
                >
                  View all works →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── Reviews ─── */}
        <div className="mt-16 border-t pt-12" id="reviews">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12">

            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="lg:w-64 flex-shrink-0">
                <h2 className="font-display text-2xl font-bold mb-6">Customer Reviews</h2>
                <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-100">
                  <div className="text-center mb-4">
                    <p className="font-display text-5xl font-bold text-neutral-900">{avgRating}</p>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={20}
                          className={s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-2">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="text-neutral-500 w-4 text-right">{star}</span>
                        <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-neutral-400 w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List & Form */}
            <div className="flex-1">
              {!reviews.length && (
                <h2 className="font-display text-2xl font-bold mb-6">Reviews ({reviews.length})</h2>
              )}

              {/* Review Form */}
              {user ? (
                <div className="mb-10">
                  <h3 className="font-display text-lg font-semibold mb-4 text-neutral-900">Write a Review</h3>
                  <ReviewForm artworkId={id} onReviewAdded={handleReviewAdded} />
                </div>
              ) : (
                <div className="mb-10 p-5 bg-amber-50 border border-amber-100 rounded-sm flex items-center gap-4">
                  <Star size={24} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800 text-sm">Share your experience</p>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      <Link href="/auth/login" className="text-amber-600 font-semibold underline">Sign in</Link>
                      {' '}to write a review for this artwork.
                    </p>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map(review => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-neutral-50 border border-neutral-100 rounded-sm">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={28} className="text-neutral-200" />
                    ))}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-neutral-500 text-sm">
                    {user ? 'Be the first to review this artwork!' : 'Sign in to leave the first review.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
