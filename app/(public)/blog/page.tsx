import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { Post } from '@/models/Post';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ব্লগ | বাংলা সাহিত্য',
  description: 'বাংলা প্রবন্ধ, গল্প, স্মৃতিকথা - সবকিছু একসাথে',
};

export const revalidate = 60;

export default async function BlogPage() {
  const client = await clientPromise;
  const db = client.db();

  const posts = await db
    .collection<Post>('posts')
    .find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-fluid font-display text-ink-200 mb-4">
            প্রবন্ধ ও গল্প
          </h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto">
            বাংলা সাহিত্যের সমৃদ্ধি। প্রবন্ধ, গল্প, স্মৃতিকথা - বিভিন্ন বিষয়ে লেখা।
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button variant="outline" className="border-saffron-300 text-saffron-300">
            সব
          </Button>
          <Button variant="ghost" className="text-ink-100 hover:text-saffron-300">
            প্রবন্ধ
          </Button>
          <Button variant="ghost" className="text-ink-100 hover:text-saffron-300">
            গল্প
          </Button>
          <Button variant="ghost" className="text-ink-100 hover:text-saffron-300">
            স্মৃতিকথা
          </Button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
            <PenLine className="h-16 w-16 text-cream-300 mx-auto mb-4" />
            <p className="bengali-text text-ink-100 mb-4">
              এখনও কোনও প্রবন্ধ প্রকাশিত হয়নি।
            </p>
            <Link href="/dashboard">
              <Button className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
                প্রথম প্রবন্ধটি লিখুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id.toString()} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}