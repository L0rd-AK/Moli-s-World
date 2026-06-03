'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-cream-50 border border-cream-200 rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink-200 mb-6 text-center">অ্যাডমিন লগ ইন</h1>

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ink-200 hover:bg-ink-300 text-cream-50"
          >
            {isLoading ? 'প্রক্রিয়াকরণ...' : 'লগ ইন'}
          </Button>
        </form>
      </div>
    </div>
  );
}
