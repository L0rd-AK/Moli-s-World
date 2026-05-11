import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const collections = type ? [type] : ['posts', 'poems', 'reviews'];
    const results: Record<string, any[]> = {};

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      try {
        const items = await collection
          .aggregate([
            {
              $search: {
                index: 'default',
                text: {
                  query,
                  path: ['title', 'content', 'tags', 'bookTitle', 'review'],
                },
              },
            },
            { $match: { status: 'published' } },
            { $limit: 10 },
          ])
          .toArray();
        results[collectionName] = items;
      } catch (error) {
        const regex = new RegExp(query, 'i');
        const items = await collection
          .find({
            status: 'published',
            $or: [
              { title: regex },
              { content: regex },
              { tags: regex },
              { bookTitle: regex },
              { review: regex },
            ],
          })
          .limit(10)
          .toArray();
        results[collectionName] = items;
      }
    }

    return NextResponse.json({ query, results });
  } catch (error) {
    console.error('Error searching content:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
