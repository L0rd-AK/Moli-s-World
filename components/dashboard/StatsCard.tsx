import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StatsCardProps {
  title: string;
  value: number;
  href: string;
}

export function StatsCard({ title, value, href }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-cream-200 bg-cream-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-50">{title}</p>
          <p className="text-2xl font-bold text-ink-200">{value}</p>
        </div>
        <Link href={href}>
          <Button size="sm" variant="ghost" className="text-saffron-300">
            দেখুন
          </Button>
        </Link>
      </div>
    </div>
  );
}
