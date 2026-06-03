import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IJournal } from '@/models/Journal';
import { sanitizeHtml } from '@/lib/sanitize';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const entryId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const entry = await db.collection<IJournal>('journal').findOne({ _id: entryId as any });
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (!entry.isPublic) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, date, ...rest } = body;

    const updates: Partial<IJournal> = { ...rest };
    if (content) {
      updates.content = sanitizeHtml(content);
    }
    if (date) {
      updates.date = new Date(date);
    }
    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const entryId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IJournal>('journal').updateOne({ _id: entryId as any }, { $set: updates });

    return NextResponse.json({ message: 'Journal entry updated' });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
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
    const entryId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IJournal>('journal').deleteOne({ _id: entryId as any });

    return NextResponse.json({ message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}
