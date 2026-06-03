import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IReview } from '@/models/Review';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const genre = searchParams.get('genre');
    const shelf = searchParams.get('shelf');

    const client = await clientPromise;
    const db = client.db();

    const query: any = {};
    if (status !== 'all') {
      query.status = status;
      if (status === 'published') {
        query.publishedAt = { $ne: null };
      }
    }
    if (genre) {
      query.genre = genre;
    }
    if (shelf) {
      query.shelf = shelf;
    }

    const reviews = await db
      .collection<IReview>('reviews')
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection<IReview>('reviews').countDocuments(query);

    return NextResponse.json({ reviews, pagination: { total, limit, skip } });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
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
      bookTitle,
      bookAuthor,
      isbn,
      coverImage,
      rating,
      review,
      spoilers,
      genre,
      shelf,
      status,
      scheduledAt,
    } = body;

    if (!bookTitle || !bookAuthor || !rating || !review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const reviewDoc: IReview = {
      bookTitle,
      bookAuthor,
      isbn,
      coverImage,
      rating: Number(rating),
      review: sanitizeHtml(review),
      spoilers: spoilers || false,
      genre: genre || [],
      shelf: shelf || 'finished',
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

    const result = await db.collection<IReview>('reviews').insertOne(reviewDoc);

    return NextResponse.json(
      { message: 'Review created successfully', reviewId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
