'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { IReview } from '@/models/Review';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

const statuses = ['draft', 'published', 'scheduled'];

export default function DashboardReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    bookTitle: '',
    bookAuthor: '',
    isbn: '',
    coverImage: '',
    rating: 5,
    review: '',
    spoilers: false,
    genre: '',
    shelf: 'finished',
    status: 'draft',
    scheduledAt: '',
  });

  const fetchReviews = async () => {
    const response = await fetch('/api/reviews?status=all');
    if (response.ok) {
      const data = await response.json();
      setReviews(data.reviews || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchReviews();
  }, []);

  if (status === 'loading') {
    return <div className="py-12">লোড হচ্ছে...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const resetForm = () => {
    setEditingId(null);
    setForm({
      bookTitle: '',
      bookAuthor: '',
      isbn: '',
      coverImage: '',
      rating: 5,
      review: '',
      spoilers: false,
      genre: '',
      shelf: 'finished',
      status: 'draft',
      scheduledAt: '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      rating: Number(form.rating),
      genre: form.genre.split(',').map((item) => item.trim()).filter(Boolean),
      scheduledAt: form.scheduledAt || undefined,
    };

    const response = await fetch(editingId ? `/api/reviews/${editingId}` : '/api/reviews', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await fetchReviews();
      resetForm();
    }

    setIsSaving(false);
  };

  const handleEdit = (review: IReview) => {
    setEditingId(review._id!.toString());
    setForm({
      bookTitle: review.bookTitle,
      bookAuthor: review.bookAuthor,
      isbn: review.isbn || '',
      coverImage: review.coverImage || '',
      rating: review.rating,
      review: review.review,
      spoilers: review.spoilers,
      genre: review.genre.join(', '),
      shelf: review.shelf || 'finished',
      status: review.status,
      scheduledAt: review.scheduledAt ? new Date(review.scheduledAt).toISOString().slice(0, 16) : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?')) return;
    const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await fetchReviews();
    }
  };

  const handleIsbnLookup = async () => {
    if (!form.isbn) return;
    const response = await fetch(`https://openlibrary.org/isbn/${form.isbn}.json`);
    if (!response.ok) return;
    const data = await response.json();
    setForm((prev) => ({
      ...prev,
      bookTitle: data.title || prev.bookTitle,
      bookAuthor: data.by_statement || prev.bookAuthor,
      coverImage: prev.coverImage || `https://covers.openlibrary.org/b/isbn/${form.isbn}-L.jpg`,
    }));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">রিভিউ ব্যবস্থাপনা</h1>
        <DashboardNav />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-cream-200 rounded-lg p-6">
              <Input
                placeholder="বইয়ের নাম"
                value={form.bookTitle}
                onChange={(e) => setForm({ ...form, bookTitle: e.target.value })}
                required
              />
              <Input
                placeholder="লেখকের নাম"
                value={form.bookAuthor}
                onChange={(e) => setForm({ ...form, bookAuthor: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Input
                  placeholder="ISBN"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={handleIsbnLookup}>
                  বই খুঁজুন
                </Button>
              </div>
              <Input
                placeholder="কভার ইমেজ URL"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              />
              <Input
                placeholder="জেনার (কমা দিয়ে আলাদা করুন)"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
              <div className="flex items-center gap-3">
                <Switch
                  id="spoilers"
                  checked={form.spoilers}
                  onCheckedChange={(checked) => setForm({ ...form, spoilers: checked })}
                />
                <Label htmlFor="spoilers">স্পয়লার আছে</Label>
              </div>
              <Select value={form.shelf} onValueChange={(value) => setForm({ ...form, shelf: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="শেলফ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">চলতি পড়া</SelectItem>
                  <SelectItem value="finished">পড়া শেষ</SelectItem>
                </SelectContent>
              </Select>
              <TiptapEditor
                content={form.review}
                onChange={(html) => setForm({ ...form, review: html })}
              />
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((statusValue) => (
                    <SelectItem key={statusValue} value={statusValue}>
                      {statusValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.status === 'scheduled' && (
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} className="bg-saffron-300 text-ink-200">
                  {editingId ? 'আপডেট করুন' : 'নতুন রিভিউ প্রকাশ'}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    বাতিল
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink-200">সাম্প্রতিক রিভিউ</h2>
            {reviews.map((review) => (
              <div key={review._id!.toString()} className="bg-white border border-cream-200 rounded-lg p-4">
                <h3 className="font-medium text-ink-200 line-clamp-2">{review.bookTitle}</h3>
                <p className="text-xs text-ink-50 mb-3">{review.status}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(review)}>
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(review._id!.toString())}>
                    মুছুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
