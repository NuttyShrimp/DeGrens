import { create } from '@src/lib/store';

export const useDebugLogStore = create<DebugLogs.State>('debuglogs')(() => ({
  logs: [],
}));
