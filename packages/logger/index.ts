import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import winston from 'winston';
import winstonSentry from 'winston-sentry-log';

import mainJSON from '../../resources/[dg]/dg-config/configs/main.json';

const SENTRY_DSN = 'https://ca666003b9db4baeb7bf5b1aab7bc6d1@sentry.nuttyshrimp.me/9';

// Needed to manually apply a color to componenent property of log
const manualColorize = (strToColor: string): string => `[\x1b[35m${strToColor}\x1b[0m]`;

// Format handler passed to winston
const formatLogs = (log: winston.Logform.TransformableInfo): string => {
  let postfix = '';
  if (log.metadata && Object.keys(log.metadata).length > 0) {
    postfix = `. ${JSON.stringify(log.metadata)}`;
  }
  if (log.module) return `${log.label} ${manualColorize(log.module)} [${log.level}]: ${log.message}${postfix}`;

  return `${log.label} [${log.level}]: ${log.message}${postfix}`;
};

export const generateLogger = (name: string, packageInfo: Record<string, any>, logLevelOverwrite?: string) => {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new RewriteFrames()],
    release: packageInfo.version,
    environment: mainJSON.production ? 'production' : 'development',
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  const logger = winston.createLogger({
    level: logLevelOverwrite ?? mainJSON.loglevel,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.label({ label: `[${name}]` }),
          winston.format.colorize({ all: true }),
          winston.format.metadata({ fillExcept: ['label', 'message', 'level', 'module'] }),
          winston.format.printf(formatLogs)
        ),
      }),
    ],
  });
  if (mainJSON.production) {
    logger.add(
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
  return logger;
};