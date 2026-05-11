import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is required');
}

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change-me';

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const posts = db.collection('posts');
  const poems = db.collection('poems');
  const reviews = db.collection('reviews');
  const users = db.collection('users');

  const existingAdmin = await users.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await users.insertOne({
      name: 'প্রশাসক',
      email: adminEmail,
      role: 'admin',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Admin user created: ${adminEmail}`);
  }

  if ((await posts.countDocuments()) === 0) {
    await posts.insertOne({
      title: 'বাংলা সাহিত্যের নতুন পাঠ',
      slug: 'bangla-sahityer-notun-path',
      content: `
        <p>বাংলা সাহিত্য আমাদের ইতিহাসের প্রাণ। নতুন প্রজন্মের জন্য এই পাঠ এক নতুন দরজা খুলে দেয়।</p>
        <h2>কেন এই প্ল্যাটফর্ম?</h2>
        <p>লেখালেখি, কবিতা, এবং বই রিভিউ এক জায়গায় এনে দিতে চাই আমরা।</p>
      `,
      excerpt: 'বাংলা সাহিত্য আমাদের ইতিহাসের প্রাণ। নতুন প্রজন্মের জন্য এই পাঠ এক নতুন দরজা খুলে দেয়।',
      coverImage: '',
      category: 'প্রবন্ধ',
      tags: ['বাংলা', 'সাহিত্য', 'প্রবন্ধ'],
      readingTime: 3,
      views: 0,
      status: 'published',
      publishedAt: new Date(),
      author: {
        name: 'প্রশাসক',
        email: adminEmail,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Seeded posts');
  }

  if ((await poems.countDocuments()) === 0) {
    await poems.insertOne({
      title: 'রাতের কবিতা',
      slug: 'rater-kobita',
      content: 'নীরব রাত, নক্ষত্রের গান<br/>জোছনার ছায়া, মনের টান',
      excerpt: 'নীরব রাত, নক্ষত্রের গান',
      coverImage: '',
      audioUrl: '',
      audioDuration: 0,
      mood: ['প্রেম', 'বিষাদ'],
      tags: ['রাত', 'চাঁদ'],
      views: 0,
      status: 'published',
      publishedAt: new Date(),
      author: {
        name: 'প্রশাসক',
        email: adminEmail,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Seeded poems');
  }

  if ((await reviews.countDocuments()) === 0) {
    await reviews.insertOne({
      bookTitle: 'পথের পাঁচালী',
      bookAuthor: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
      isbn: '9788129505660',
      coverImage: '',
      rating: 5,
      review: `
        <p>গ্রামীণ জীবনের সরলতা ও সৌন্দর্যকে অসাধারণভাবে তুলে ধরেছে এই উপন্যাস।</p>
        <p>পথের পাঁচালী আমাদের শেকড়ের কথা মনে করিয়ে দেয়।</p>
      `,
      spoilers: false,
      genre: ['উপন্যাস', 'ইতিহাস'],
      shelf: 'finished',
      status: 'published',
      publishedAt: new Date(),
      author: {
        name: 'প্রশাসক',
        email: adminEmail,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Seeded reviews');
  }

  await client.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
