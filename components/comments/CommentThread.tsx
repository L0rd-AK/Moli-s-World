'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { IComment } from '@/models/Comment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentThreadProps {
  comments: IComment[];
  resourceType: 'post' | 'poem' | 'review';
  resourceId: string;
  onRefresh: () => void;
}

export function CommentThread({ comments, resourceType, resourceId, onRefresh }: CommentThreadProps) {
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6">
      {topLevelComments.length === 0 ? (
        <p className="text-center text-ink-100 py-8">এখনও কোনও মন্তব্য নেই। প্রথম মন্তব্যটি দিন!</p>
      ) : (
        topLevelComments.map((comment) => (
          <div key={comment._id.toString()} className="border-b border-cream-200 pb-6 last:border-b-0">
            <CommentItem
              comment={comment}
              replies={getReplies(comment._id.toString())}
              resourceType={resourceType}
              resourceId={resourceId}
              onRefresh={onRefresh}
            />
          </div>
        ))
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  resourceType,
  resourceId,
  onRefresh,
}: {
  comment: IComment;
  replies: IComment[];
  resourceType: 'post' | 'poem' | 'review';
  resourceId: string;
  onRefresh: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { data: session } = useSession();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: replyContent,
        [`${resourceType}Id`]: resourceId,
        parentId: comment._id.toString(),
      }),
    });

    if (response.ok) {
      setReplyContent('');
      setShowReplyForm(false);
      onRefresh();
    }
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center flex-shrink-0">
          <span className="text-saffron-600 font-medium">
            {comment.author.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-ink-200">{comment.author.name}</span>
            {comment.isGuest && (
              <span className="text-xs bg-cream-200 text-ink-50 px-2 py-0.5 rounded">
                অতিথি
              </span>
            )}
            <span className="text-xs text-ink-50">
              {new Date(comment.createdAt).toLocaleDateString('bn-BD', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="bengali-text text-ink-100 whitespace-pre-wrap">{comment.content}</p>

          {session && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-saffron-300 hover:text-saffron-400 mt-2"
            >
              উত্তর দিন
            </button>
          )}

          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="আপনার উত্তর লিখুন..."
                className="bengali-text min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
                >
                  উত্তর পাঠান
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReplyForm(false)}
                >
                  বাতিল
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 ml-12 space-y-4">
          {replies.map((reply) => (
            <div key={reply._id.toString()} className="border-l-2 border-cream-200 pl-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-ink-100 text-sm font-medium">
                    {reply.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-ink-200 text-sm">{reply.author.name}</span>
                    {reply.isGuest && (
                      <span className="text-xs bg-cream-200 text-ink-50 px-2 py-0.5 rounded">
                        অতিথি
                      </span>
                    )}
                    <span className="text-xs text-ink-50">
                      {new Date(reply.createdAt).toLocaleDateString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="bengali-text text-ink-100 text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
