import { Events, lib, UI, Util } from '@dgx/client';
import { RegisterUICallback } from 'helpers/ui';

let debuggerEnabled = false;

RegisterCommand(
  'eventDebugger:stop',
  () => {
    SendNUIMessage({
      action: 'debugger/close',
    });
  },
  false
);

Events.onNet('auth:eventdebugger:start', (token: string) => {
  console.log(`Debugger token: ${token} - copied to clipboard`);
  UI.addToClipboard(token);
  SendNUIMessage({
    action: 'debugger/open',
    token,
  });
});

RegisterUICallback('debugger/connected', (_, cb) => {
  debuggerEnabled = true;
  SendNUIMessage({
    action: 'debugger/events',
    events: storedLogs,
  });
  cb({ data: null, meta: { ok: true, message: 'done' } });
});

const storedLogs: Auth.EventLog[] = [];
let msgInDebounce: false;
let debounceQueue: Auth.EventLog[] = [];

const logEvent = (entry: Auth.EventLog) => {
  if (Util.isDevEnv()) {
    if (entry.rpc) {
      console.log(
        `[${entry.send.at(0)?.toUpperCase()} - ${entry.recv.at(0)?.toUpperCase()} - ${entry.send
          .at(0)
          ?.toUpperCase()}] ${entry.event} | target = ${entry.target}`
      );
    } else {
      console.log(
        `[${entry.send.at(0)?.toUpperCase()} - ${entry.recv.at(0)?.toUpperCase()}] ${entry.event} | target = ${
          entry.target
        }`
      );
    }
  }
  if (!debuggerEnabled) return;
  debounceQueue.push(entry);
  if (msgInDebounce) return;
  setTimeout(() => {
    SendNUIMessage({
      action: 'debugger/events',
      events: debounceQueue,
    });
    debounceQueue = [];
    msgInDebounce = false;
    storedLogs.unshift(...debounceQueue.reverse());
    if (storedLogs.length == 600) {
      storedLogs.splice(600);
    }
  }, 1000);
};

lib<'dg-auth'>('logEvent', logEvent);
