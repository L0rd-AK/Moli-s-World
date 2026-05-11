'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IBackupLog } from '@/models/BackupLog';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardBackupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<IBackupLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLogs = async () => {
    const response = await fetch('/api/admin/backup/logs');
    if (response.ok) {
      const data = await response.json();
      setLogs(data.logs || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchLogs();
  }, []);

  if (status === 'loading') {
    return <div className="py-12">লোড হচ্ছে...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const triggerBackup = async () => {
    setIsLoading(true);
    setMessage('');
    const response = await fetch('/api/admin/backup/trigger', { method: 'POST' });
    const data = await response.json();
    if (!response.ok && data?.fallback) {
      setMessage('Atlas ব্যাকআপ কনফিগার করা নেই, এক্সপোর্ট ব্যবহার করুন।');
    } else if (response.ok) {
      setMessage('ব্যাকআপ ট্রিগার হয়েছে।');
    }
    await fetchLogs();
    setIsLoading(false);
  };

  const exportBackup = () => {
    window.location.href = '/api/admin/backup/export';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-200 bengali-text mb-6">ব্যাকআপ</h1>
        <DashboardNav />

        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={triggerBackup} disabled={isLoading} className="bg-saffron-300 text-ink-200">
            ব্যাকআপ ট্রিগার করুন
          </Button>
          <Button variant="outline" className="border-saffron-300 text-saffron-300" onClick={exportBackup}>
            এক্সপোর্ট ডাউনলোড
          </Button>
        </div>

        {message && <p className="text-sm text-ink-100 mb-4">{message}</p>}

        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-ink-100">কোনও ব্যাকআপ রেকর্ড নেই।</p>
          ) : (
            logs.map((log) => (
              <div key={log._id.toString()} className="bg-white border border-cream-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink-200">{new Date(log.triggeredAt).toLocaleString('bn-BD')}</p>
                    <p className="text-xs text-ink-50">{log.snapshotId || 'Export'}</p>
                  </div>
                  <span className="text-xs bg-cream-200 text-ink-100 px-2 py-1 rounded">
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
