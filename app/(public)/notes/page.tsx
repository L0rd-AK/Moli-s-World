import { Metadata } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { INote } from '@/models/Note';
import { Button } from '@/components/ui/button';
import { StickyNote, Pin } from 'lucide-react';
import Link from 'next/link';
import { stripHtml } from '@/lib/content';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'নোটস | মলির দুনিয়া',
  description: 'চিন্তা, ভাবনা এবং ছোট ছোট লেখা',
};

export const revalidate = 60;

const colorMap: Record<string, { bg: string; border: string }> = {
  default: { bg: 'bg-cream-50', border: 'border-cream-200' },
  saffron: { bg: 'bg-saffron-50', border: 'border-saffron-200' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200' },
};

export default async function PublicNotesPage() {
  const client = await clientPromise;
  const db = client.db();

  const notes = await db
    .collection<INote>('notes')
    .find({ isPublic: true, status: 'published' })
    .sort({ isPinned: -1, updatedAt: -1 })
    .toArray();

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const otherNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-display-fluid font-display text-ink-200 mb-4">নোটস</h1>
          <p className="bengali-text text-lg text-ink-100 max-w-2xl mx-auto">
            চিন্তা, ভাবনা এবং ছোট ছোট লেখা — একটু একটু করে জমে ওঠা কথামালা।
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-20 bg-cream-50 rounded-lg border border-cream-200">
            <StickyNote className="h-16 w-16 text-cream-300 mx-auto mb-4" />
            <p className="bengali-text text-ink-100">এখনও কোনও নোট প্রকাশিত হয়নি।</p>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-sm text-ink-50 uppercase tracking-wider">
                  <Pin className="h-3 w-3" />
                  <span>পিন করা</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((note) => (
                    <PublicNoteCard key={note._id!.toString()} note={note} />
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherNotes.map((note) => (
                <PublicNoteCard key={note._id!.toString()} note={note} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PublicNoteCard({ note }: { note: INote }) {
  const colors = colorMap[note.color] || colorMap.default;
  const plainText = stripHtml(note.content);
  const preview = plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText;

  return (
    <div className={cn('rounded-lg border p-6 hover:shadow-lg transition-shadow', colors.bg, colors.border)}>
      {note.isPinned && <Pin className="h-3.5 w-3.5 text-saffron-300 mb-2" />}
      <h2 className="font-semibold text-ink-200 text-lg mb-2">{note.title}</h2>
      <p className="text-sm text-ink-100 line-clamp-5 mb-4">{preview}</p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cream-200/80 text-ink-100">{tag}</span>
          ))}
        </div>
      )}
      <span className="text-xs text-ink-50">
        {new Date(note.updatedAt).toLocaleDateString('bn-BD')}
      </span>
    </div>
  );
}
