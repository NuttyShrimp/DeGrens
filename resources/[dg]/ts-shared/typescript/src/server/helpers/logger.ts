import * as Sentry from '@sentry/node';
import { name, sentry_dsn, version } from '../../../package.json';
import { RewriteFrames } from '@sentry/integrations';
import '@sentry/tracing';

Sentry.init({
  dsn: sentry_dsn,
  integrations: [new RewriteFrames()],
  release: version,
  environment: GetConvar('is_production', 'true') === 'false' ? 'development' : process.env.NODE_ENV ?? 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

Sentry.setTag('resource', GetCurrentResourceName());

export { Sentry };
