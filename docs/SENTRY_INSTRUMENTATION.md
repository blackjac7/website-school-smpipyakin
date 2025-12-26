# Sentry Instrumentation (Next.js)

This project uses manual Next.js instrumentation files to initialize Sentry.

Files:

- `instrumentation-server.ts` - server-side instrumentation (registered by Next.js during build/runtime)
- `instrumentation-client.ts` - client-side instrumentation (runs in browser). It also exports `onRouterTransitionStart` used by Next.js to instrument navigations.
- `src/instrumentation-server.ts` and `src/instrumentation-client.ts` re-export the root files so Next.js can discover them reliably.

How to update:

- Edit `instrumentation-client.ts` or `instrumentation-server.ts` to change Sentry configuration (DSN, tracesSampleRate, integrations).
- Add DSN via environment variable `NEXT_PUBLIC_SENTRY_DSN` in your environment/CI Secrets.

Checks:

- A lightweight verification script exists at `scripts/checkInstrumentation.js` which runs during `prebuild` and in CI as `npm run check:instrumentation`. It validates that the instrumentation files and required exports exist.

If you need help migrating Sentry config or adjusting sample rates, open an issue and assign to the team for review.
