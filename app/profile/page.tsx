'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UserNav } from '@/components/user-nav';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  bio?: string;
  website?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
    image: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setForm({
          name: data.user.name || '',
          bio: data.user.bio || '',
          website: data.user.website || '',
          location: data.user.location || '',
          image: data.user.image || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'প্রোফাইল আপডেট হয়েছে!' });
        fetchProfile();
      } else {
        setMessage({ type: 'error', text: 'আপডেট করতে ব্যর্থ হয়েছে।' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'একটি ত্রুটি ঘটেছে।' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="bengali-text text-ink-100">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">প্রোফাইল</h1>
        <DashboardNav />

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-cream-50 border border-cream-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">নাম</label>
              <Input
                placeholder="আপনার নাম"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">ইমেইল</label>
              <Input
                type="email"
                value={session.user?.email || ''}
                disabled
                className="bg-cream-50"
              />
              <p className="text-xs text-ink-50 mt-1">ইমেইল পরিবর্তন করা যাবে না।</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">প্রোফাইল ছবি URL</label>
              <Input
                placeholder="https://example.com/photo.jpg"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">বায়ো (পরিচিতি)</label>
              <Textarea
                placeholder="আপনার সম্পর্কে সংক্ষেপে লিখুন"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">ওয়েবসাইট</label>
              <Input
                placeholder="https://yourwebsite.com"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-2">অবস্থান</label>
              <Input
                placeholder="ঢাকা, বাংলাদেশ"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="border-t border-cream-200 pt-4">
              <h3 className="text-lg font-medium text-ink-200 mb-2">অ্যাকাউন্ট তথ্য</h3>
              <div className="space-y-2 text-sm text-ink-100">
                <p>
                  <span className="font-medium">ভূমিকা:</span> {profile?.role}
                </p>
                <p>
                  <span className="font-medium">সদস্যতা:</span>{' '}
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('bn-BD')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="bg-saffron-300 text-ink-200">
              {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}