'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { IPost } from '@/models/Post';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

const categories = ['প্রবন্ধ', 'গল্প', 'স্মৃতিকথা', 'বিজ্ঞান', 'সমাজ'];
const statuses = ['draft', 'published', 'scheduled'];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '');

export default function DashboardPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'প্রবন্ধ',
    tags: '',
    excerpt: '',
    coverImage: '',
    content: '',
    status: 'draft',
    scheduledAt: '',
  });

  const fetchPosts = async () => {
    const response = await fetch('/api/posts?status=all');
    if (response.ok) {
      const data = await response.json();
      setPosts(data.posts || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchPosts();
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
      title: '',
      slug: '',
      category: 'প্রবন্ধ',
      tags: '',
      excerpt: '',
      coverImage: '',
      content: '',
      status: 'draft',
      scheduledAt: '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      scheduledAt: form.scheduledAt || undefined,
    };

    const response = await fetch(editingId ? `/api/posts/${editingId}` : '/api/posts', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await fetchPosts();
      resetForm();
    }

    setIsSaving(false);
  };

  const handleEdit = (post: IPost) => {
    setEditingId(post._id!.toString());
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      tags: post.tags.join(', '),
      excerpt: post.excerpt,
      coverImage: post.coverImage || '',
      content: post.content,
      status: post.status,
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?')) return;
    const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await fetchPosts();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">ব্লগ ব্যবস্থাপনা</h1>
        <DashboardNav />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-cream-200 rounded-lg p-6">
              <Input
                placeholder="শিরোনাম"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Input
                  placeholder="স্লাগ"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-saffron-300 text-saffron-300"
                  onClick={() => setForm({ ...form, slug: slugify(form.title) })}
                >
                  স্লাগ তৈরি
                </Button>
              </div>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="ট্যাগ (কমা দিয়ে আলাদা করুন)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
              <Input
                placeholder="কভার ইমেজ URL"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              />
              <Textarea
                placeholder="সংক্ষিপ্ত বিবরণ"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
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
                  {editingId ? 'আপডেট করুন' : 'নতুন প্রকাশ'}
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
            <h2 className="text-lg font-semibold text-ink-200">সাম্প্রতিক পোস্ট</h2>
            {posts.map((post) => (
              <div key={post._id!.toString()} className="bg-white border border-cream-200 rounded-lg p-4">
                <h3 className="font-medium text-ink-200 line-clamp-2">{post.title}</h3>
                <p className="text-xs text-ink-50 mb-3">{post.status}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post._id!.toString())}>
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
