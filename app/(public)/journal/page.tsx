import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { IJournal } from '@/models/Journal';
import { CalendarDays } from 'lucide-react';
import { stripHtml } from '@/lib/content';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'জার্নাল | মলির দুনিয়া',
  description: 'দৈনন্দিন জীবনের কথা, ভাবনা, এবং অনুভূতি',
};

export const revalidate = 60;

const moodEmojis: Record<string, string> = {
  'প্রশান্ত': '😌',
  'আনন্দিত': '😊',
  'বিষণ্ণ': '😔',
  'উদ্যমী': '⚡',
  'চিন্তিত': '😟',
  'কৃতজ্ঞ': '🙏',
};

const monthNames = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

export default async function PublicJournalPage() {
  const client = await clientPromise;
  const db = client.db();

  const entries = await db
    .collection<IJournal>('journal')
    .find({ isPublic: true, status: 'published' })
    .sort({ date: -1 })
    .toArray();

  const grouped = entries.reduce<Record<string, IJournal[]>>((acc, entry) => {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-display-fluid font-display text-ink-200 mb-4">দৈনিক জার্নাল</h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto">
            দৈনন্দিন জীবনের ছোট ছোট মুহূর্ত, ভাবনা এবং অনুভূতি।
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
            <CalendarDays className="h-16 w-16 text-cream-300 mx-auto mb-4" />
            <p className="bengali-text text-ink-100">এখনও কোনও জার্নাল এন্ট্রি প্রকাশিত হয়নি।</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-cream-200 hidden md:block" />

            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthEntries]) => {
                const [y, m] = monthKey.split('-');
                return (
                  <div key={monthKey} className="mb-10">
                    <div className="flex items-center gap-3 mb-6 relative">
                      <div className="w-12 h-12 rounded-full bg-saffron-100 border-2 border-saffron-300 flex items-center justify-center z-10">
                        <CalendarDays className="h-5 w-5 text-saffron-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-ink-200 bengali-text">
                        {monthNames[parseInt(m) - 1]} {y}
                      </h2>
                    </div>

                    <div className="space-y-4 md:pl-16">
                      {monthEntries.map((entry) => {
                        const plainText = stripHtml(entry.content);
                        const preview = plainText.length > 300 ? plainText.slice(0, 300) + '...' : plainText;
                        const entryDate = new Date(entry.date);
                        return (
                          <article
                            key={entry._id!.toString()}
                            className="bg-cream-50 border border-cream-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{moodEmojis[entry.mood] || ''}</span>
                              <div>
                                <h3 className="font-semibold text-ink-200 text-lg">{entry.title}</h3>
                                <span className="text-xs text-ink-50">
                                  {entryDate.toLocaleDateString('bn-BD', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-saffron-50 text-saffron-400 border border-saffron-200">
                                {entry.mood}
                              </span>
                            </div>
                            <p className="bengali-text text-ink-100 leading-relaxed">{preview}</p>
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {entry.tags.map((tag) => (
                                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-cream-200 text-ink-100">{tag}</span>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
