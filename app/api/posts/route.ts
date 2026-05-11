import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IPost } from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { sanitizeHtml } from '@/lib/sanitize';
import { estimateReadingTime, stripHtml } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};
    if (status !== 'all') {
      query.status = status;
      if (status === 'published') {
        query.publishedAt = { $ne: null };
      }
    }

    const posts = await db
      .collection<IPost>('posts')
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<IPost>('posts').countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = await rateLimit(request, 'posts:create');
    if (!rate.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
      category,
      tags,
      readingTime,
      status,
      scheduledAt,
    } = body;

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content);
    const excerptText =
      excerpt ||
      stripHtml(sanitizedContent)
        .split(' ')
        .slice(0, 40)
        .join(' ');
    const computedReadingTime = readingTime || estimateReadingTime(sanitizedContent);

    const client = await clientPromise;
    const db = client.db();

    const post: IPost = {
      title,
      slug,
      content: sanitizedContent,
      excerpt: excerptText,
      coverImage,
      category,
      tags: tags || [],
      readingTime: computedReadingTime,
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

    const result = await db.collection<IPost>('posts').insertOne(post);

    return NextResponse.json(
      { message: 'Post created successfully', postId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}