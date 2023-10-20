import { Chat, Events, lib, Util } from '@dgx/server';

import { getPlySteamId } from './steamids';

const activeTokens = new Map<string, string>();

Chat.registerCommand('eventDebugger', 'Get your debug token', [], 'developer', src => {
  const steamId = getPlySteamId(src);
  if (!steamId) {
    throw new Error(`Failed to get steamId for ${Util.getName(src)}(${src})`);
  }

  if (activeTokens.has(steamId)) {
    emitNet('__cfx_internal:serverPrint', '~r~Overwriting event debugger key~w~');
  }

  const token = Util.uuidv4();
  activeTokens.set(steamId, token);

  Events.emitNet('auth:eventdebugger:start', src, token);
});

on('playerDropped', () => {
  const src = +source;
  const steamId = getPlySteamId(src);
  if (!steamId) return;
  activeTokens.delete(steamId);
});

const storedLogs: Auth.EventLog[] = [];
const subscribers: Map<number, EventSubscriber> = new Map();
let subscriberId = 1;
let subsInDebounce = false;
let debounceQueue: Auth.EventLog[] = [];

const logEvent = (entry: Auth.EventLog) => {
  try {
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
    if (activeTokens.size < 1 || entry.send === 'server') return true;
    if (entry.data !== 'object') {
      entry.data = JSON.stringify({ payload: entry.data });
    } else {
      entry.data = JSON.stringify(entry.data);
    }
    if (entry.data !== 'object') {
      entry.response = JSON.stringify({ payload: entry.response });
    } else {
      entry.response = JSON.stringify(entry.response);
    }
    if (!subsInDebounce) {
      subsInDebounce = true;
      setTimeout(() => {
        for (const sub of subscribers.values()) {
          sub(debounceQueue);
        }
        debounceQueue = [];
        subsInDebounce = false;

        storedLogs.unshift(...debounceQueue.reverse());
        if (storedLogs.length == 600) {
          storedLogs.splice(600);
        }
      }, 1000);
    }
    debounceQueue.push(entry);
  } catch (e) {
    console.log(e);
  }
};

const validateToken = (token: string) => {
  console.log(activeTokens);
  for (const aToken of activeTokens.values()) {
    if (aToken === token) return true;
  }
  return false;
};

// Subscribe and return id for cb so we can unsubscribe when socket closes
const subscribeToStore = (cb: EventSubscriber) => {
  const id = subscriberId++;
  subscribers.set(id, cb);
  cb(storedLogs);
  return id;
};

const removeSubscriber = (id: number) => {
  subscribers.delete(id);
};

lib<'dg-auth'>('logEvent', logEvent);
lib<'dg-auth'>('isEventDebugTokenValid', validateToken);
lib<'dg-auth'>('subscribeToEvents', subscribeToStore);
lib<'dg-auth'>('removeSubscriber', removeSubscriber);
