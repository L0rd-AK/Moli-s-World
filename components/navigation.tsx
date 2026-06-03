'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';
import { PenLine, BookOpen, Book, User, LayoutDashboard, StickyNote, CalendarDays } from 'lucide-react';

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-cream-200 bg-cream-50/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-saffron-300" />
            <span className="font-display text-xl font-bold text-ink-200">
              মলির দুনিয়া 
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/blog"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <PenLine className="h-4 w-4" />
              <span>ব্লগ</span>
            </Link>
            <Link
              href="/kobita"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <Book className="h-4 w-4" />
              <span>কবিতা</span>
            </Link>
            <Link
              href="/boimela"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <BookOpen className="h-4 w-4" />
              <span>বইমেলা</span>
            </Link>
            <Link
              href="/notes"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <StickyNote className="h-4 w-4" />
              <span>নোটস</span>
            </Link>
            <Link
              href="/journal"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <CalendarDays className="h-4 w-4" />
              <span>জার্নাল</span>
            </Link>
            <Link
              href="/about"
              className="text-ink-100 hover:text-saffron-300 transition-colors flex items-center space-x-1"
            >
              <User className="h-4 w-4" />
              <span>পরিচিতি</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <>
                {session.user?.role === 'admin' && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>ড্যাশবোর্ড</span>
                    </Button>
                  </Link>
                )}
                <UserNav />
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
                >
                  লগ ইন
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}