import * as Sentry from "@sentry/nextjs";

export function register() {
  // Server instrumentation for Sentry (called by Next.js during build/runtime)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    debug: false,
    enabled: process.env.NODE_ENV === "production",
    ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
  });
}
