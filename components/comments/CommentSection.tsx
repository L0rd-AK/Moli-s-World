'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { IComment } from '@/models/Comment';
import { MessageSquare, Send } from 'lucide-react';
import { TurnstileWidget } from '@/components/comments/TurnstileWidget';
import { CommentThread } from '@/components/comments/CommentThread';

interface CommentSectionProps {
  postId?: string;
  poemId?: string;
  reviewId?: string;
}

export function CommentSection({ postId, poemId, reviewId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
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
          parentId: undefined,
          authorName: guestName,
          authorEmail: guestEmail,
          turnstileToken,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setTurnstileToken('');
        // Refresh comments
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

  const requiresTurnstile =
    !session && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const canSubmit =
    !!newComment.trim() &&
    (session ||
      (guestName.trim() && guestEmail.trim() && (!requiresTurnstile || turnstileToken)));

  return (
    <div className="bg-cream-50 rounded-lg border border-cream-200 p-6">
      <h3 className="text-xl font-bold text-ink-200 mb-6 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        মন্তব্য ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        {!session && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="আপনার নাম"
              className="bengali-text"
              required
            />
            <Input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              type="email"
              placeholder="আপনার ইমেইল"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="আপনার মন্তব্য লিখুন..."
            className="bengali-text min-h-[100px]"
            required
          />
        </div>
        {!session && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="mb-4">
            <TurnstileWidget
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
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
        {!session && requiresTurnstile && !turnstileToken && (
          <p className="text-sm text-ink-50 mt-2">
            মন্তব্য করতে Turnstile যাচাই করুন
          </p>
        )}
      </form>

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
