'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IPoem } from '@/models/Poem';
import { Play, Share2 } from 'lucide-react';

interface PoemCardProps {
  poem: IPoem;
  featured?: boolean;
}

export function PoemCard({ poem, featured = false }: PoemCardProps) {
  const sharePoem = async () => {
    // Generate shareable image (would use canvas in production)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const shareUrl = `${baseUrl}/kobita/${poem.slug}`;
    if (navigator.share) {
      navigator.share({
        title: poem.title,
        text: poem.excerpt,
        url: shareUrl,
      });
    } else {
      window.open(`/api/poems/${poem._id}/share`, '_blank');
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-cream-200 p-6 ${
        featured ? 'shadow-lg' : 'hover:shadow-md'
      } transition-shadow`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-ink-200 mb-2 bengali-text">
          {poem.title}
        </h3>
        <p className="text-ink-100 text-sm line-clamp-3 bengali-text">
          {poem.excerpt}
        </p>
      </div>

      {poem.audioUrl && (
        <div className="mb-4">
          <audio
            controls
            className="w-full h-8"
            src={poem.audioUrl}
          >
            <track kind="captions" />
            আপনার ব্রাউজার অডিও উপাদানকে সমর্থন করে না।
          </audio>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {poem.mood.map((m) => (
          <span
            key={m}
            className="text-xs bg-saffron-100 text-saffron-600 px-2 py-1 rounded"
          >
            {m}
          </span>
        ))}
        {poem.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-ink-50">
          <span>{poem.views} বার পড়া হয়েছে</span>
          <span className="mx-2">•</span>
          <span>
            {new Date(poem.publishedAt || poem.createdAt).toLocaleDateString('bn-BD')}
          </span>
        </div>
        <div className="flex gap-2">
          {poem.audioUrl && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={sharePoem}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Link href={`/kobita/${poem.slug}`}>
            <Button size="sm" className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
              পড়ুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}