// We want to create a manager for each resource, this will remove the
// problem where a resource could have 2 maps because the lib is transpiled + imported via manifest
import { Util } from '@dgx/server';

import { getRegisteredResources } from '../helpers/resourceSet';
import { getPlyServerId, getPlySteamId } from '../sv_util';

/**
 * The structure of the maps are as following:
 * PlayerResourceMap:
 *  Key: steamId
 *  Value: ResourceEventMap:
 *    Key: resourceName
 *    Value: EventIdMap:
 *      Key: UUIDV4
 *      Value: eventName
 */
export class EventIdManager {
  private readonly resource: string;
  private readonly handlers: Set<EventHandler>;
  private eventSet: Set<string>;
  // Map for player to Map of resources to eventNames and there ids
  private playerResourceMap: Map<string, Map<string, Map<string, string>>>;

  constructor(resource: string) {
    this.resource = resource;
    this.handlers = new Set();
    this.eventSet = new Set();
    this.playerResourceMap = new Map();
    for (let i = 0; i < GetNumPlayerIndices(); i++) {
      this.playerResourceMap.set(GetPlayerFromIndex(i), new Map());
    }
  }

  private generateMapForEvents(): [Map<string, string>, Record<string, string>] {
    const eventMap: Map<string, string> = new Map();
    this.eventSet.forEach(evtName => {
      let eventId = Util.uuidv4();
      while (eventMap.has(eventId)) {
        eventId = Util.uuidv4();
      }
      eventMap.set(eventId, evtName);
    });
    // EventMap to object
    const evtObj: Record<string, string> = {};
    eventMap.forEach((evtName, eventId) => {
      evtObj[evtName] = eventId;
    });
    return [eventMap, evtObj];
  }

  // Resource in parameters has started and wants to send events
  // We create a map for each player for this resource
  generateResourceMap(resName: string) {
    this.playerResourceMap.forEach((resourceMap, plySrvId) => {
      const [eventMap, evtObj] = this.generateMapForEvents();
      emitNet('__dg_shared_events', plySrvId, resName, this.resource, evtObj);
      resourceMap.set(resName, eventMap);
    });
  }

  generateMapForPlayer(src: number) {
    const resourceMap: Map<string, Map<string, string>> = new Map();
    getRegisteredResources().forEach(resource => {
      const [eventMap, evtObj] = this.generateMapForEvents();
      emitNet('__dg_shared_events', src, resource, this.resource, evtObj);
      resourceMap.set(resource, eventMap);
    });
    this.playerResourceMap.set(String(src), resourceMap);
  }

  // This will process the event data and return the real event name if it exists
  handleIncomingEvent(src: number, data: EventData) {
    if (data.eventId === 'error') {
      // Client could not find a id AkA ban bozo time
      // TODO: add Ban shit
      console.log(`[Events] ${data.target} could not find a token for an event`);
      return;
    }
    if (!data.token) {
      // TODO: add Ban shit
      console.log(`[Events] [${data.target}] ${data.eventId} had no token attached`);
      return;
    }
    const tokenData: Auth.PlyData = global.exports['dg-auth'].validateToken(src, data?.token);
    if (!tokenData || !tokenData.steamId) {
      // TODO: add Ban shit
      console.log(`[Events] [${data.target}] ${data.eventId} had an invalid token attached`);
      return;
    }
    const resourceMap = this.playerResourceMap.get(String(src));
    if (!resourceMap) {
      // TODO: add Ban shit
      console.log(`[Events] [${data.target}] ${src} is not registered for client events`);
      return;
    }
    const resourceEventMap = resourceMap.get(data.origin);
    if (!resourceEventMap) {
      console.log(`[Events] ${data.origin} is not registered for client events`, data);
      // TODO: add Ban shit
      return;
    }
    const eventName = resourceEventMap.get(data.eventId);
    if (!eventName) {
      console.log(`[Events] ${data.eventId} is not connected to a event`);
      // TODO: add Ban shit
      return;
    }
    if (Util.isDevEnv()) {
      // TODO: Make logging not shit
      console.log(
        `[DGX] [${this.resource}] Event: ${eventName} | ID: ${data.eventId} | From: ${data.origin} | Ply: ${tokenData.source}`
      );
    }
    this.handlers.forEach(handler => handler(eventName, src, data.args));
  }

  registerEvent(evtName: string) {
    // TODO: Update eventId table with new event
    this.eventSet.add(evtName);
  }

  addHook(handler: EventHandler) {
    this.handlers.add(handler);
  }
}
