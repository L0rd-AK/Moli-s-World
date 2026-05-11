import type { MetadataRoute } from 'next';
import { clientPromise } from '@/lib/mongodb';
import { IPost } from '@/models/Post';
import { IPoem } from '@/models/Poem';
import { IReview } from '@/models/Review';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const client = await clientPromise;
  const db = client.db();

  const [posts, poems, reviews] = await Promise.all([
    db.collection<IPost>('posts').find({ status: 'published' }).toArray(),
    db.collection<IPoem>('poems').find({ status: 'published' }).toArray(),
    db.collection<IReview>('reviews').find({ status: 'published' }).toArray(),
  ]);

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/kobita`, lastModified: new Date() },
    { url: `${baseUrl}/boimela`, lastModified: new Date() },
  ];

  posts.forEach((post) => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || new Date(),
    });
  });

  poems.forEach((poem) => {
    routes.push({
      url: `${baseUrl}/kobita/${poem.slug}`,
      lastModified: poem.updatedAt || poem.publishedAt || new Date(),
    });
  });

  reviews.forEach((review) => {
    routes.push({
      url: `${baseUrl}/boimela/${review._id.toString()}`,
      lastModified: review.updatedAt || review.publishedAt || new Date(),
    });
  });

  return routes;
}
