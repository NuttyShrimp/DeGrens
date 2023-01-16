import { useDebugLogStore } from './stores/useDebugLogStore';

export let logId = 1;

export const addLog = (info: Partial<DebugLogs.log>): number => {
  const logs = [...useDebugLogStore.getState().logs];
  const log = {
    ...info,
    id: logId++,
  };
  logs.unshift(log);
  useDebugLogStore.setState({ logs });
  return log.id;
};

export const finishLog = (id: number, info: { response: Object; isOk: boolean }) => {
  const logs = [...useDebugLogStore.getState().logs];
  const logIdx = logs.findIndex(l => l.id === id);
  if (logIdx !== -1) {
    const log = logs[logIdx];
    log.response = info.response;
    log.isOk = info.isOk;
    logs[logIdx] = log;
    useDebugLogStore.setState({ logs });
  }
};
