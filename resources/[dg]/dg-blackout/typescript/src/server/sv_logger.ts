import winston from 'winston';
import winstonSentry from 'winston-sentry-log';
import * as Sentry from '@sentry/node';
import { serverConfig } from '../config';
import { name, sentry_dsn, version } from './../../package.json';
import { RewriteFrames } from '@sentry/integrations';
import { getCurrentEnv } from './sv_util';

// Needed to manually apply a color to componenent property of log
const manualColorize = (strToColor: string): string => `[\x1b[35m${strToColor}\x1b[0m]`;

// Format handler passed to winston
const formatLogs = (log: winston.Logform.TransformableInfo): string => {
  if (log.module) return `${log.label} ${manualColorize(log.module)} [${log.level}]: ${log.message}`;

  return `${log.label} [${log.level}]: ${log.message}`;
};

Sentry.init({
  dsn: sentry_dsn,
  integrations: [new RewriteFrames()],
  release: version,
  environment: getCurrentEnv(),
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

export const mainLogger = winston.createLogger({
  level: serverConfig.logger.level as string,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: '[Blackout]' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(formatLogs)
      ),
    }),
  ],
});

if (getCurrentEnv() === 'production') {
  mainLogger.add(
    new winstonSentry({
      name: name,
      level: 'error',
      isClientInitialized: true,
      sentryClient: Sentry,
      config: {
        dsn: sentry_dsn,
        logger: name,
        release: version,
      },
    })
  );
}
