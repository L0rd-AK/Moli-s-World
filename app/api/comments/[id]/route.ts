import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IComment } from '@/models/Comment';
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
