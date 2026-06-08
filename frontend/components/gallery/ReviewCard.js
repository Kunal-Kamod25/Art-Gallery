import { Star, User } from 'lucide-react';

export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
        }`}
      />
    ));
  };

  return (
    <div className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
          {review.user.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={20} className="text-neutral-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-neutral-900">{review.user.name}</h4>
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
            </div>
          </div>
          <h5 className="font-medium text-neutral-800 mb-2">{review.title}</h5>
          <p className="text-neutral-600 text-sm leading-relaxed mb-3">{review.comment}</p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            {review.isVerifiedPurchase && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}