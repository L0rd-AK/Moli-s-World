import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IPost } from '@/models/Post';
import { sanitizeHtml } from '@/lib/sanitize';
import { estimateReadingTime, stripHtml } from '@/lib/content';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const postId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const post = await db.collection<IPost>('posts').findOne({ _id: postId as any });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, excerpt, ...rest } = body;

    const updates: Partial<IPost> = { ...rest };
    if (content) {
      const sanitizedContent = sanitizeHtml(content);
      updates.content = sanitizedContent;
      updates.excerpt =
        excerpt ||
        stripHtml(sanitizedContent)
          .split(' ')
          .slice(0, 40)
          .join(' ');
      updates.readingTime = estimateReadingTime(sanitizedContent);
    }
    if (updates.status === 'published' && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const postId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IPost>('posts').updateOne({ _id: postId as any }, { $set: updates });

    return NextResponse.json({ message: 'Post updated' });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
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
    const postId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IPost>('posts').deleteOne({ _id: postId as any });

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
