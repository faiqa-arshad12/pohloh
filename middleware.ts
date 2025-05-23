import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { UserStatus } from './types/enum';

// Matchers
const isPublicPageRoute = (path: string) => {
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/signup-link",
    "/forgot-password",
    "/reset-password",
    "/verify-code",
    "/sso-callback",
  ];
  return publicPaths.some(p => path.startsWith(p));
};

const isPublicApiRoute = (path: string) => {
  const publicApiPaths = [
    "/api/auth/",
    "/api/webhooks/",
    "/api/verify",
  ];
  return publicApiPaths.some(p => path.startsWith(p));
};

const isUserOnboardingRoute = (path: string) => path.startsWith("/onboarding");
const isOwnerOnboardingRoute = (path: string) => path.startsWith("/owner/onboarding");
const isSettingsRoute = (path: string) => path.startsWith("/settings");
const isAllowedApiRoute = (path: string) => {
  const allowedApiPaths = [
    "/api/trpc/",
    "/api/",
  ];
  return allowedApiPaths.some(p => path.startsWith(p));
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname, origin } = req.nextUrl;

  // STEP 1: Allow public and whitelisted API routes to proceed
  if (isPublicApiRoute(pathname) || isAllowedApiRoute(pathname)) {
    return NextResponse.next();
  }

  // STEP 2: Check authentication status
  const { userId, sessionClaims } = await auth();

  if (userId) {
    try {
      const isApproved = sessionClaims?.status === UserStatus.approved;
      const isOwner = sessionClaims?.role === 'owner';
      const isSubscribed = sessionClaims?.is_subscribed === true;

      // Handle verification and signup flow
      if (pathname.includes('/verify') || pathname.includes('/signup-link')) {
        if (isApproved) {
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // If user is logged in and tries to access login/signup pages, redirect to appropriate page
      if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        if (isApproved) {
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // IMPORTANT: If authenticated user is trying to access a public route,
      // redirect them to the appropriate page based on their status
      if (isPublicPageRoute(pathname)) {
        if (isApproved) {
          // Approved users go to dashboard
          return NextResponse.redirect(new URL("/dashboard", origin));
        } else {
          // Unapproved users go to appropriate onboarding
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Handle onboarding routes
      if (isApproved && (isUserOnboardingRoute(pathname) || isOwnerOnboardingRoute(pathname))) {
        // Approved users shouldn't access onboarding
        return NextResponse.redirect(new URL("/dashboard", origin));
      }

      // Handle unapproved users
      if (!isApproved) {
        const correctOnboardingRoute =
          (isOwner && isOwnerOnboardingRoute(pathname)) ||
          (!isOwner && isUserOnboardingRoute(pathname));

        const isApiOrTrpc = pathname.startsWith("/api") || pathname.startsWith("/trpc");

        if (!correctOnboardingRoute && !isApiOrTrpc) {
          // Redirect to appropriate onboarding
          const onboardingPath = isOwner ? "/owner/onboarding" : "/onboarding";
          return NextResponse.redirect(new URL(onboardingPath, origin));
        }
      }

      // Allow access to all other routes for authenticated and subscribed users
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.next();
    }
  }

  // STEP 3: Handle unauthenticated users

  // Allow access to public routes
  if (isPublicPageRoute(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login for all other routes
  return NextResponse.redirect(new URL("/login", origin));
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};