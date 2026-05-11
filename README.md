# Bengali Literary Platform

A modern full-stack platform for Bengali literature featuring blogs, poetry, and book reviews. Built with Next.js App Router, MongoDB Atlas, and a clean editorial aesthetic.

## Features
- Blog posts with Tiptap editor, reading time, tags, and related posts
- Poetry layout with audio recitation and shareable image cards
- Book review shelf with ratings, genre filters, and spoiler toggles
- Nested comments with guest support and moderation queue
- Admin dashboard for CRUD, analytics, and backups
- SEO with Metadata API, JSON-LD, sitemap, and OpenGraph images

## Tech Stack
- Next.js 13 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui primitives
- MongoDB Atlas + MongoDB driver
- NextAuth (Google OAuth + Credentials)
- Tiptap editor
- Cloudinary, Resend, Cloudflare Turnstile
- Upstash Redis rate limiting

## Getting Started

### 1) Install
```bash
npm install
```

### 2) Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

Key variables:
- `MONGODB_URI`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
- `CLOUDINARY_*`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `ATLAS_PUBLIC_KEY`, `ATLAS_PRIVATE_KEY`, `ATLAS_GROUP_ID`, `ATLAS_CLUSTER_NAME`

### 3) Run locally
```bash
npm run dev
```

## Seed Data
Create sample content and an admin user:
```bash
npm run seed
```

Optional envs for seed:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Atlas Search Indexes
Create Atlas Search indexes for `posts`, `poems`, and `reviews` with fields:
- `title`, `content`, `tags` (posts/poems)
- `bookTitle`, `review` (reviews)

## Backup Flow
Manual trigger from the admin dashboard calls:
```
POST /api/admin/backup/trigger
```
Process:
1. Creates a backup log entry with `pending` status
2. Calls Atlas snapshot API for the configured cluster
3. Polls snapshot status for completion (`GET /backup/snapshots/{snapshotId}`)
4. Updates `backupLogs` with `completed` or `failed`

Fallback (M0 free tier):
```
GET /api/admin/backup/export
```
Downloads a zip file containing JSON exports of all collections.

## Deployment (Vercel)
1. Push repo to GitHub
2. Import project in Vercel
3. Add all `.env.local` keys in Vercel environment settings
4. Deploy

MongoDB Atlas should allow the Vercel IPs or use `0.0.0.0/0` for dev (not recommended for production).

## Scripts
- `npm run dev` - run local dev server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run seed` - seed sample data
