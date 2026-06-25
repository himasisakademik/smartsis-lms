import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/courses(.*)",
  "/lessons(.*)",
  "/admin(.*)",
]);

const isWebhookRoute = createRouteMatcher(["/api/webhooks(.*)"]);
const isPublicRoute = createRouteMatcher(["/verify(.*)", "/studio(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isWebhookRoute(req)) return;
    if (isPublicRoute(req)) return;
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",
  ],
};
