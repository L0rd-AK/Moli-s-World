import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { INote } from '@/models/Note';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';

    if (!isAdmin) {
      query.isPublic = true;
      query.status = 'published';
    } else if (status !== 'all') {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await db
      .collection<INote>('notes')
      .find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<INote>('notes').countDocuments(query);

    return NextResponse.json({
      notes,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags, color, isPinned, isPublic, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content);

    const client = await clientPromise;
    const db = client.db();

    const note: INote = {
      title,
      content: sanitizedContent,
      tags: tags || [],
      color: color || 'default',
      isPinned: isPinned || false,
      isPublic: isPublic || false,
      status: status || 'draft',
      author: {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<INote>('notes').insertOne(note);

    return NextResponse.json(
      { message: 'Note created successfully', noteId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
