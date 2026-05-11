import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IPost } from '@/models/Post';
import { Calendar, Clock, MessageSquare } from 'lucide-react';

interface BlogCardProps {
  post: IPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-cream-50 rounded-lg border border-cream-200 overflow-hidden hover:shadow-lg transition-shadow">
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
          <span className="text-xs text-ink-50 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {post.readingTime} মিনিট
          </span>
        </div>
        <h3 className="text-xl font-bold text-ink-200 mb-2 line-clamp-2 bengali-text">
          {post.title}
        </h3>
        <p className="text-ink-100 text-sm mb-4 line-clamp-3 bengali-text">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-ink-50">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('bn-BD')}
            </span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {/* Comment count would be fetched separately */}
              ০
            </span>
          </div>
          <Link href={`/blog/${post.slug}`}>
            <Button size="sm" className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
              পড়ুন
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}