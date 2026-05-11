import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenLine, Book, BookOpen, ArrowRight } from 'lucide-react';
import { PoemCard } from '@/components/poetry/PoemCard';
import { BookshelfCard } from '@/components/books/BookshelfCard';
import { clientPromise } from '@/lib/mongodb';
import type { Post, Poem, Review } from '@/models';

export const revalidate = 60;

export default async function HomePage() {
  const client = await clientPromise;
  const db = client.db();

  // Fetch recent published posts
  const posts = await db
    .collection<Post>('posts')
    .find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(3)
    .toArray();

  // Fetch featured poems
  const poems = await db
    .collection<Poem>('poems')
    .find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(2)
    .toArray();

  // Fetch recent reviews
  const reviews = await db
    .collection<Review>('reviews')
    .find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(2)
    .toArray();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 paper-texture">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-display-fluid font-display text-ink-200 mb-6">
              বাংলা সাহিত্যের নতুন মেলা
            </h1>
            <p className="bengali-text text-lg md:text-xl text-ink-100 max-w-2xl mx-auto mb-8">
              প্রবন্ধ, কবিতা, বই রিভিউ - সবই একসাথে। বাংলা সাহিত্যের জন্য একটি আধুনিক প্ল্যাটফর্ম।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog">
                <Button size="lg" className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
                  <PenLine className="mr-2 h-5 w-5" />
                  <span>ব্লগ পড়ুন</span>
                </Button>
              </Link>
              <Link href="/kobita">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-saffron-300 text-saffron-300 hover:bg-saffron-50"
                >
                  <Book className="mr-2 h-5 w-5" />
                  <span>কবিতা দেখুন</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display text-ink-200">
              সাম্প্রতিক প্রবন্ধ
            </h2>
            <Link
              href="/blog"
              className="text-saffron-300 hover:text-saffron-400 flex items-center"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-cream-50 rounded-lg border border-cream-200">
              <p className="bengali-text text-ink-100">কোনো প্রবন্ধ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post._id.toString()}
                  className="bg-cream-50 rounded-lg border border-cream-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium bg-saffron-100 text-saffron-600 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-ink-50">
                        {post.readingTime} মিনিট পড়া
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-ink-200 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-ink-100 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-50">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="link" className="text-saffron-300 p-0">
                          পড়ুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Poems */}
      <section className="py-16 bg-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display text-ink-200">
              নির্বাচিত কবিতা
            </h2>
            <Link
              href="/kobita"
              className="text-saffron-300 hover:text-saffron-400 flex items-center"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {poems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-cream-200">
              <p className="bengali-text text-ink-100">কোনো কবিতা পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poems.map((poem) => (
                <PoemCard key={poem._id.toString()} poem={poem} featured />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display text-ink-200">
              সাম্প্রতিক বই রিভিউ
            </h2>
            <Link
              href="/boimela"
              className="text-saffron-300 hover:text-saffron-400 flex items-center"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-cream-50 rounded-lg border border-cream-200">
              <p className="bengali-text text-ink-100">কোনো বই রিভিউ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <BookshelfCard key={review._id.toString()} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-saffron-300 text-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
            আপনার লেখা শেয়ার করুন
          </h2>
          <p className="bengali-text text-lg mb-8 max-w-2xl mx-auto">
            বাংলা সাহিত্যের সমৃদ্ধির জন্য আপনার অবদান রাখুন। রেজিস্টার করুন এবং আপনার লেখাগুলো প্রকাশ করুন।
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-ink-200 hover:bg-ink-300 text-cream-50">
              <BookOpen className="mr-2 h-5 w-5" />
              <span>ড্যাশবোর্ডে যান</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}