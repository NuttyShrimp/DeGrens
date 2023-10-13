import winston from 'winston';

import mainJSON from '../../resources/[dg]/dg-config/configs/main.json';

import SentryTransport from './sentry-transport';

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
  const originalLogLevel = logLevelOverwrite ?? mainJSON.loglevel;
  const logger = winston.createLogger({
    level: originalLogLevel,
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

  // allow changing loglevel at runtime using servercommand
  //@ts-ignore
  RegisterCommand(
    `${GetCurrentResourceName()}:loglevel`,
    (source: number, args: [logLevel: string]) => {
      if (source !== 0) throw new Error('Command can only be used on server');
      const logLevel = args[0] ?? originalLogLevel;
      logger.level = logLevel;
      logger.info(`Log level has been set to: '${logLevel}'`);
    },
    true
  );

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
