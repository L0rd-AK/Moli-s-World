import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IUser } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection<IUser>('users')
      .findOne({ _id: session.user.id });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return safe user data (exclude passwordHash)
    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Allow updating only specific fields
    const allowedUpdates = ['name', 'image', 'bio', 'website', 'location', 'preferences'];
    const updates: any = {};

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    updates.updatedAt = new Date();

    const result = await db
      .collection<IUser>('users')
      .findOneAndUpdate(
        { _id: session.user.id },
        { $set: updates },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = result.value;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}