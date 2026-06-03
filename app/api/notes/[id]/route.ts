import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { INote } from '@/models/Note';
import { sanitizeHtml } from '@/lib/sanitize';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const noteId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const note = await db.collection<INote>('notes').findOne({ _id: noteId as any });
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (!note.isPublic) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, ...rest } = body;

    const updates: Partial<INote> = { ...rest };
    if (content) {
      updates.content = sanitizeHtml(content);
    }
    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const noteId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<INote>('notes').updateOne({ _id: noteId as any }, { $set: updates });

    return NextResponse.json({ message: 'Note updated' });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const noteId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<INote>('notes').deleteOne({ _id: noteId as any });

    return NextResponse.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
