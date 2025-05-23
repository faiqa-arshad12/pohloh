import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UserStatus } from './types/enum';

// Matchers
const isPublicPageRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/signup-link(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/verify-code(.*)",
  "/sso-callback(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/auth/(.*)",
  "/api/webhooks/(.*)",
  "/api/verify(.*)",
]);

const isUserOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isOwnerOnboardingRoute = createRouteMatcher(["/owner/onboarding(.*)"]);
const isSettingsRoute = createRouteMatcher(["/settings(.*)"]);
const isAllowedApiRoute = createRouteMatcher([
  "/api/trpc/(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname, origin, searchParams } = req.nextUrl;

  try {
    // STEP 1: Allow public and whitelisted API routes to proceed
    if (isPublicApiRoute(req) || isAllowedApiRoute(req)) {
      return NextResponse.next();
    }

    // STEP 2: Check authentication status
    const { userId } = await auth();

    if (userId) {
      const clerk = await clerkClient()
      const user = await clerk.users.getUser(userId);

      if (!user) {
        console.error("User not found:", userId);
        return NextResponse.redirect(new URL("/login", origin));
      }

      const isApproved =
        user.unsafeMetadata?.status === UserStatus.approved ||
        user.publicMetadata?.status === UserStatus.approved;

      const isOwner =
        user.unsafeMetadata?.role === 'owner' ||
        user.publicMetadata?.role === 'owner';

      const isSubscribed =
        user.unsafeMetadata?.is_subscribed === true ||
        user.publicMetadata?.is_subscribed === true;

      // Handle verification and signup flow
      if (pathname.includes('/verify') || pathname.includes('/signup-link')) {
        if (isApproved) {
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Redirect logged-in users away from login/signup pages
      if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        if (isApproved) {
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Redirect authenticated users away from public pages
      if (isPublicPageRoute(req)) {
        if (isApproved) {
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Prevent approved users from accessing onboarding routes
      if (isApproved && (isUserOnboardingRoute(req) || isOwnerOnboardingRoute(req))) {
        return NextResponse.redirect(new URL("/dashboard", origin));
      }

      // Redirect unapproved users trying to access non-onboarding routes
      if (!isApproved) {
        const correctOnboardingRoute =
          (isOwner && isOwnerOnboardingRoute(req)) ||
          (!isOwner && isUserOnboardingRoute(req));

        const isApiOrTrpc = pathname.startsWith("/api") || pathname.startsWith("/trpc");

        if (!correctOnboardingRoute && !isApiOrTrpc) {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Allow access to all other routes
      return NextResponse.next();
    }

    // STEP 3: Handle unauthenticated users

    // Allow access to public routes
    if (isPublicPageRoute(req)) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", origin));
  } catch (error) {
    console.error("Middleware error:", error);
    return new NextResponse("Middleware error", { status: 500 });
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
