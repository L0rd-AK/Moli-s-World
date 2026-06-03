import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IJournal } from '@/models/Journal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const mood = searchParams.get('mood');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '30');
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

    if (mood) {
      query.mood = mood;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await db
      .collection<IJournal>('journal')
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<IJournal>('journal').countDocuments(query);

    return NextResponse.json({
      entries,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, date, mood, tags, isPublic, status } = body;

    if (!title || !content || !date || !mood) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content);

    const client = await clientPromise;
    const db = client.db();

    const entry: IJournal = {
      title,
      content: sanitizedContent,
      date: new Date(date),
      mood,
      tags: tags || [],
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

    const result = await db.collection<IJournal>('journal').insertOne(entry);

    return NextResponse.json(
      { message: 'Journal entry created successfully', entryId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}
