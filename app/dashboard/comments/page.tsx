'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IComment } from '@/models/Comment';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardCommentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<IComment[]>([]);
  const [filter, setFilter] = useState('pending');

  const fetchComments = async () => {
    const response = await fetch(`/api/comments?status=${filter}`);
    if (response.ok) {
      const data = await response.json();
      setComments(data.comments || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  if (status === 'loading') {
    return <div className="py-12">লোড হচ্ছে...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const updateStatus = async (id: string, nextStatus: string) => {
    await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchComments();
  };

  const deleteComment = async (id: string) => {
    if (!confirm('এই মন্তব্যটি মুছে ফেলবেন?')) return;
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    fetchComments();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">মন্তব্য মডারেশন</h1>
        <DashboardNav />

        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', 'spam'].map((statusValue) => (
            <Button
              key={statusValue}
              variant={filter === statusValue ? 'default' : 'ghost'}
              className={filter === statusValue ? 'bg-saffron-300 text-ink-200' : 'text-ink-100'}
              onClick={() => setFilter(statusValue)}
            >
              {statusValue}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-ink-100">কোনও মন্তব্য পাওয়া যায়নি।</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id!.toString()} className="bg-cream-50 border border-cream-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-200">{comment.author.name}</p>
                    <p className="text-xs text-ink-50">{comment.author.email}</p>
                  </div>
                  <span className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded">
                    {comment.status}
                  </span>
                </div>
                <p className="bengali-text text-ink-100 mt-3 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => updateStatus(comment._id!.toString(), 'approved')}>
                    অনুমোদন
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(comment._id!.toString(), 'rejected')}>
                    প্রত্যাখ্যান
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteComment(comment._id!.toString())}>
                    মুছুন
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
