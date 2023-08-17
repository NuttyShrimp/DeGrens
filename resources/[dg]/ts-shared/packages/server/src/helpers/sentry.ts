import * as Sentry from '@sentry/node';

import '@sentry/tracing';

Sentry.setTag('resource', GetCurrentResourceName());

export { Sentry };
