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
  "/verify-email-pending(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/auth/(.*)",
  "/api/webhooks/(.*)", // Allow all webhooks
  "/api/verify(.*)", // Allow verification endpoints
  // "/api/(.*)", // Allow subscription-related APIs
]);

const isUserOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isOwnerOnboardingRoute = createRouteMatcher(["/owner/onboarding(.*)"]);
const isSettingsRoute = createRouteMatcher(["/settings(.*)"]);
const isAllowedApiRoute = createRouteMatcher([
  "/api/trpc/(.*)", // Add your specific API routes that should be accessible
  "/api/(.*)", // Subscription APIs
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname, origin, searchParams } = req.nextUrl;

  // STEP 1: Allow public and whitelisted API routes to proceed
  if (isPublicApiRoute(req) || isAllowedApiRoute(req)) {
    return NextResponse.next();
  }

  // STEP 2: Check authentication status
  const { userId } = await auth();

  if (userId) {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    try {
      // Set default role if not set
      // if (!user.unsafeMetadata?.role && !user.publicMetadata?.role) {
      //   const role = searchParams.get('role') || 'owner';
      //   await clerk.users.updateUser(userId, {
      //     unsafeMetadata: {
      //       ...user.unsafeMetadata,
      //       role: role,
      //       status: UserStatus.Pending
      //     }
      //   });
      // }

      const isApproved = user.unsafeMetadata?.status === UserStatus.approved ||
        user?.publicMetadata?.status === UserStatus.approved;
      const isOwner = user.unsafeMetadata?.role === 'owner' ||
        user?.publicMetadata?.role === 'owner';
      const isSubscribed = user.unsafeMetadata?.is_subscribed === true ||
        user?.publicMetadata?.is_subscribed === true;

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
      if (isPublicPageRoute(req)) {
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
      if (isApproved && (isUserOnboardingRoute(req) || isOwnerOnboardingRoute(req))) {
        // Approved users shouldn't access onboarding
        return NextResponse.redirect(new URL("/dashboard", origin));
      }

      // Handle unapproved users
      if (!isApproved) {
        const correctOnboardingRoute =
          (isOwner && isOwnerOnboardingRoute(req)) ||
          (!isOwner && isUserOnboardingRoute(req));

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
  if (isPublicPageRoute(req)) {
    return NextResponse.next();
  }

  // Redirect to login for all other routes
  return NextResponse.redirect(new URL("/login", origin));
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};