import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { IReview } from '@/models/Review';
import { BookshelfCard } from '@/components/books/BookshelfCard';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'বইমেলা | বাংলা সাহিত্য',
  description: 'বাংলা বই রিভিউ - রেটিং এবং আলোচনা',
};

export const revalidate = 60;

export default async function BoimelaPage() {
  const client = await clientPromise;
  const db = client.db();

  const [reviews, currentlyReading] = await Promise.all([
    db
      .collection<IReview>('reviews')
      .find({ status: 'published', shelf: { $ne: 'reading' } })
      .sort({ publishedAt: -1 })
      .toArray(),
    db
      .collection<IReview>('reviews')
      .find({ status: 'published', shelf: 'reading' })
      .sort({ publishedAt: -1 })
      .toArray(),
  ]);

  // Get unique genres for filter
  const allGenres = new Set<string>();
  reviews.forEach((review) => {
    review.genre.forEach((g) => allGenres.add(g));
  });
  currentlyReading.forEach((review) => {
    review.genre.forEach((g) => allGenres.add(g));
  });
  const genres = Array.from(allGenres);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-fluid font-display text-ink-200 mb-4">
            বই রিভিউ
          </h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto">
            বাংলা বই রিভিউ এবং রেটিং। আপনার পরবর্তী পড়ার বই খুঁজুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="bg-cream-50 border border-cream-200 rounded-lg p-4 h-fit">
            <h2 className="font-semibold text-ink-200 mb-4">জেনার</h2>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="border-saffron-300 text-saffron-300 justify-start">
                সব জেনার
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant="ghost"
                  className="text-ink-100 hover:text-saffron-300 justify-start"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </aside>

          <div>
            {currentlyReading.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-ink-200 mb-4">বর্তমানে পড়ছি</h2>
                <div className="grid grid-cols-1 gap-6">
                  {currentlyReading.map((review) => (
                    <BookshelfCard key={review._id!.toString()} review={review} />
                  ))}
                </div>
              </section>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
                <BookOpen className="h-16 w-16 text-cream-300 mx-auto mb-4" />
                <p className="bengali-text text-ink-100 mb-4">
                  এখনও কোনও বই রিভিউ পাওয়া যায়নি।
                </p>
                <Link href="/dashboard">
                  <Button className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
                    প্রথম রিভিউ লিখুন
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((review) => (
                  <BookshelfCard key={review._id!.toString()} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}