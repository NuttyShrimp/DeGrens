import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';

import '@sentry/tracing';

import packageInfo from '../../../package.json';

Sentry.init({
  dsn: packageInfo.sentry_dsn,
  integrations: [new RewriteFrames()],
  release: packageInfo.version,
  attachStacktrace: true,
  environment: GetConvar('is_production', 'true') === 'false' ? 'development' : process.env.NODE_ENV ?? 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

Sentry.setTag('resource', GetCurrentResourceName());

export { Sentry };
