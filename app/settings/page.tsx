'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    language: 'bn',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadSettings();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        // Load user preferences if they exist
        if (data.user.preferences) {
          setSettings((prev) => ({ ...prev, ...data.user.preferences }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
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
        body: JSON.stringify({ preferences: settings }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'সেটিংস আপডেট হয়েছে!' });
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
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">সেটিংস</h1>
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
              <h3 className="text-lg font-medium text-ink-200 mb-4">নোটিফিকেশন</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({ ...settings, emailNotifications: e.target.checked })
                    }
                    className="w-4 h-4 text-saffron-300 border-cream-200 rounded focus:ring-saffron-300"
                  />
                  <span className="text-ink-100">ইমেইল নোটিফিকেশন</span>
                </label>
              </div>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h3 className="text-lg font-medium text-ink-200 mb-4">দৃশ্য</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      setSettings({ ...settings, darkMode: e.target.checked })
                    }
                    className="w-4 h-4 text-saffron-300 border-cream-200 rounded focus:ring-saffron-300"
                  />
                  <span className="text-ink-100">ডার্ক মোড</span>
                </label>
              </div>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h3 className="text-lg font-medium text-ink-200 mb-4">ভাষা</h3>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-3 py-2 border border-cream-200 rounded-md bg-cream-50 text-ink-200 focus:outline-none focus:ring-2 focus:ring-saffron-300"
              >
                <option value="bn">বাংলা</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h3 className="text-lg font-medium text-ink-200 mb-4">গোপনীয়তা</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="w-4 h-4 text-saffron-300 border-cream-200 rounded focus:ring-saffron-300"
                  />
                  <span className="text-ink-100">প্রোফাইল পাবলিক</span>
                  <span className="text-xs text-ink-50">(শীঘ্রই আসছে)</span>
                </label>
              </div>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h3 className="text-lg font-medium text-ink-200 mb-4">ডেটা এবং গোপনীয়তা</h3>
              <div className="space-y-3 text-sm text-ink-100">
                <p>আপনার ডেটা নিরাপদে সংরক্ষিত হয়।</p>
                <p>আমরা কখনোই আপনার তথ্য বিক্রি করি না।</p>
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