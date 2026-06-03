import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import Link from 'next/link';
import { Mail, Twitter, Github, Facebook, PenLine, Book, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'পরিচিতি',
};

export const revalidate = 60;

export default async function AboutPage() {
  const client = await clientPromise;
  const db = client.db();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await db.collection('settings').findOne({ _id: 'site' as any });

  const socialLinks = [
    { href: settings?.twitter, icon: Twitter, label: 'Twitter' },
    { href: settings?.facebook, icon: Facebook, label: 'Facebook' },
    { href: settings?.github, icon: Github, label: 'GitHub' },
    { href: settings?.email ? `mailto:${settings.email}` : null, icon: Mail, label: 'ইমেইল' },
  ].filter((link) => link.href);

  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="text-center mb-16">
          {settings?.authorImage && (
            <img
              src={settings.authorImage}
              alt={settings?.authorName || ''}
              className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-saffron-300"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink-200 mb-4">
            {settings?.authorName || 'পরিচিতি'}
          </h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto whitespace-pre-wrap">
            {settings?.bio || 'পরিচিতি শীঘ্রই আসছে।'}
          </p>
        </section>

        {socialLinks.length > 0 && (
          <section className="flex justify-center gap-4 mb-16">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href!}
                target={link.href!.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-200 text-ink-100 hover:text-saffron-300 hover:border-saffron-300 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            ))}
          </section>
        )}

        <section>
          <h2 className="text-2xl font-display font-bold text-ink-200 text-center mb-8">
            আমার লেখালেখি
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/blog" className="group">
              <div className="bg-cream-50 border border-cream-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-saffron-300 transition-all">
                <PenLine className="h-8 w-8 text-saffron-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-ink-200 mb-1">ব্লগ</h3>
                <p className="text-sm text-ink-100">প্রবন্ধ, গল্প, স্মৃতিকথা</p>
              </div>
            </Link>
            <Link href="/kobita" className="group">
              <div className="bg-cream-50 border border-cream-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-saffron-300 transition-all">
                <Book className="h-8 w-8 text-saffron-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-ink-200 mb-1">কবিতা</h3>
                <p className="text-sm text-ink-100">কবিতা সংগ্রহ</p>
              </div>
            </Link>
            <Link href="/boimela" className="group">
              <div className="bg-cream-50 border border-cream-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-saffron-300 transition-all">
                <BookOpen className="h-8 w-8 text-saffron-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-ink-200 mb-1">বইমেলা</h3>
                <p className="text-sm text-ink-100">বই রিভিউ ও আলোচনা</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
