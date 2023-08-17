import { generateLogger } from 'logger';
import packageInfo from './../../package.json';
import * as SentryTracing from '@sentry/tracing';

SentryTracing.addExtensionMethods();

export const mainLogger = generateLogger('Carboosting', packageInfo);
