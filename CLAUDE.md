# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bengali Literary Platform — full-stack Next.js 13 (App Router) app for Bengali literature: blog posts, poetry (kobita), and book reviews (boimela). Uses MongoDB Atlas, NextAuth, Cloudinary, Resend, Cloudflare Turnstile, and Upstash Redis.

## Commands

```bash
npm run dev       # Dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm run seed      # Seed sample data + admin user (uses SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
```

No test framework configured.

## Architecture

### Route Groups
- `app/(public)/` — public pages: home, blog, kobita (poetry), boimela (book reviews)
- `app/dashboard/` — admin-only CRUD dashboard (posts, poems, reviews, comments, backup, settings)
- `app/api/` — REST API routes for all entities

### Database
- **MongoDB native driver** (`lib/mongodb.ts`) via `clientPromise` singleton — used in all API routes
- **Mongoose schemas** in `models/` define interfaces + indexes — Mongoose models exist but API routes use native driver with typed interfaces (`IPost`, `IPoem`, etc.)
- Collections: `posts`, `poems`, `reviews`, `comments`, `users`, `backupLogs`
- Atlas Search text indexes on posts/poems/reviews for `/api/search`

### Auth
- NextAuth v4 with JWT strategy (`lib/auth.ts`)
- Providers: Google OAuth + email/password credentials
- Role-based: `admin` role required for `/dashboard` and `/api/admin/*` (enforced in `middleware.ts`)
- Session includes `user.role` and `user.id` via JWT callbacks

### Content Pipeline
- Tiptap rich editor (`components/editor/TiptapEditor.tsx`) for posts
- HTML sanitized server-side via `isomorphic-dompurify` (`lib/sanitize.ts`)
- Reading time auto-calculated from content (`lib/content.ts`)
- Images hosted on Cloudinary (`lib/cloudinary.ts`)

### API Patterns
- All API routes use `clientPromise` → `client.db()` → collection operations
- Rate limiting via Upstash Redis (`lib/ratelimit.ts`)
- Guest comments protected by Cloudflare Turnstile CAPTCHA (`lib/turnstile.ts`)
- Admin write endpoints check `session.user.role === 'admin'`

### Design System
- Custom color palette: `cream-*` (backgrounds), `ink-*` (text), `saffron-*` (accents)
- Three font families: `font-bengali` (Noto Serif Bengali), `font-display` (Playfair Display), `font-sans` (Inter)
- UI primitives from shadcn/ui pattern (Radix + CVA) in `components/ui/`
- Framer Motion page transitions (`components/page-transition.tsx`)

### Bengali Content Categories
Posts use Bengali category names: প্রবন্ধ (essay), গল্প (story), স্মৃতিকথা (memoir), বিজ্ঞান (science), সমাজ (society).

## Environment

Copy `.env.example` to `.env.local`. Required: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Other services (Cloudinary, Resend, Turnstile, Upstash, Atlas backup) degrade gracefully if not configured.
