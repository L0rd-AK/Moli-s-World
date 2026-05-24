'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    bio: '',
    authorName: '',
    authorImage: '',
    twitter: '',
    facebook: '',
    github: '',
    email: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const fetchSettings = async () => {
    const response = await fetch('/api/admin/settings');
    if (response.ok) {
      const data = await response.json();
      if (data.settings) {
        setForm((prev) => ({ ...prev, ...data.settings }));
      }
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  if (status === 'loading') {
    return <div className="py-12">লোড হচ্ছে...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">সাইট সেটিংস</h1>
        <DashboardNav />

        <form onSubmit={handleSubmit} className="space-y-4 bg-cream-50 border border-cream-200 rounded-lg p-6">
          <Input
            placeholder="সাইট নাম"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
          <Input
            placeholder="সাইট বর্ণনা"
            value={form.siteDescription}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
          />
          <Textarea
            placeholder="লেখকের পরিচিতি"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <Input
            placeholder="লেখকের নাম"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
          <Input
            placeholder="লেখকের ছবি URL"
            value={form.authorImage}
            onChange={(e) => setForm({ ...form, authorImage: e.target.value })}
          />
          <Input
            placeholder="Twitter"
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
          />
          <Input
            placeholder="Facebook"
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          />
          <Input
            placeholder="GitHub"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
          />
          <Input
            placeholder="যোগাযোগের ইমেইল"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="SEO শিরোনাম"
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          />
          <Textarea
            placeholder="SEO বর্ণনা"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
          <Input
            placeholder="SEO কীওয়ার্ড"
            value={form.seoKeywords}
            onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
          />
          <Button type="submit" disabled={isSaving} className="bg-saffron-300 text-ink-200">
            সংরক্ষণ করুন
          </Button>
        </form>
      </div>
    </div>
  );
}
