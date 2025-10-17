# ImagePost SaaS - Media Management Platform

A modern media management SaaS platform built with Next.js 15, enabling users to upload, optimize, and transform videos and images for various platforms.

## 🚀 Features

- **Video Upload & Management**: Upload videos up to 5 MB with automatic Cloudinary optimization
- **Social Media Image Creator**: Transform images for Instagram, Twitter, Facebook with live preview
- **Cloud-Powered**: Built on Cloudinary's infrastructure for reliability and speed
- **Real-time Database**: Convex for instant updates and queries
- **Secure Authentication**: Clerk authentication with protected routes
- **Modern UI**: shadcn/ui components with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.14
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: Convex (real-time)
- **Authentication**: Clerk
- **Media Processing**: Cloudinary
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js 20+
- Bun installed ([Install Bun](https://bun.sh/))
- Accounts on:
  - [Clerk](https://clerk.com) - Authentication
  - [Convex](https://convex.dev) - Database
  - [Cloudinary](https://cloudinary.com) - Media processing

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd imagepost-saas
bun install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
CONVEX_DEPLOYMENT=prod:xxxxx

# Cloudinary (client-side)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create application and copy API keys
3. Set paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/home`
   - After sign-up: `/home`
4. Create JWT template named `convex`:
   - Go to JWT Templates → New template
   - Name: `convex`
   - Copy the **Issuer URL** (e.g., `https://your-app.clerk.accounts.dev`)
   - Add to `.env.local` as `CLERK_JWT_ISSUER_DOMAIN`
5. **CRITICAL: Set up webhook** (required for users to be saved):
   - Go to Webhooks → Add Endpoint
   - Production URL: `https://your-domain.com/api/clerk-webhook`
   - Subscribe to events:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Click Create
   - Copy **Signing Secret** (starts with `whsec_`)
   - Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

**For Local Development**: Use [ngrok](https://ngrok.com) to expose localhost:
```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Go back to Clerk Dashboard → Webhooks
# Update endpoint URL to: https://abc123.ngrok.io/api/clerk-webhook
# Keep ngrok running while testing
```

**⚠️ Without webhook setup, users won't be saved to Convex and uploads will fail!**

### 4. Configure Convex

```bash
# Initialize Convex
npx convex dev

# This creates convex.json and gives you NEXT_PUBLIC_CONVEX_URL
```

Go to [Convex Dashboard](https://dashboard.convex.dev) → Settings → Environment Variables and add:
```
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: The `CLERK_JWT_ISSUER_DOMAIN` must be the SAME value as in your `.env.local`

Deploy Convex:
```bash
npx convex deploy
```

### 5. Deploy Convex and Run

```bash
# Deploy Convex functions
npx convex deploy

# Terminal 1: Start Convex (in dev mode)
npx convex dev

# Terminal 2: Start ngrok (for local webhook testing)
ngrok http 3000

# Terminal 3: Start Next.js
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Test the Setup

1. **Sign up with a new account**
2. **Check Convex Dashboard** → Data → `users` table
   - You should see your new user entry
   - If not, check webhook logs in Clerk Dashboard
3. **Upload a video** (< 5 MB)
4. **Check Convex Dashboard** → Data → `videos` table
   - You should see your video entry

**If users are not appearing in Convex:**
- Verify webhook is configured in Clerk Dashboard
- Check webhook logs for errors
- Ensure ngrok is running (for local dev)
- Restart dev server after adding `CLERK_WEBHOOK_SECRET`

## 📁 Project Structure

```
imagepost-saas/
├── app/
│   ├── (app)/              # Protected routes with sidebar
│   │   ├── home/           # Video dashboard
│   │   ├── video-upload/   # Upload videos
│   │   └── social-share/   # Transform images
│   ├── (auth)/             # Authentication pages
│   ├── api/                # API routes
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── VideoCard.tsx       # Video display component
├── convex/
│   ├── schema.ts           # Database schema
│   ├── queries.ts          # Data queries
│   ├── mutations.ts        # Data mutations
│   └── media.ts            # Media upload actions
└── lib/
    └── utils.ts            # Utility functions
```

## 🎯 Usage

### Upload Videos
1. Navigate to `/video-upload`
2. Enter title and description
3. Select video file (max 5 MB)
4. Click "Upload Video"
5. View in dashboard at `/home`

**Note**: Videos are limited to 5 MB due to Convex Node action argument size limit.

### Create Social Media Images
1. Navigate to `/social-share`
2. Upload image (max 5 MB)
3. Select platform format:
   - Instagram Square (1:1)
   - Instagram Portrait (4:5)
   - Twitter Post (16:9)
   - Twitter Header (3:1)
   - Facebook Cover (205:78)
4. Preview transformation
5. Download optimized image

## 🔧 Important Limits

- **Video Upload**: 5 MB maximum (Convex Node action limit)
- **Image Upload**: 5 MB maximum
- **Recommended**: Keep videos under 3 MB for best performance

### Compressing Videos

Use these free tools to compress videos:
- [HandBrake](https://handbrake.fr) (Desktop)
- [Clipchamp](https://clipchamp.com) (Online)
- [VideoSmaller](https://www.videosmaller.com) (Online)

Recommended settings:
- Resolution: 720p (1280x720)
- Codec: H.264
- CRF: 23-28
- Bitrate: 1-2 Mbps

## 🐛 Troubleshooting

### Users Not Saving to Convex
**This is the most common issue!**

Check these in order:
1. **Webhook configured?**
   - Clerk Dashboard → Webhooks → Should have an endpoint
   - Events: `user.created`, `user.updated`, `user.deleted` must be checked
2. **Webhook secret in .env.local?**
   - `CLERK_WEBHOOK_SECRET=whsec_xxxxx` must be set
   - Restart dev server after adding
3. **Using ngrok for local dev?**
   - Must use ngrok URL for webhook endpoint
   - Not `http://localhost:3000` ❌
   - Use `https://abc123.ngrok.io` ✅
4. **Check webhook logs**
   - Clerk Dashboard → Webhooks → Your endpoint → Logs
   - Should show 200 success responses
   - If errors, check the error message
5. **Check terminal logs**
   - Look for `[WEBHOOK] ✅ User xyz successfully upserted in Convex`
   - If you see errors, they'll show here
6. **Fallback: Users auto-created on first upload**
   - If webhook isn't working, users will be created automatically when they upload
   - Not ideal but ensures functionality works

### Upload Fails
- Check Cloudinary credentials are set in Convex Dashboard (not `.env.local`)
- Verify file size is under 5 MB
- Check browser console for specific errors

### Authentication Issues
- Sign out and sign in again
- Verify JWT issuer domain matches between Clerk and Convex
- Clear browser cache and restart dev server

## 📦 Build and Deploy

```bash
# Build for production
bun run build

# Start production server
bun run start

# Lint
bun run lint
```

## 🔑 Environment Variables

### Required in `.env.local`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` ⚠️ Critical for user creation
- `CLERK_JWT_ISSUER_DOMAIN` ⚠️ Critical for authentication
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### Required in Convex Dashboard
- `CLERK_JWT_ISSUER_DOMAIN` ⚠️ Must match `.env.local`
- `CLOUDINARY_CLOUD_NAME` ⚠️ Required for uploads
- `CLOUDINARY_API_KEY` ⚠️ Required for uploads
- `CLOUDINARY_API_SECRET` ⚠️ Required for uploads

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Cloudinary](https://cloudinary.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ using Next.js 15, Convex, and Cloudinary**