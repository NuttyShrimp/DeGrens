import winston from 'winston';
import winstonSentry from 'winston-sentry-log';
import * as Sentry from '@sentry/node';
import { name, sentry_dsn, version } from './../../package.json';
import { RewriteFrames } from '@sentry/integrations';
import { Config, Util } from '@dgx/server';

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
        winston.format.label({ label: '[MISC]' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(formatLogs)
      ),
    }),
  ],
});

if (Util.isDevEnv()) {
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
