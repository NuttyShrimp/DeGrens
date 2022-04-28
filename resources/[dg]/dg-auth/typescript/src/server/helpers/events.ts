import { EventIdManager } from '../classes/eventIdManager';
import { mainLogger } from '../sv_logger';

const managers: Map<string, EventIdManager> = new Map();
// Changes on first connection
let serverStarted = false;

export const setServerStarted = () => {
  serverStarted = true;
};

export const isServerStarted = () => serverStarted;

export const handleResourceStart = (resName: string) => {
  managers.forEach(manager => {
    manager.generateResourceMap(resName);
  });
};

export const handleResourceStop = (resName: string) => {
  if (!managers.has(resName)) return;
  managers.delete(resName);
}

export const handlePlayerJoin = (playerId: number, steamId: string) => {
  managers.forEach(manager => {
    manager.generateMapForPlayer(playerId, steamId);
  });
};

export const registerServerEventHandler = (resName: string) => {
  if (managers.has(resName)) return;
  const manager = new EventIdManager(resName);
  managers.set(resName, manager);
};

export const registerEventForManager = (resName: string, eventName: string) => {
  const manager = managers.get(resName);
  if (manager) {
    manager.registerEvent(eventName);
  }
};

export const registerHandlerForManager = (resName:string, handler: EventHandler) => {
  const manager = managers.get(resName);
  if (manager) {
    manager.addHook(handler);
  }
};

export const handleIncomingEvent = (src: number, evtData: EventData) => {
  if (!evtData.target || !managers.has(evtData.target)) {
    mainLogger.warn(`Event ${evtData.eventId} has no target`);
    console.log(evtData);
    // TODO: Ban?
    return;
  }
  const manager = managers.get(evtData.target);
  return manager.handleIncomingEvent(src, evtData);
}