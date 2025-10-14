import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/home',
  '/social-share',
  '/video-upload',
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/videos',
  '/api/clerk-webhook',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !(await auth()).userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  if (!isPublicApiRoute(req) && req.nextUrl.pathname.startsWith('/api/')) {
    if (!(await auth()).userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
