import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IComment } from '@/models/Comment';
import { resend } from '@/lib/resend';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || !['approved', 'rejected', 'spam'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const commentId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const comment = await db.collection<IComment>('comments').findOne({ _id: commentId as any });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await db.collection<IComment>('comments').updateOne(
      { _id: commentId as any },
      { $set: { status, updatedAt: new Date() } }
    );

    if (status === 'approved' && resend) {
      const resendFrom = process.env.RESEND_FROM_EMAIL || 'Bengali Literature <notifications@bengaliliterature.com>';
      const collection = comment.postId ? 'posts' : comment.poemId ? 'poems' : 'reviews';
      const parentKey = comment.postId || comment.poemId || comment.reviewId;
      if (parentKey) {
        const lookupId = ObjectId.isValid(parentKey) ? new ObjectId(parentKey) : parentKey;
        const parent = await db.collection(collection).findOne({ _id: lookupId as any });
        const author = parent?.author;
        if (author?.email) {
          await resend.emails.send({
            from: resendFrom,
            to: [author.email],
            subject: 'মন্তব্য অনুমোদিত হয়েছে',
            html: `
              <div style="font-family: 'Noto Serif Bengali', serif; line-height: 1.6;">
                <h2 style="margin: 0 0 12px;">মন্তব্য অনুমোদিত হয়েছে</h2>
                <p>${comment.author.name} লিখেছেন:</p>
                <blockquote style="margin: 12px 0; padding-left: 12px; border-left: 3px solid #D4851A;">
                  ${comment.content}
                </blockquote>
              </div>
            `,
          });
        }
      }
    }

    return NextResponse.json({ message: 'Comment updated' });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
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
    const commentId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IComment>('comments').deleteOne({ _id: commentId as any });

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
