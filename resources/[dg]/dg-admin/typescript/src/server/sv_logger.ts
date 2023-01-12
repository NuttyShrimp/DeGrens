import { Config, Util } from '@dgx/server';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import winston from 'winston';
import winstonSentry from 'winston-sentry-log';

import packageInfo from './../../package.json';

// Needed to manually apply a color to componenent property of log
const manualColorize = (strToColor: string): string => `[\x1b[35m${strToColor}\x1b[0m]`;

// Format handler passed to winston
const formatLogs = (log: winston.Logform.TransformableInfo): string => {
  if (log.module) return `${log.label} ${manualColorize(log.module)} [${log.level}]: ${log.message}`;

  return `${log.label} [${log.level}]: ${log.message}`;
};

Sentry.init({
  dsn: packageInfo.sentry_dsn,
  integrations: [new RewriteFrames()],
  release: packageInfo.version,
  environment: Util.isDevEnv() ? 'development' : 'production',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

export const mainLogger = winston.createLogger({
  level: Config.getConfigValue('main.loglevel'),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: '[ADMIN]' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(formatLogs)
      ),
    }),
  ],
});

if (!Util.isDevEnv()) {
  mainLogger.add(
    new winstonSentry({
      name: packageInfo.name,
      level: 'error',
      isClientInitialized: true,
      sentryClient: Sentry,
      config: {
        dsn: packageInfo.sentry_dsn,
        logger: packageInfo.name,
        release: packageInfo.version,
      },
    })
  );
}
