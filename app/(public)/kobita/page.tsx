import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { Poem } from '@/models/Poem';
import { PoemCard } from '@/components/poetry/PoemCard';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'কবিতা | বাংলা সাহিত্য',
  description: 'বাংলা কবিতা - বিভিন্ন মোড ও বিষয়ে',
};

export const revalidate = 60;

export default async function KobitaPage() {
  const client = await clientPromise;
  const db = client.db();

  const poems = await db
    .collection<Poem>('poems')
    .find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .toArray();

  // Group poems by mood
  const moods = ['বিষাদ', 'আনন্দ', 'প্রেম', 'দ্রোহ', 'রোমান্টিক', 'নাটকীয়', 'অন্যান্য'];

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display-fluid font-display text-ink-200 mb-4">
            কবিতা
          </h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto">
            বাংলা কবিতার সমৃদ্ধি। বিভিন্ন মোড, বিভিন্ন আবেগ - সবকিছু একসাথে।
          </p>
        </div>

        {/* Mood Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Button variant="outline" className="border-saffron-300 text-saffron-300">
            সব মোড
          </Button>
          {moods.map((mood) => (
            <Button
              key={mood}
              variant="ghost"
              className="text-ink-100 hover:text-saffron-300"
            >
              {mood}
            </Button>
          ))}
        </div>

        {/* Poems Grid */}
        {poems.length === 0 ? (
          <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
            <Book className="h-16 w-16 text-cream-300 mx-auto mb-4" />
            <p className="bengali-text text-ink-100 mb-4">
              এখনও কোনও কবিতা প্রকাশিত হয়নি।
            </p>
            <Link href="/dashboard">
              <Button className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
                প্রথম কবিতাটি লিখুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map((poem) => (
              <PoemCard key={poem._id.toString()} poem={poem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}