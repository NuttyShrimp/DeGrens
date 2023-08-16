import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import winston from 'winston';

import mainJSON from '../../resources/[dg]/dg-config/configs/main.json';

import SentryTransport from './sentry-transport';

const SENTRY_DSN = 'https://47836ea9173b4e52b8820a05996cf549@sentry.nuttyshrimp.me/2';

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
  if (mainJSON.production) {
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
      beforeSend: e => {
        if (e.debug_meta?.images) {
          for (const img of e.debug_meta.images) {
            img.code_file = `app://${img.code_file}`;
          }
        }
        return e;
      },
      release: packageInfo.version,
      attachStacktrace: true,
      environment: mainJSON.production ? 'production' : 'development',
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }
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
      new SentryTransport({
        level: 'error',
        skipSentryInit: true,
        sentry: {
          dsn: packageInfo.sentry_dsn,
          release: packageInfo.version,
        },
      })
    );
  }
  return logger;
};
