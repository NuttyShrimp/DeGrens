import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import toObject from 'dayjs/plugin/toObject';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/nl-be';

import { mainLogger } from '../../../sv_logger';
import debtManager from '../classes/debtmanager';
import { getConfig } from 'helpers/config';

dayjs.extend(toObject);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('nl-be');
dayjs.utc();

const scheduledDebts = new Map<number, NodeJS.Timeout>();

export const debtLogger = mainLogger.child({
  module: 'debts',
  category: 'debts',
});

export const getDaysUntilDue = (debtPrice: number) => {
  const debtTerms = getConfig().debts.debtTerms;
  let currentTime = 3;
  for (const cap in debtTerms) {
    if (debtPrice < Number(cap)) break;
    currentTime = debtTerms[cap];
  }
  return currentTime;
};

export const scheduleOverDueDebt = (debtId: number) => {
  const debt = debtManager.getDebtById(debtId);
  if (!debt) {
    debtLogger.error(`Debt with id ${debtId} not found`);
    return;
  }
  if (debt.type === 'maintenance' || debt.pay_term) return;
  const daysUntilDefault = getDaysUntilDue(debt.debt);
  const dueDate = dayjs.unix(debt.date).add(daysUntilDefault, 'day');
  const secDiff = dueDate.diff(dayjs(), 'millisecond');
  // Debt not overdue skip
  if (secDiff > 0) {
    return;
  }
  if (scheduledDebts.has(debtId)) {
    clearTimeout(scheduledDebts.get(debtId));
    scheduledDebts.delete(debtId);
  }
  let overDueDate: dayjs.Dayjs;
  let foundDate = false;
  for (let i = 0; i < daysUntilDefault * 0.5; i++) {
    // search current overDue date
    overDueDate = dueDate.add(1, 'day');
    if (overDueDate.diff(dayjs(), 'ms') > 0) {
      foundDate = true;
      break;
    }
  }
  // Probably defaulted
  if (!foundDate) {
    scheduleDebtDefaulting(debtId);
    return;
  }
  // Not this server restart
  if (!overDueDate!.isBefore(dayjs().add(12, 'h'))) return;
  // Payout term potentially ends this restart, setup overdue timer
  debtLogger.silly(
    `Schedule overdue debt ${debtId} at ${dueDate.format('DD/MM/YYYY HH:mm')} for ${secDiff} milliseconds`
  );
  const timeout = setTimeout(() => {
    const debt = debtManager.getDebtById(debtId);
    // is already paid
    if (!debt) return;
    debtLogger.debug(`Penalising overdue debt ${debtId}`);
    debtManager.penaliseOverDueDebt(debtId);
    if (scheduledDebts.has(debtId)) {
      scheduledDebts.delete(debtId);
    }
  }, Math.max(0, dayjs().diff(overDueDate!, 'ms')));
  scheduledDebts.set(debtId, timeout);
};

export const scheduleDebtDefaulting = (debtId: number) => {
  const debt = debtManager.getDebtById(debtId);
  if (!debt) {
    debtLogger.error(`Debt with id ${debtId} not found`);
    return;
  }
  if (debt.type === 'maintenance') return;
  const extDate = dayjs.unix(debt.date).add(debt.pay_term ?? getDaysUntilDue(debt.debt) * 1.5, 'day');
  const secDiff = extDate.diff(dayjs(), 'millisecond');
  // Check en schedule overdue debt (last day of term)
  if (secDiff < 0) {
    debtLogger.debug(`Debt ${debtId} is defaulted`);
    debtManager.payDefaultedDebt(debtId);
    return;
  }
  if (scheduledDebts.has(debtId)) {
    clearTimeout(scheduledDebts.get(debtId));
    scheduledDebts.delete(debtId);
  }
  if (!extDate.isBefore(dayjs().add(12, 'h'))) return;
  // Payout term potentially ends this restart, setup overdue timer
  debtLogger.silly(
    `Schedule defaulted debt ${debtId} at ${extDate.format('DD/MM/YYYY HH:mm')} for ${secDiff} milliseconds`
  );
  const timeout = setTimeout(() => {
    const debt = debtManager.getDebtById(debtId);
    // is already paid
    if (!debt) return;
    debtLogger.debug(`Debt ${debtId} is defaulted`);
    debtManager.payDefaultedDebt(debtId);
    if (scheduledDebts.has(debtId)) {
      scheduledDebts.delete(debtId);
    }
  }, Math.max(secDiff, 0));
  scheduledDebts.set(debtId, timeout);
};

export const unscheduleDebt = (debtId: number) => {
  if (scheduledDebts.has(debtId)) {
    scheduledDebts.delete(debtId);
  }
  debtLogger.silly(`Schedule for debt ${debtId} has been removed`);
};
