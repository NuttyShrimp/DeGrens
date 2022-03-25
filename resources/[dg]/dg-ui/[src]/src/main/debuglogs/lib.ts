import { store, type } from '../../lib/redux';

export let logId = 1;

const getState = () => store.getState().debuglogs;
const action = (data: Partial<DebugLogs.State>) => {
  if (data.logs) {
    data.logs = data.logs.slice(0, 20);
  }
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      debuglogs: {
        ...state.debuglogs,
        ...data,
      },
    }),
  });
};

export const addLog = (info: Partial<DebugLogs.log>): number => {
  const logs = [...getState().logs];
  const log = {
    ...info,
    id: logId++,
  };
  logs.unshift(log);
  action({ logs });
  return log.id;
};

export const finishLog = (id: number, info: { response: Object; isOk: boolean }) => {
  const logs = [...getState().logs];
  const logIdx = logs.findIndex(l => l.id === id);
  if (logIdx !== -1) {
    const log = logs[logIdx];
    log.response = info.response;
    log.isOk = info.isOk;
    logs[logIdx] = log;
    action({ logs });
  }
};
