'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { INote } from '@/models/Note';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { StickyNote, Pin, PinOff, Search, Eye, EyeOff, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stripHtml } from '@/lib/content';

const colors = [
  { value: 'default', label: 'ডিফল্ট', bg: 'bg-cream-50', border: 'border-cream-200', dot: 'bg-cream-300' },
  { value: 'saffron', label: 'জাফরান', bg: 'bg-saffron-50', border: 'border-saffron-200', dot: 'bg-saffron-300' },
  { value: 'rose', label: 'গোলাপি', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-400' },
  { value: 'sky', label: 'আকাশি', bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-400' },
  { value: 'emerald', label: 'পান্না', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  { value: 'violet', label: 'বেগুনি', bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-400' },
];

const getColorClasses = (color: string) =>
  colors.find((c) => c.value === color) || colors[0];

export default function DashboardNotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<INote[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    color: 'default',
    isPinned: false,
    isPublic: false,
    status: 'draft',
  });

  const fetchNotes = async () => {
    const params = new URLSearchParams({ status: 'all', limit: '100' });
    if (searchQuery) params.set('search', searchQuery);
    if (filterTag) params.set('tag', filterTag);
    const response = await fetch(`/api/notes?${params}`);
    if (response.ok) {
      const data = await response.json();
      setNotes(data.notes || []);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, filterTag]);

  if (status === 'loading') return <div className="py-12">লোড হচ্ছে...</div>;
  if (!session || session.user.role !== 'admin') return null;

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      title: '',
      content: '',
      tags: '',
      color: 'default',
      isPinned: false,
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

    const response = await fetch(editingId ? `/api/notes/${editingId}` : '/api/notes', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await fetchNotes();
      resetForm();
    }
    setIsSaving(false);
  };

  const handleEdit = (note: INote) => {
    setEditingId(note._id!.toString());
    setShowForm(true);
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      color: note.color,
      isPinned: note.isPinned,
      isPublic: note.isPublic,
      status: note.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?')) return;
    const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (response.ok) await fetchNotes();
  };

  const togglePin = async (note: INote) => {
    await fetch(`/api/notes/${note._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    });
    await fetchNotes();
  };

  const togglePublic = async (note: INote) => {
    await fetch(`/api/notes/${note._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !note.isPublic }),
    });
    await fetchNotes();
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-ink-200 bengali-text">নোটস</h1>
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন নোট
          </Button>
        </div>
        <DashboardNav />

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-50" />
            <Input
              placeholder="নোট খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {allTags.length > 0 && (
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ট্যাগ ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ট্যাগ</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="mb-8 bg-cream-50 border border-cream-200 rounded-lg p-6 relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-ink-50 hover:text-ink-200">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-ink-200 mb-4">
              {editingId ? 'নোট সম্পাদনা' : 'নতুন নোট'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="শিরোনাম"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="আপনার নোট এখানে লিখুন..."
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
              {/* Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-100">রঙ:</span>
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-transform',
                      c.dot,
                      form.color === c.value ? 'scale-125 border-ink-200' : 'border-transparent hover:scale-110'
                    )}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-ink-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  পিন করুন
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  সর্বজনীন
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} className="bg-saffron-300 text-ink-200">
                  {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>বাতিল</Button>
              </div>
            </form>
          </div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-ink-50 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Pin className="h-3 w-3" /> পিন করা
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id!.toString()}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={togglePin}
                  onTogglePublic={togglePublic}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Notes */}
        {unpinnedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note._id!.toString()}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={togglePin}
                onTogglePublic={togglePublic}
              />
            ))}
          </div>
        ) : !pinnedNotes.length && !showForm ? (
          <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
            <StickyNote className="h-16 w-16 text-cream-300 mx-auto mb-4" />
            <p className="bengali-text text-ink-100 mb-4">এখনও কোনও নোট নেই।</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-saffron-300 hover:bg-saffron-400 text-ink-200"
            >
              প্রথম নোট তৈরি করুন
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublic,
}: {
  note: INote;
  onEdit: (note: INote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: INote) => void;
  onTogglePublic: (note: INote) => void;
}) {
  const colorClasses = getColorClasses(note.color);
  const plainText = stripHtml(note.content);
  const preview = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-shadow hover:shadow-md group relative',
        colorClasses.bg,
        colorClasses.border
      )}
    >
      {/* Top Actions */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-ink-200 line-clamp-1 flex-1 pr-2">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(note)} className="p-1 hover:text-saffron-300" title={note.isPinned ? 'আনপিন' : 'পিন'}>
            {note.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => onTogglePublic(note)} className="p-1 hover:text-saffron-300" title={note.isPublic ? 'ব্যক্তিগত' : 'সর্বজনীন'}>
            {note.isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <p className="text-sm text-ink-100 line-clamp-4 mb-3">{preview}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-ink-100">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-ink-50">
        <span>{new Date(note.updatedAt).toLocaleDateString('bn-BD')}</span>
        <div className="flex gap-1">
          <span className={cn('px-1.5 py-0.5 rounded text-[10px]', note.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-cream-200 text-ink-50')}>
            {note.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
          </span>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onEdit(note)}>সম্পাদনা</Button>
        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(note._id!.toString())}>মুছুন</Button>
      </div>
    </div>
  );
}
