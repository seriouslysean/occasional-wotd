import { init } from '@sentry/astro';

init({
  dsn: __SENTRY_DSN__,
  environment: __SENTRY_ENVIRONMENT__,
  release: __RELEASE__,
  // No browser tracing or replays -- this is a static site with zero client-side
  // JS by default so those integrations only add bundle weight for no benefit.
  tracesSampleRate: 0,
  integrations: [],
  initialScope: {
    tags: {
      site: __SITE_ID__,
    },
  },
});
