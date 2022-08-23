import { Config } from '@dgx/server';
import { Util } from '@dgx/server';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import winston from 'winston';
import winstonSentry from 'winston-sentry-log';

import { name, sentry_dsn, version } from './../../package.json';
import { config } from './config';

const getCurrentEnv = () => (Util.isDevEnv() ? 'development' : process.env.NODE_ENV ?? 'development');

// Needed to manually apply a color to componenent property of log
const manualColorize = (strToColor: string): string => `[\x1b[35m${strToColor}\x1b[0m]`;

// Format handler passed to winston
const formatLogs = (log: winston.Logform.TransformableInfo): string => {
  if (config.logger.disabled.includes(log.category)) return '';
  if (log.module) {
    return `${log.label} ${manualColorize(log.module)} [${log.level}]: ${log.message}`;
  }

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
  level: Config.getConfigValue('main.loglevel'),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: '[Financials]' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(formatLogs)
      ),
      log(info: any, next: () => void): any {
        const combinedLog = winston.format.combine(
          winston.format.label({ label: '[Financials]' }),
          winston.format.colorize({ all: true }),
          winston.format.printf(formatLogs)
        );
        const log = combinedLog.transform(info);
        if (!log) {
          next();
          return;
        }
        const returnStr = formatLogs(log as winston.Logform.TransformableInfo);
        if (returnStr.trim() !== '') {
          console.log(returnStr);
        }
        next();
      },
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
