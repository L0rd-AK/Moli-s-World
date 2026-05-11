import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IComment } from '@/models/Comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { sanitizeHtml } from '@/lib/sanitize';
import { verifyTurnstile } from '@/lib/turnstile';
import { resend } from '@/lib/resend';
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
    const rate = await rateLimit(request, 'comments:create');
    if (!rate.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { content, postId, poemId, reviewId, parentId, authorName, authorEmail, turnstileToken } = body;
    const guestName = (authorName || '').trim();
    const guestEmail = (authorEmail || '').trim();

    if (!content || (!postId && !poemId && !reviewId)) {
      return NextResponse.json(
        { error: 'Content and parent ID are required' },
        { status: 400 }
      );
    }

    if (!session && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { error: 'Guest name and email are required' },
        { status: 400 }
      );
    }

    if (!session) {
      const verification = await verifyTurnstile(
        turnstileToken || '',
        request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      );
      if (!verification.success) {
        return NextResponse.json({ error: 'Turnstile verification failed' }, { status: 400 });
      }
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
        name: session?.user?.name || guestName || 'Guest',
        email: session?.user?.email || guestEmail || 'guest@example.com',
        image: session?.user?.image || '',
        userId: session?.user?.id || undefined,
      },
      isGuest: !session,
      status: session?.user?.role === 'admin' ? 'approved' : 'pending',
      turnstileToken: turnstileToken || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IComment>('comments').insertOne(comment);

    if (comment.status === 'approved' && resend) {
      const resendFrom = process.env.RESEND_FROM_EMAIL || 'Bengali Literature <notifications@bengaliliterature.com>';
      const collection = postId ? 'posts' : poemId ? 'poems' : 'reviews';
      const parentKey = postId || poemId || reviewId;
      if (parentKey) {
        const lookupId = ObjectId.isValid(parentKey) ? new ObjectId(parentKey) : parentKey;
        const parent = await db.collection(collection).findOne({ _id: lookupId });
        const author = parent?.author;
        if (author?.email) {
          await resend.emails.send({
            from: resendFrom,
            to: [author.email],
            subject: 'নতুন মন্তব্য এসেছে',
            html: `
              <div style="font-family: 'Noto Serif Bengali', serif; line-height: 1.6;">
                <h2 style="margin: 0 0 12px;">নতুন মন্তব্য</h2>
                <p>আপনার লেখায় নতুন মন্তব্য এসেছে।</p>
                <p><strong>${comment.author.name}</strong> লিখেছেন:</p>
                <blockquote style="margin: 12px 0; padding-left: 12px; border-left: 3px solid #D4851A;">
                  ${sanitizedContent}
                </blockquote>
              </div>
            `,
          });
        }
      }
    }

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