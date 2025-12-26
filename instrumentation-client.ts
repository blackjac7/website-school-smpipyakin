import * as Sentry from "@sentry/nextjs";

export function register() {
  // Client instrumentation for Sentry — runs on browser
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      // replayIntegration is available on @sentry/nextjs
      // @ts-ignore
      Sentry.replayIntegration &&
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ].filter(Boolean),
    enabled: process.env.NODE_ENV === "production",
    ignoreErrors: [
      "Failed to fetch",
      "NetworkError",
      "Network request failed",
      "AbortError",
      "chrome-extension://",
      "moz-extension://",
    ],
  });
}
