'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IComment } from '@/models/Comment';
import { MessageSquare, Send, LogIn } from 'lucide-react';
import { CommentThread } from '@/components/comments/CommentThread';
import Link from 'next/link';

interface CommentSectionProps {
  postId?: string;
  poemId?: string;
  reviewId?: string;
}

export function CommentSection({ postId, poemId, reviewId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parentId = postId || poemId || reviewId;
  const type = postId ? 'post' : poemId ? 'poem' : 'review';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          [`${type}Id`]: parentId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchComments = async () => {
    // Fetch approved comments for this content
    const query: any = { status: 'approved' };
    if (postId) query.postId = postId;
    if (poemId) query.poemId = poemId;
    if (reviewId) query.reviewId = reviewId;

    const response = await fetch(`/api/comments?${new URLSearchParams(query)}`);
    if (response.ok) {
      const data = await response.json();
      setComments(data.comments || []);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, poemId, reviewId]);

  return (
    <div className="bg-cream-50 rounded-lg border border-cream-200 p-6">
      <h3 className="text-xl font-bold text-ink-200 mb-6 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        মন্তব্য ({comments.length})
      </h3>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="আপনার মন্তব্য লিখুন..."
              className="bengali-text min-h-[100px]"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
          >
            {isSubmitting ? (
              'প্রক্রিয়াকরণ...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                মন্তব্য পাঠান
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="mb-8 text-center py-6 border border-cream-200 rounded-lg bg-cream-100">
          <p className="bengali-text text-ink-100 mb-3">মন্তব্য করতে লগ ইন করুন</p>
          <Link href="/login">
            <Button className="bg-saffron-300 hover:bg-saffron-400 text-ink-200">
              <LogIn className="h-4 w-4 mr-2" />
              লগ ইন
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <CommentThread
        comments={comments}
        resourceType={type}
        resourceId={parentId || ''}
        onRefresh={fetchComments}
      />
    </div>
  );
}
