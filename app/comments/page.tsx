import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { IComment } from '@/models/Comment';

export const metadata: Metadata = {
  title: 'সাম্প্রতিক মন্তব্য',
};

export const revalidate = 60;

export default async function CommentsPage() {
  const client = await clientPromise;
  const db = client.db();

  const comments = await db
    .collection<IComment>('comments')
    .find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">সাম্প্রতিক মন্তব্য</h1>
        {comments.length === 0 ? (
          <p className="text-ink-100">কোনও মন্তব্য পাওয়া যায়নি।</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id!.toString()} className="bg-cream-50 border border-cream-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-ink-200">{comment.author.name}</span>
                  <span className="text-xs text-ink-50">
                    {new Date(comment.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <p className="bengali-text text-ink-100 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
