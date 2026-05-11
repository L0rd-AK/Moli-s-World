import { IComment } from '@/models/Comment';

interface RecentCommentsProps {
  comments: IComment[];
}

export function RecentComments({ comments }: RecentCommentsProps) {
  return (
    <div className="rounded-lg border border-cream-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-ink-200 mb-4">মডারেশন কিউ</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-ink-100">কোনও পেন্ডিং মন্তব্য নেই।</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment._id.toString()} className="text-sm text-ink-100">
              <p className="font-medium text-ink-200">{comment.author.name}</p>
              <p className="line-clamp-2">{comment.content}</p>
              <p className="text-xs text-ink-50">
                {new Date(comment.createdAt).toLocaleDateString('bn-BD')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
