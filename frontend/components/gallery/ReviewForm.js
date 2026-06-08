'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ReviewForm({ artworkId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/reviews/artwork/${artworkId}`, {
        rating,
        title: title.trim(),
        comment: comment.trim()
      });
      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setComment('');
      if (onReviewAdded) onReviewAdded(data.review);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        className="focus:outline-none"
      >
        <Star
          size={24}
          className={`${
            i < (hoverRating || rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-neutral-300'
          } transition-colors`}
        />
      </button>
    ));
  };

  return (
    <div className="bg-neutral-50 rounded-lg p-6">
      <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-2 text-sm text-neutral-600">
              {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Summarize your experience"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field resize-none"
            rows={4}
            placeholder="Share your thoughts about this artwork..."
            maxLength={500}
            required
          />
          <div className="text-xs text-neutral-500 mt-1">
            {comment.length}/500 characters
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}