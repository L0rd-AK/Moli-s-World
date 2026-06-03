import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IPoem } from '@/models/Poem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';
import { stripHtml } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const mood = searchParams.get('mood');
    const tag = searchParams.get('tag');

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};
    if (status !== 'all') {
      query.status = status;
      if (status === 'published') {
        query.publishedAt = { $ne: null };
      }
    }
    if (mood) {
      query.mood = mood;
    }
    if (tag) {
      query.tags = tag;
    }

    const poems = await db
      .collection<IPoem>('poems')
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<IPoem>('poems').countDocuments(query);

    return NextResponse.json({ poems, pagination: { total, limit, skip } });
  } catch (error) {
    console.error('Error fetching poems:', error);
    return NextResponse.json({ error: 'Failed to fetch poems' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      audioUrl,
      audioDuration,
      mood,
      tags,
      status,
      scheduledAt,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content);
    const excerptText =
      excerpt ||
      stripHtml(sanitizedContent)
        .split(' ')
        .slice(0, 28)
        .join(' ');

    const client = await clientPromise;
    const db = client.db();

    const poem: IPoem = {
      title,
      slug,
      content: sanitizedContent,
      excerpt: excerptText,
      coverImage,
      audioUrl,
      audioDuration,
      mood: mood || [],
      tags: tags || [],
      views: 0,
      status: status || 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      publishedAt: status === 'published' ? new Date() : undefined,
      author: {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IPoem>('poems').insertOne(poem);

    return NextResponse.json(
      { message: 'Poem created successfully', poemId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating poem:', error);
    return NextResponse.json({ error: 'Failed to create poem' }, { status: 500 });
  }
}
