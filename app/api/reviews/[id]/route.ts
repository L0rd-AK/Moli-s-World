import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IReview } from '@/models/Review';
import { sanitizeHtml } from '@/lib/sanitize';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const reviewId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    const review = await db.collection<IReview>('reviews').findOne({ _id: reviewId });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { review, ...rest } = body;

    const updates: Partial<IReview> = { ...rest };
    if (updates.rating !== undefined) {
      updates.rating = Number(updates.rating);
    }
    if (review) {
      updates.review = sanitizeHtml(review);
    }
    if (updates.status === 'published' && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db();
    const reviewId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IReview>('reviews').updateOne({ _id: reviewId }, { $set: updates });

    return NextResponse.json({ message: 'Review updated' });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
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
    const reviewId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;

    await db.collection<IReview>('reviews').deleteOne({ _id: reviewId });

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
