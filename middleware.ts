import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UserStatus } from './types/enum';
import { getUserDetails } from './actions/auth';

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
  "/api/webhooks/clerk(.*)",
]);

const isUserOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isOwnerOnboardingRoute = createRouteMatcher(["/owner/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname, origin, searchParams } = req.nextUrl;

  // STEP 1: Check for Clerk verification parameters in the URL
  // These parameters are present when a user clicks a verification link


  // const hasVerificationParams =
  //   searchParams.has('__clerk_status') ||
  //   searchParams.has('__clerk_created_session') ||
  //   searchParams.has('__clerk_ticket');

  // // If verification parameters are present, allow the request to proceed
  // // This lets Clerk handle the verification and establish the session
  // if (hasVerificationParams && userId && user.status!==UserStatus.approved) {
  //   return NextResponse.next();
  // }

  // STEP 2: Allow public API routes to proceed
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // STEP 3: Check authentication status

  // STEP 4: Handle authenticated users
  const { userId } = await auth();
  if (userId) {
    try {
      const user = await getUserDetails(userId!);

      // Get user details
      const isApproved = user.status === UserStatus.approved;
      const isOwner = user.role === 'owner';

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

      // Allow access to all other routes for authenticated users
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      // If there's an error fetching user details, allow the request to continue
      return NextResponse.next();
    }
  }

  // STEP 5: Handle unauthenticated users

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