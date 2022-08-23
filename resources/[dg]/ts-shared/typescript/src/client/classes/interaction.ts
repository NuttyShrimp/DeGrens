import { Vector3 } from '../../shared/classes/vector3';

import { Util } from './index';

class Peek {
  private peekIdsToRemove: Record<Peek.Type, Set<string>> = {
    model: new Set(),
    entity: new Set(),
    bone: new Set(),
    flag: new Set(),
    zone: new Set(),
    global: new Set(),
  };

  constructor() {
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.removeModelEntry([...this.peekIdsToRemove.model]);
      this.removeEntityEntry([...this.peekIdsToRemove.entity]);
      this.removeBoneEntry([...this.peekIdsToRemove.bone]);
      this.removeFlagEntry([...this.peekIdsToRemove.flag]);
      this.removeZoneEntry([...this.peekIdsToRemove.zone]);
      this.removeGlobalEntry([...this.peekIdsToRemove.global]);
    });
  }

  // Adders
  addModelEntry(
    model: string | number | (string | number)[],
    PeekParams: PeekParams,
    removeOnRestart = false
  ): string[] {
    const ids: string[] = global.exports['dg-peek'].addModelEntry(model, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.model.add(id));
    }
    return ids;
  }

  addEntityEntry(entity: number | number[], PeekParams: PeekParams, removeOnRestart = false): string[] {
    const ids: string[] = global.exports['dg-peek'].addEntityEntry(entity, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.entity.add(id));
    }
    return ids;
  }

  addBoneEntry(bone: string | string[], PeekParams: PeekParams, removeOnRestart = false): string[] {
    const ids: string[] = global.exports['dg-peek'].addBoneEntry(bone, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.bone.add(id));
    }
    return ids;
  }

  addFlagEntry(flag: string | string[], PeekParams: PeekParams, removeOnRestart = false): string[] {
    const ids: string[] = global.exports['dg-peek'].addFlagEntry(flag, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.flag.add(id));
    }
    return ids;
  }

  addZoneEntry(zone: string | string[], PeekParams: PeekParams, removeOnRestart = false): string[] {
    const ids: string[] = global.exports['dg-peek'].addZoneEntry(zone, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.zone.add(id));
    }
    return ids;
  }

  addGlobalEntry(type: string | string[], PeekParams: PeekParams, removeOnRestart = false): string[] {
    const ids: string[] = global.exports['dg-peek'].addGlobalEntry(type, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.global.add(id));
    }
    return ids;
  }

  // Removers
  removeModelEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeModelEntry(id));
      return;
    }
    global.exports['dg-peek'].removeModelEntry(ids);
    this.peekIdsToRemove.model.delete(ids);
  }

  removeEntityEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeEntityEntry(id));
      return;
    }
    global.exports['dg-peek'].removeEntityEntry(ids);
    this.peekIdsToRemove.entity.delete(ids);
  }

  removeBoneEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeBoneEntry(id));
      return;
    }
    global.exports['dg-peek'].removeBoneEntry(ids);
    this.peekIdsToRemove.bone.delete(ids);
  }

  removeFlagEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeFlagEntry(id));
      return;
    }
    global.exports['dg-peek'].removeFlagEntry(ids);
    this.peekIdsToRemove.flag.delete(ids);
  }

  removeZoneEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeZoneEntry(id));
      return;
    }
    global.exports['dg-peek'].removeZoneEntry(ids);
    this.peekIdsToRemove.zone.delete(ids);
  }

  removeGlobalEntry(ids: string | string[]) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeGlobalEntry(id));
      return;
    }
    global.exports['dg-peek'].removeGlobalEntry(ids);
    this.peekIdsToRemove.global.delete(ids);
  }
}

class RayCast {
  private handlers: RayCast.Handler[] = [];

  constructor() {
    on('dg-lib:targetinfo:changed', (entity: number, type?: 1 | 2 | 3, coords?: number[]) => {
      this.handlers.forEach(handler => handler(entity, type, coords ? Util.ArrayToVector3(coords) : undefined));
    });
  }

  onChange(handler: RayCast.Handler) {
    this.handlers.push(handler);
  }

  getEntityPlayerLookingAt(
    distance: number,
    radius: number,
    flag: number,
    ignore: number
  ): [number, 0 | 1 | 2 | 3, Vec3 | undefined] {
    const [ent, type, coordsArr] = global.exports['dg-lib'].getEntityPlayerLookingAt(distance, radius, flag, ignore);
    return type === 0 ? [0, 0, undefined] : [ent, type, Util.ArrayToVector3(coordsArr)];
  }
}

class PolyZone {
  private enterHandlers: Map<string, PolyZone.EnterHandler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.ExitHandler[]> = new Map();
  private zonesNamesToDelete: Set<{ name: string; id: string | number }> = new Set();

  constructor() {
    on('dg-polyzone:enter', (name: string, data: any, center: number[]) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name)!.forEach(handler => handler(name, data, Util.ArrayToVector3(center)));
    });
    on('dg-polyzone:exit', (name: string) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name)!.forEach(handler => handler(name));
    });
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.zonesNamesToDelete.forEach(zoneInfo => global.exports['dg-polyzone'].removeZone(zoneInfo.name, zoneInfo.id));
    });
  }

  onEnter<T = any>(name: string, handler: PolyZone.EnterHandler<T>) {
    const oldHandlers = this.enterHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave(name: string, handler: PolyZone.ExitHandler) {
    const oldHandlers = this.exitHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.exitHandlers.set(name, oldHandlers);
  }

  addBoxZone(
    name: string,
    pCenter: Vector3 | Vec3,
    pWidth: number,
    pLength: number,
    options: {
      heading?: number;
      data: { [key: string]: any };
      minZ?: number;
      maxZ?: number;
    },
    removeOnRestart = false
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    if (removeOnRestart) {
      this.zonesNamesToDelete.add({ name, id: options.data.id });
    }
    global.exports['dg-polyzone'].AddBoxZone(name, pCenter, pWidth, pLength, options);
  }

  addPolyZone(
    name: string,
    pVectors: Vec2[],
    options: {
      data: { [key: string]: any };
      minZ?: number;
      maxZ?: number;
    },
    removeOnRestart = false
  ) {
    if (removeOnRestart) {
      this.zonesNamesToDelete.add({ name, id: options.data.id });
    }
    global.exports['dg-polyzone'].AddPolyZone(name, pVectors, options);
  }

  addCircleZone(
    name: string,
    pCenter: Vector3 | Vec3,
    pRadius: number,
    options: {
      useZ?: number;
      data: { [key: string]: any };
    },
    removeOnRestart = false
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    if (removeOnRestart) {
      this.zonesNamesToDelete.add({ name, id: options.data.id });
    }
    global.exports['dg-polyzone'].AddCircleZone(name, pCenter, pRadius, options);
  }

  removeZone(pName: string, pId?: string) {
    global.exports['dg-polyzone'].removeZone(pName, pId);
  }
}

class PolyTarget {
  private enterHandlers: Map<string, PolyZone.EnterHandler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.ExitHandler[]> = new Map();
  private zonesNamesToDelete: Set<{ name: string; id: string | number }> = new Set();

  constructor() {
    on('dg-polytarget:enter', (name: string, data: any, center: number[]) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name)!.forEach(handler => handler(name, data, Util.ArrayToVector3(center)));
    });
    on('dg-polytarget:exit', (name: string) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name)!.forEach(handler => handler(name));
    });
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.zonesNamesToDelete.forEach(zoneInfo =>
        global.exports['dg-polytarget'].removeZone(zoneInfo.name, zoneInfo.id)
      );
    });
  }

  onEnter<T = any>(name: string, handler: PolyZone.EnterHandler<T>) {
    const oldHandlers = this.enterHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave(name: string, handler: PolyZone.ExitHandler) {
    const oldHandlers = this.exitHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.exitHandlers.set(name, oldHandlers);
  }

  addBoxZone(
    name: string,
    pCenter: Vector3 | Vec3,
    pWidth: number,
    pLength: number,
    options: {
      heading?: number;
      data: { [key: string]: any };
      minZ?: number;
      maxZ?: number;
    },
    removeOnRestart = false
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    if (removeOnRestart) {
      this.zonesNamesToDelete.add({ name, id: options.data.id });
    }
    global.exports['dg-polytarget'].AddBoxZone(name, pCenter, pWidth, pLength, options);
  }

  addCircleZone(
    name: string,
    pCenter: Vector3 | Vec3,
    pRadius: number,
    options: {
      useZ?: number;
      data: { [key: string]: any };
    },
    removeOnRestart = false
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    if (removeOnRestart) {
      this.zonesNamesToDelete.add({ name, id: options.data.id });
    }
    global.exports['dg-polytarget'].AddCircleZone(name, pCenter, pRadius, options);
  }

  removeZone(pName: string, pId?: string) {
    global.exports['dg-polytarget'].removeZone(pName, pId);
  }
}

class Keys {
  private listeners: Map<string, Map<number, (isDown: boolean) => void>>;
  private handlerId: number;

  constructor() {
    this.handlerId = 0;
    this.listeners = new Map();
    on('dg-lib:keyEvent', (name: string, isDown: boolean) => {
      if (this.listeners.has(name)) {
        this.listeners.get(name)!.forEach(handler => {
          handler(isDown);
        });
      }
    });
  }

  register(name: string, description: string, defaultKey = '', type?: string) {
    global.exports['dg-lib'].registerKeyMapping(name, description, `+${name}`, `-${name}`, defaultKey, true, type);
  }

  getBindedKey(keycommand: string, keycontroller = 2) {
    return global.exports['dg-lib'].GetCurrentKeyMap(keycommand, keycontroller);
  }

  onPress(keyName: string, handler: (isDown: boolean) => void) {
    if (!this.listeners.has(keyName)) {
      this.listeners.set(keyName, new Map());
    }
    this.listeners.get(keyName)!.set(this.handlerId, handler);
    return this.handlerId++;
  }

  onPressUp(keyName: string, handler: () => void) {
    return this.onPress(keyName, (isDown: boolean) => {
      if (!isDown) {
        handler();
      }
    });
  }

  onPressDown(keyName: string, handler: () => void) {
    return this.onPress(keyName, (isDown: boolean) => {
      if (isDown) {
        handler();
      }
    });
  }

  removeHandler(keyName: string, handlerId: number) {
    if (!this.listeners.has(keyName)) return;
    this.listeners.get(keyName)!.delete(handlerId);
  }
}

export default {
  PolyTarget: new PolyTarget(),
  PolyZone: new PolyZone(),
  RayCast: new RayCast(),
  Peek: new Peek(),
  Keys: new Keys(),
};
