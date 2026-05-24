import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IReview } from '@/models/Review';
import { Star } from 'lucide-react';
import { stripHtml } from '@/lib/content';

interface BookshelfCardProps {
  review: IReview;
}

export function BookshelfCard({ review }: BookshelfCardProps) {
  return (
    <div className="bg-cream-50 rounded-lg border border-cream-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {review.coverImage && (
          <div className="w-24 h-36 flex-shrink-0 rounded-md overflow-hidden shadow-md">
            <img
              src={review.coverImage}
              alt={review.bookTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-ink-200 mb-1 bengali-text line-clamp-2">
            {review.bookTitle}
          </h3>
          <p className="text-sm text-ink-100 mb-2">
            {review.bookAuthor}
          </p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? 'text-saffron-300 fill-saffron-300'
                    : 'text-cream-300'
                }`}
              />
            ))}
          </div>
          <p className="text-ink-100 text-sm line-clamp-3 mb-4 bengali-text">
            {stripHtml(review.review)}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-ink-50">
              {review.spoilers && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded mr-2">
                  স্পয়লার আছে
                </span>
              )}
              <span>
                {new Date(review.publishedAt || review.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>
            <Link href={`/boimela/${review._id!.toString()}`}>
              <Button size="sm" variant="outline" className="border-saffron-300 text-saffron-300">
                রিভিউ পড়ুন
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}