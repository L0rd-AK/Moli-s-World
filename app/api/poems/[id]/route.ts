import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IPoem } from '@/models/Poem';
import { sanitizeHtml } from '@/lib/sanitize';
import { stripHtml } from '@/lib/content';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const poemId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const poem = await db.collection<IPoem>('poems').findOne({ _id: poemId });
    if (!poem) {
      return NextResponse.json({ error: 'Poem not found' }, { status: 404 });
    }

    return NextResponse.json({ poem });
  } catch (error) {
    console.error('Error fetching poem:', error);
    return NextResponse.json({ error: 'Failed to fetch poem' }, { status: 500 });
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

    const updates: Partial<IPoem> = { ...rest };
    if (content) {
      const sanitizedContent = sanitizeHtml(content);
      updates.content = sanitizedContent;
      updates.excerpt =
        excerpt ||
        stripHtml(sanitizedContent)
          .split(' ')
          .slice(0, 28)
          .join(' ');
    }
    if (updates.status === 'published' && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const poemId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IPoem>('poems').updateOne({ _id: poemId }, { $set: updates });

    return NextResponse.json({ message: 'Poem updated' });
  } catch (error) {
    console.error('Error updating poem:', error);
    return NextResponse.json({ error: 'Failed to update poem' }, { status: 500 });
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
    const poemId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IPoem>('poems').deleteOne({ _id: poemId });

    return NextResponse.json({ message: 'Poem deleted' });
  } catch (error) {
    console.error('Error deleting poem:', error);
    return NextResponse.json({ error: 'Failed to delete poem' }, { status: 500 });
  }
}
