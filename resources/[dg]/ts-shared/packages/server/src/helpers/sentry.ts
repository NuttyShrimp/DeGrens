import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import packageInfo from './../../package.json';

const SENTRY_DSN = 'https://47836ea9173b4e52b8820a05996cf549@sentry.nuttyshrimp.me/2';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new RewriteFrames({
      iteratee: frame => {
        frame.in_app = frame.filename?.startsWith('@') || frame.abs_path?.startsWith('@') || frame.in_app;
        // if (frame.filename) {
        //   frame.filename = frame.filename.replace(/^@[^/]+/, ".")
        // }
        frame.abs_path = `app://${frame.filename}`;
        return frame;
      },
    }),
  ],
  release: packageInfo.version,
  attachStacktrace: true,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
