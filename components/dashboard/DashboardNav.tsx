'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  PenLine,
  Book,
  BookOpen,
  MessageSquare,
  Settings,
  StickyNote,
  CalendarDays,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/posts', label: 'ব্লগ', icon: PenLine },
  { href: '/dashboard/poems', label: 'কবিতা', icon: Book },
  { href: '/dashboard/reviews', label: 'বই রিভিউ', icon: BookOpen },
  { href: '/dashboard/notes', label: 'নোটস', icon: StickyNote },
  { href: '/dashboard/journal', label: 'জার্নাল', icon: CalendarDays },
  { href: '/dashboard/comments', label: 'মন্তব্য', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'সেটিংস', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    isActive
                      ? 'bg-saffron-300 hover:bg-saffron-400 text-ink-200'
                      : 'text-ink-100 hover:text-saffron-300'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}