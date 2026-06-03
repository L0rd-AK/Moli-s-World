import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentPosts } from '@/components/dashboard/RecentPosts';
import { RecentComments } from '@/components/dashboard/RecentComments';
import { clientPromise } from '@/lib/mongodb';
import { Post, Poem, Review, Comment, Note, Journal } from '@/models';

export const metadata: Metadata = {
  title: 'ড্যাশবোর্ড | বাংলা সাহিত্য',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const client = await clientPromise;
  const db = client.db();

  const [postsCount, poemsCount, reviewsCount, commentsCount, notesCount, journalCount] = await Promise.all([
    db.collection<Post>('posts').countDocuments(),
    db.collection<Poem>('poems').countDocuments(),
    db.collection<Review>('reviews').countDocuments(),
    db.collection<Comment>('comments').countDocuments({ status: 'approved' }),
    db.collection<Note>('notes').countDocuments(),
    db.collection<Journal>('journal').countDocuments(),
  ]);

  const recentPosts = await db
    .collection<Post>('posts')
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const pendingComments = await db
    .collection<Comment>('comments')
    .find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-200 bengali-text">ড্যাশবোর্ড</h1>
          <p className="text-ink-100 mt-2">আপনার সাইটের ওভারভিউ এবং ম্যানেজমেন্ট</p>
        </div>

        <DashboardNav />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard title="ব্লগ" value={postsCount} href="/dashboard/posts" />
          <StatsCard title="কবিতা" value={poemsCount} href="/dashboard/poems" />
          <StatsCard title="বই রিভিউ" value={reviewsCount} href="/dashboard/reviews" />
          <StatsCard title="নোটস" value={notesCount} href="/dashboard/notes" />
          <StatsCard title="জার্নাল" value={journalCount} href="/dashboard/journal" />
          <StatsCard title="মন্তব্য" value={commentsCount} href="/dashboard/comments" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentPosts posts={recentPosts} />
          </div>
          <div>
            <RecentComments comments={pendingComments} />
          </div>
        </div>
      </div>
    </div>
  );
}
