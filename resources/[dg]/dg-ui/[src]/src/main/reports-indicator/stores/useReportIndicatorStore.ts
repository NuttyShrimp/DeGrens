import { create } from '@src/lib/store';

export const useReportIndicatorStore = create<ReportIndicator.State>('report-indicator')(set => ({
  counter: 0,
  incCounter: () => set(s => ({ counter: s.counter + 1 })),
  resetCounter: () => set(() => ({ counter: 0 })),
}));
