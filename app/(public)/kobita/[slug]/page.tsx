import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { clientPromise } from '@/lib/mongodb';
import { IPoem } from '@/models/Poem';
import { CommentSection } from '@/components/comments/CommentSection';
import Link from 'next/link';
import { ArrowLeft, Share2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const client = await clientPromise;
  const db = client.db();
  const poem = await db.collection<IPoem>('poems').findOne({ slug: params.slug, status: 'published' });

  if (!poem) {
    return { title: 'Poem not found' };
  }

  return {
    title: poem.title,
    description: poem.excerpt,
    openGraph: {
      title: poem.title,
      description: poem.excerpt,
      type: 'article',
      images: poem.coverImage ? [poem.coverImage] : undefined,
    },
  };
}

export default async function PoemDetailPage({ params }: PageProps) {
  const client = await clientPromise;
  const db = client.db();

  const poem = await db.collection<IPoem>('poems').findOne({ slug: params.slug, status: 'published' });

  if (!poem) {
    notFound();
  }

  await db.collection<IPoem>('poems').updateOne({ _id: poem._id }, { $inc: { views: 1 } });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Poem',
    name: poem.title,
    author: {
      '@type': 'Person',
      name: poem.author.name,
    },
    datePublished: poem.publishedAt?.toISOString(),
    keywords: poem.tags.join(', '),
    inLanguage: 'bn',
  };

  return (
    <div className="min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/kobita" className="inline-flex items-center text-saffron-300 hover:text-saffron-400 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          কবিতার তালিকায় ফিরে যান
        </Link>

        <article className="bg-white rounded-lg border border-cream-200 p-8 shadow-sm">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-ink-200 bengali-text mb-4">
              {poem.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              {poem.mood.map((m) => (
                <span key={m} className="text-xs bg-saffron-100 text-saffron-600 px-2 py-1 rounded">
                  {m}
                </span>
              ))}
              {poem.tags.map((tag) => (
                <span key={tag} className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {poem.audioUrl && (
            <div className="mb-6 flex items-center justify-center">
              <audio controls className="w-full max-w-md" src={poem.audioUrl}>
                <track kind="captions" />
                আপনার ব্রাউজার অডিও উপাদানকে সমর্থন করে না।
              </audio>
            </div>
          )}

          <div
            className="poem-content bengali-text"
            dangerouslySetInnerHTML={{ __html: poem.content }}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-50">
            <span>{poem.views} বার পড়া হয়েছে</span>
            <div className="flex gap-2">
              {poem.audioUrl && (
                <Button variant="ghost" size="sm" className="text-saffron-300">
                  <Volume2 className="h-4 w-4 mr-1" />
                  শোনুন
                </Button>
              )}
              <Link href={`/api/poems/${poem._id}/share`} target="_blank">
                <Button variant="outline" size="sm" className="border-saffron-300 text-saffron-300">
                  <Share2 className="h-4 w-4 mr-1" />
                  ছবি শেয়ার করুন
                </Button>
              </Link>
            </div>
          </div>
        </article>

        <section className="mt-12">
          <CommentSection poemId={poem._id!.toString()} />
        </section>
      </div>
    </div>
  );
}
