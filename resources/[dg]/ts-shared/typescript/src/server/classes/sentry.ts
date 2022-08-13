// Classes are for internal usage only
// Will be used to use Sentry from client
import { Span, SpanContext, Transaction, TransactionContext } from '@sentry/types';

import { Util } from '../../shared';
import { Sentry } from '../helpers/sentry';

interface SentryClass {
  startTransaction(ctx: TransactionContext, timeout: number, expectedHits: number): TransactionContext;

  finishTransaction(traceId: string): void;

  addSpan(
    steamId: string,
    traceId: string,
    ctx: Pick<SpanContext, Exclude<keyof SpanContext, 'spanId' | 'sampled' | 'traceId' | 'parentSpanId'>>
  ): void;

  finishSpan(steamId: string, traceId: string): void;
}

class SentryHandler extends Util.Singleton<SentryClass>() implements SentryClass {
  private transactions: Map<string, Transaction> = new Map();
  private transactionAvailableHits: Map<string, number> = new Map();
  private userSpans: Map<string, Map<string, Span>> = new Map();

  constructor() {
    super();
    global.exports('sentryStartTransaction', (ctx: TransactionContext, timeout: number, expectedHits: number) =>
      this.startTransaction(ctx, timeout, expectedHits)
    );
    global.exports('sentryFinishTransaction', (traceId: string) => this.finishTransaction(traceId));
    global.exports(
      'sentryAddSpan',
      (
        steamId: string,
        traceId: string,
        ctx: Pick<SpanContext, Exclude<keyof SpanContext, 'spanId' | 'sampled' | 'traceId' | 'parentSpanId'>>
      ) => this.addSpan(steamId, traceId, ctx)
    );
    global.exports('sentryFinishSpan', (steamId: string, traceId: string) => this.finishSpan(steamId, traceId));
  }

  startTransaction(ctx: TransactionContext, timeout: number, expectedHits: number) {
    const transaction = Sentry.startTransaction(ctx);
    this.transactions.set(transaction.traceId, transaction);
    this.transactionAvailableHits.set(transaction.traceId, expectedHits);
    setTimeout(() => {
      this.transactionAvailableHits.delete(transaction.traceId);
      this.transactions.delete(transaction.traceId);
      transaction.setStatus('deadline_exceeded');
      transaction.finish();
    }, timeout);
    return transaction.toContext();
  }

  finishTransaction(traceId: string) {
    if (!this.transactions.has(traceId)) {
      return;
    }
    this.transactions.get(traceId)!.finish();
  }

  addSpan(
    steamId: string,
    traceId: string,
    ctx: Pick<SpanContext, Exclude<keyof SpanContext, 'spanId' | 'sampled' | 'traceId' | 'parentSpanId'>>
  ) {
    if (!this.transactions.has(traceId)) {
      return;
    }
    const transaction = this.transactions.get(traceId)!;
    const availableHits = this.transactionAvailableHits.get(traceId);
    if (!availableHits) {
      transaction.finish();
      this.transactions.delete(traceId);
      this.transactionAvailableHits.delete(traceId);
      return;
    }
    this.transactionAvailableHits.set(traceId, availableHits - 1);
    const span = transaction.startChild(ctx);
    let userSpans = this.userSpans.get(steamId);
    if (!userSpans) {
      userSpans = new Map();
      this.userSpans.set(steamId, userSpans);
    }
    userSpans.set(traceId, span);
  }

  finishSpan(steamId: string, traceId: string) {
    const userSpans = this.userSpans.get(steamId);
    if (!userSpans) {
      return;
    }
    const span = userSpans.get(traceId);
    if (!span) {
      return;
    }
    userSpans.delete(traceId);
    span.finish();
    // Last span so finish transaction
    const transaction = this.transactions.get(traceId);
    if (transaction) {
      this.transactions.delete(traceId);
      this.transactionAvailableHits.delete(traceId);
      transaction.finish();
    }
  }
}

class SentrySender extends Util.Singleton<SentryClass>() implements SentryClass {
  constructor() {
    super();
  }

  addSpan(
    steamId: string,
    traceId: string,
    ctx: Pick<SpanContext, Exclude<keyof SpanContext, 'spanId' | 'sampled' | 'traceId' | 'parentSpanId'>>
  ): Span {
    return global.exports['ts-shared'].sentryAddSpan(steamId, traceId, ctx);
  }

  startTransaction(ctx: TransactionContext, timeout: number, expectedHits: number): TransactionContext {
    return global.exports['ts-shared'].sentryStartTransaction(ctx, timeout, expectedHits);
  }

  finishTransaction(traceId: string): void {
    global.exports['ts-shared'].sentryFinishTransaction(traceId);
  }

  finishSpan(steamId: string, traceId: string): void {
    global.exports['ts-shared'].sentryFinishSpan(steamId, traceId);
  }
}

export let sentryHandler: SentryClass = SentrySender.getInstance();

if (GetCurrentResourceName() === 'ts-shared') {
  sentryHandler = new SentryHandler();
}
