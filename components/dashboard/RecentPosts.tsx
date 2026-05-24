import Link from 'next/link';
import { IPost } from '@/models/Post';

interface RecentPostsProps {
  posts: IPost[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <div className="rounded-lg border border-cream-200 bg-cream-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink-200">সাম্প্রতিক প্রবন্ধ</h3>
        <Link href="/dashboard/posts" className="text-sm text-saffron-300">
          সব দেখুন
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-ink-100">এখনও কোনও প্রবন্ধ নেই।</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post._id!.toString()} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-200 line-clamp-1">
                  {post.title}
                </p>
                <p className="text-xs text-ink-50">
                  {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
              <span className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded">
                {post.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
