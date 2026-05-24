import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clientPromise } from '@/lib/mongodb';
import { IPost } from '@/models/Post';
import { CommentSection } from '@/components/comments/CommentSection';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await clientPromise;
  const db = client.db();
  const post = await db.collection<IPost>('posts').findOne({ slug, status: 'published' });

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const client = await clientPromise;
  const db = client.db();

  const post = await db.collection<IPost>('posts').findOne({ slug, status: 'published' });

  if (!post) {
    notFound();
  }

  // Increment view count
  await db.collection<IPost>('posts').updateOne(
    { _id: post._id },
    { $inc: { views: 1 } }
  );

  // Fetch related posts based on tags
  const relatedPosts = await db
    .collection<IPost>('posts')
    .find({
      _id: { $ne: post._id },
      status: 'published',
      tags: { $in: post.tags },
    })
    .limit(3)
    .toArray();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    image: post.coverImage ? [post.coverImage] : undefined,
    keywords: post.tags.join(', '),
    inLanguage: 'bn',
  };

  return (
    <div className="min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link href="/blog" className="inline-flex items-center text-saffron-300 hover:text-saffron-400 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>ব্লগে ফিরে যান</span>
        </Link>

        {/* Article */}
        <article className="bg-white rounded-lg border border-cream-200 p-8 shadow-sm">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium bg-saffron-100 text-saffron-600 px-3 py-1 rounded">
                {post.category}
              </span>
              <span className="text-sm text-ink-50 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {post.readingTime} মিনিট পড়া
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink-200 mb-4 bengali-text">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-ink-50">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{post.views} বার পড়া হয়েছে</span>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none bengali-text"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-cream-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm bg-cream-200 text-ink-100 px-3 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-ink-200 mb-6">সম্পর্কিত প্রবন্ধ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related._id!.toString()}
                  href={`/blog/${related.slug}`}
                  className="bg-cream-50 rounded-lg border border-cream-200 p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-ink-200 mb-2 line-clamp-2 bengali-text">
                    {related.title}
                  </h3>
                  <p className="text-sm text-ink-100 line-clamp-2 bengali-text">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="mt-12">
          <CommentSection postId={post._id!.toString()} />
        </section>
      </div>
    </div>
  );
}