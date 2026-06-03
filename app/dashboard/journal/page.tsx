'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { IJournal } from '@/models/Journal';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { CalendarDays, List, Search, Eye, EyeOff, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stripHtml } from '@/lib/content';

const moods = [
  { value: 'প্রশান্ত', label: 'প্রশান্ত', emoji: '😌' },
  { value: 'আনন্দিত', label: 'আনন্দিত', emoji: '😊' },
  { value: 'বিষণ্ণ', label: 'বিষণ্ণ', emoji: '😔' },
  { value: 'উদ্যমী', label: 'উদ্যমী', emoji: '⚡' },
  { value: 'চিন্তিত', label: 'চিন্তিত', emoji: '😟' },
  { value: 'কৃতজ্ঞ', label: 'কৃতজ্ঞ', emoji: '🙏' },
];

const getMoodEmoji = (mood: string) => moods.find((m) => m.value === mood)?.emoji || '';

export default function DashboardJournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<IJournal[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [form, setForm] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 10),
    mood: 'প্রশান্ত',
    tags: '',
    isPublic: false,
    status: 'draft',
  });

  const fetchEntries = async () => {
    const params = new URLSearchParams({ status: 'all', limit: '200' });
    if (searchQuery) params.set('search', searchQuery);
    if (filterMood && filterMood !== 'all') params.set('mood', filterMood);
    const response = await fetch(`/api/journal?${params}`);
    if (response.ok) {
      const data = await response.json();
      setEntries(data.entries || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetchEntries();
  }, [searchQuery, filterMood]);

  if (status === 'loading') return <div className="py-12">লোড হচ্ছে...</div>;
  if (!session || session.user.role !== 'admin') return null;

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      title: '',
      content: '',
      date: new Date().toISOString().slice(0, 10),
      mood: 'প্রশান্ত',
      tags: '',
      isPublic: false,
      status: 'draft',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const response = await fetch(editingId ? `/api/journal/${editingId}` : '/api/journal', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await fetchEntries();
      resetForm();
    }
    setIsSaving(false);
  };

  const handleEdit = (entry: IJournal) => {
    setEditingId(entry._id!.toString());
    setShowForm(true);
    setForm({
      title: entry.title,
      content: entry.content,
      date: new Date(entry.date).toISOString().slice(0, 10),
      mood: entry.mood,
      tags: entry.tags.join(', '),
      isPublic: entry.isPublic,
      status: entry.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?')) return;
    const response = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
    if (response.ok) await fetchEntries();
  };

  const togglePublic = async (entry: IJournal) => {
    await fetch(`/api/journal/${entry._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !entry.isPublic }),
    });
    await fetchEntries();
  };

  const openNewEntryForDate = (dateStr: string) => {
    resetForm();
    setForm((prev) => ({ ...prev, date: dateStr }));
    setShowForm(true);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-ink-200 bengali-text">দৈনিক জার্নাল</h1>
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন এন্ট্রি
          </Button>
        </div>
        <DashboardNav />

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-50" />
            <Input
              placeholder="জার্নাল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterMood} onValueChange={setFilterMood}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="মেজাজ ফিল্টার" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব মেজাজ</SelectItem>
              {moods.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.emoji} {m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border border-cream-200 rounded-md overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={cn('px-3 py-2 text-sm', view === 'calendar' ? 'bg-saffron-300 text-ink-200' : 'bg-cream-50 text-ink-100 hover:bg-cream-100')}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('px-3 py-2 text-sm', view === 'list' ? 'bg-saffron-300 text-ink-200' : 'bg-cream-50 text-ink-100 hover:bg-cream-100')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-cream-50 border border-cream-200 rounded-lg p-6 relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-ink-50 hover:text-ink-200">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-ink-200 mb-4">
              {editingId ? 'এন্ট্রি সম্পাদনা' : 'নতুন জার্নাল এন্ট্রি'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="শিরোনাম"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="flex-1 min-w-[200px]"
                />
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-[180px]"
                />
              </div>
              {/* Mood Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-100">মেজাজ:</span>
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm({ ...form, mood: m.value })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      form.mood === m.value
                        ? 'bg-saffron-100 border-saffron-300 text-ink-200 scale-105'
                        : 'bg-cream-50 border-cream-200 text-ink-100 hover:border-saffron-200'
                    )}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="আজকের দিনটি কেমন ছিল..."
              />
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="ট্যাগ (কমা দিয়ে আলাদা করুন)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="flex-1 min-w-[200px]"
                />
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">খসড়া</SelectItem>
                    <SelectItem value="published">প্রকাশিত</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  className="rounded"
                />
                সর্বজনীন
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} className="bg-saffron-300 text-ink-200">
                  {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>বাতিল</Button>
              </div>
            </form>
          </div>
        )}

        {/* Views */}
        {view === 'calendar' ? (
          <CalendarView
            entries={entries}
            calendarDate={calendarDate}
            onChangeMonth={setCalendarDate}
            onEdit={handleEdit}
            onClickDate={openNewEntryForDate}
          />
        ) : (
          <ListView
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublic={togglePublic}
          />
        )}
      </div>
    </div>
  );
}

function CalendarView({
  entries,
  calendarDate,
  onChangeMonth,
  onEdit,
  onClickDate,
}: {
  entries: IJournal[];
  calendarDate: Date;
  onChangeMonth: (d: Date) => void;
  onEdit: (e: IJournal) => void;
  onClickDate: (dateStr: string) => void;
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const entryMap = useMemo(() => {
    const map: Record<string, IJournal[]> = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  const prevMonth = () => onChangeMonth(new Date(year, month - 1, 1));
  const nextMonth = () => onChangeMonth(new Date(year, month + 1, 1));

  const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-cream-50 border border-cream-200 rounded-lg p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-cream-100 rounded-lg">
          <ChevronLeft className="h-5 w-5 text-ink-100" />
        </button>
        <h2 className="text-xl font-semibold text-ink-200 bengali-text">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-cream-100 rounded-lg">
          <ChevronRight className="h-5 w-5 text-ink-100" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-ink-50 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEntries = entryMap[dateKey] || [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          return (
            <div
              key={dateKey}
              className={cn(
                'min-h-[80px] p-1.5 rounded-lg border text-sm cursor-pointer transition-colors',
                isToday ? 'border-saffron-300 bg-saffron-50' : 'border-cream-100 hover:border-cream-300 hover:bg-cream-100'
              )}
              onClick={() => dayEntries.length > 0 ? onEdit(dayEntries[0]) : onClickDate(dateKey)}
            >
              <div className={cn('text-xs font-medium mb-1', isToday ? 'text-saffron-400' : 'text-ink-100')}>
                {day}
              </div>
              {dayEntries.map((entry) => (
                <div
                  key={entry._id!.toString()}
                  className="text-[11px] leading-tight truncate bg-saffron-100 text-ink-200 rounded px-1 py-0.5 mb-0.5"
                  onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                >
                  {getMoodEmoji(entry.mood)} {entry.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({
  entries,
  onEdit,
  onDelete,
  onTogglePublic,
}: {
  entries: IJournal[];
  onEdit: (e: IJournal) => void;
  onDelete: (id: string) => void;
  onTogglePublic: (e: IJournal) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
        <CalendarDays className="h-16 w-16 text-cream-300 mx-auto mb-4" />
        <p className="bengali-text text-ink-100">এখনও কোনও জার্নাল এন্ট্রি নেই।</p>
      </div>
    );
  }

  const grouped = entries.reduce<Record<string, IJournal[]>>((acc, entry) => {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  return (
    <div className="space-y-8">
      {Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([monthKey, monthEntries]) => {
          const [y, m] = monthKey.split('-');
          return (
            <div key={monthKey}>
              <h3 className="text-lg font-semibold text-ink-200 bengali-text mb-4 border-b border-cream-200 pb-2">
                {monthNames[parseInt(m) - 1]} {y}
              </h3>
              <div className="space-y-3">
                {monthEntries.map((entry) => {
                  const plainText = stripHtml(entry.content);
                  const preview = plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText;
                  return (
                    <div
                      key={entry._id!.toString()}
                      className="bg-cream-50 border border-cream-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                            <h4 className="font-semibold text-ink-200">{entry.title}</h4>
                            <span className="text-xs text-ink-50">
                              {new Date(entry.date).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                          <p className="text-sm text-ink-100 line-clamp-2">{preview}</p>
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-ink-100">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                          <button onClick={() => onTogglePublic(entry)} className="p-1.5 hover:text-saffron-300" title={entry.isPublic ? 'ব্যক্তিগত' : 'সর্বজনীন'}>
                            {entry.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onEdit(entry)}>সম্পাদনা</Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(entry._id!.toString())}>মুছুন</Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', entry.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-cream-200 text-ink-50')}>
                          {entry.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                        </span>
                        {entry.isPublic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">সর্বজনীন</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
