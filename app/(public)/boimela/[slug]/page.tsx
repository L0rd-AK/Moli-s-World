import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clientPromise } from '@/lib/mongodb';
import { IReview } from '@/models/Review';
import { CommentSection } from '@/components/comments/CommentSection';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { ObjectId } from 'mongodb';
import { stripHtml } from '@/lib/content';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const client = await clientPromise;
  const db = client.db();
  const reviewId = ObjectId.isValid(params.slug) ? new ObjectId(params.slug) : params.slug;
  const review = await db.collection<IReview>('reviews').findOne({ _id: reviewId as any, status: 'published' });

  if (!review) {
    return { title: 'Review not found' };
  }

  const description = stripHtml(review.review).slice(0, 150);

  return {
    title: review.bookTitle,
    description,
    openGraph: {
      title: review.bookTitle,
      description,
      images: review.coverImage ? [review.coverImage] : undefined,
    },
  };
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const client = await clientPromise;
  const db = client.db();
  const reviewId = ObjectId.isValid(params.slug) ? new ObjectId(params.slug) : params.slug;

  const review = await db.collection<IReview>('reviews').findOne({ _id: reviewId as any, status: 'published' });

  if (!review) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author.name,
    },
    datePublished: review.publishedAt?.toISOString(),
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    itemReviewed: {
      '@type': 'Book',
      name: review.bookTitle,
      author: review.bookAuthor,
      isbn: review.isbn,
    },
    inLanguage: 'bn',
  };

  return (
    <div className="min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/boimela" className="inline-flex items-center text-saffron-300 hover:text-saffron-400 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          বইমেলায় ফিরে যান
        </Link>

        <article className="bg-white rounded-lg border border-cream-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            {review.coverImage && (
              <div className="w-40 h-56 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                <img src={review.coverImage} alt={review.bookTitle} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-2">{review.bookTitle}</h1>
              <p className="text-ink-100 mb-4">{review.bookAuthor}</p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= review.rating ? 'text-saffron-300 fill-saffron-300' : 'text-cream-300'}`}
                  />
                ))}
                <span className="text-sm text-ink-50 ml-2">{review.rating}/5</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {review.genre.map((g) => (
                  <span key={g} className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bengali-text prose max-w-none">
            {review.spoilers ? (
              <details className="rounded-md border border-cream-200 p-4 bg-cream-50">
                <summary className="cursor-pointer text-saffron-300">স্পয়লার দেখুন</summary>
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: review.review }} />
              </details>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: review.review }} />
            )}
          </div>
        </article>

        <section className="mt-12">
          <CommentSection reviewId={review._id!.toString()} />
        </section>
      </div>
    </div>
  );
}
