import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IComment } from '@/models/Comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const poemId = searchParams.get('poemId');
    const reviewId = searchParams.get('reviewId');
    const status = searchParams.get('status') || 'approved';

    const client = await clientPromise;
    const db = client.db();

    const query: any = { status };
    if (postId) query.postId = postId;
    if (poemId) query.poemId = poemId;
    if (reviewId) query.reviewId = reviewId;

    const comments = await db
      .collection<IComment>('comments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Login required to comment' }, { status: 401 });
    }

    const body = await request.json();
    const { content, postId, poemId, reviewId, parentId } = body;

    if (!content || (!postId && !poemId && !reviewId)) {
      return NextResponse.json(
        { error: 'Content and parent ID are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    if (parentId) {
      const parentLookup = ObjectId.isValid(parentId) ? new ObjectId(parentId) : parentId;
      const parent = await db
        .collection<IComment>('comments')
        .findOne({ _id: parentLookup });
      if (parent?.parentId) {
        return NextResponse.json(
          { error: 'Only two levels of replies are allowed' },
          { status: 400 }
        );
      }
    }

    const sanitizedContent = sanitizeHtml(content);

    const comment: IComment = {
      content: sanitizedContent,
      postId: postId || undefined,
      poemId: poemId || undefined,
      reviewId: reviewId || undefined,
      parentId: parentId || undefined,
      author: {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        userId: session.user.id,
      },
      isGuest: false,
      status: session.user.role === 'admin' ? 'approved' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IComment>('comments').insertOne(comment);

    return NextResponse.json(
      { message: 'Comment submitted successfully', commentId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}