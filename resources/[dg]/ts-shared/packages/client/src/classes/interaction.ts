import { Vector3 } from '@dgx/shared';

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
    removeOnRestart = true
  ): string[] {
    const ids: string[] = global.exports['dg-peek'].addModelEntry(model, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.model.add(id));
    }
    return ids;
  }

  addEntityEntry(entity: number | number[], PeekParams: PeekParams, removeOnRestart = true): string[] {
    const ids: string[] = global.exports['dg-peek'].addEntityEntry(entity, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.entity.add(id));
    }
    return ids;
  }

  addBoneEntry(bone: string | string[], PeekParams: PeekParams, removeOnRestart = true): string[] {
    const ids: string[] = global.exports['dg-peek'].addBoneEntry(bone, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.bone.add(id));
    }
    return ids;
  }

  addFlagEntry(flag: string | string[], PeekParams: PeekParams, removeOnRestart = true): string[] {
    const ids: string[] = global.exports['dg-peek'].addFlagEntry(flag, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.flag.add(id));
    }
    return ids;
  }

  addZoneEntry(zone: string | string[], PeekParams: PeekParams, removeOnRestart = true): string[] {
    const ids: string[] = global.exports['dg-peek'].addZoneEntry(zone, PeekParams);
    if (removeOnRestart) {
      ids.forEach(id => this.peekIdsToRemove.zone.add(id));
    }
    return ids;
  }

  addGlobalEntry(type: string | string[], PeekParams: PeekParams, removeOnRestart = true): string[] {
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

  setPeekEnabled(enabled: boolean) {
    global.exports['dg-peek'].setPeekEnabled(enabled);
  }
}

class RayCast {
  private handlers: RayCast.Handler[] = [];

  constructor() {
    on('lib:raycast:entityChanged', (entity?: number, coords?: Vec3) => {
      this.handlers.forEach(handler => handler(entity, coords));
    });
  }

  /**
   * Handler gets called when raycast entity changes
   */
  onEntityChange(handler: RayCast.Handler) {
    this.handlers.push(handler);
  }

  /**
   * Do new raycast and return hitdata
   */
  doRaycast(distance?: number, flag?: number, ignore?: number): RayCastHit {
    return global.exports['dg-lib'].doRaycast(distance, flag, ignore);
  }

  /**
   * Get last result from internal loop
   */
  getLastHitResult = (): RayCastHit => {
    return global.exports['dg-lib'].getLastHitResult();
  };
}

class PolyZone {
  private enterHandlers: Map<string, PolyZone.Handler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.Handler[]> = new Map();
  private zonesNamesToDelete: Set<{ name: string; id: string | number }> = new Set();

  constructor() {
    on('dg-polyzone:enter', (name: string, data: any, center: Vec3) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name)!.forEach(handler => handler(name, data, center));
    });
    on('dg-polyzone:exit', (name: string, data: any, center: Vec3) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name)!.forEach(handler => handler(name, data, center));
    });
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.zonesNamesToDelete.forEach(zoneInfo => global.exports['dg-polyzone'].removeZone(zoneInfo.name, zoneInfo.id));
    });
  }

  isPointInside(point: Vec3, zoneName: string): boolean {
    return global.exports['dg-polyzone'].isPointInside(point, zoneName);
  }

  onEnter<T = any>(name: string, handler: PolyZone.Handler<T>) {
    const oldHandlers = this.enterHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave<T = any>(name: string, handler: PolyZone.Handler<T>) {
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
      routingBucket?: number;
    },
    removeOnRestart = true
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
      routingBucket?: number;
    },
    removeOnRestart = true
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
      useZ?: boolean;
      data: { [key: string]: any };
      routingBucket?: number;
    },
    removeOnRestart = true
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

  buildAnyZone = (name: string, zone: Zones.Poly | Zones.Circle | Zones.Box, data: Record<string, any> = {}) => {
    // if vectors is defined, we build polyzone
    if ('vectors' in zone) {
      this.addPolyZone(name, zone.vectors, {
        ...zone.options,
        data,
      });
      return;
    }

    if (!('center' in zone)) throw new Error(`Zone ${name} has no center or vectors property`);

    // if radius is defined, we build circlezone
    if ('radius' in zone) {
      this.addCircleZone(name, zone.center, zone.radius, {
        ...zone.options,
        data,
      });
      return;
    }

    // if no vectors or radius, we build box
    this.addBoxZone(name, zone.center, zone.width, zone.length, {
      ...zone.options,
      data,
    });
  };
}

class PolyTarget {
  private enterHandlers: Map<string, PolyZone.Handler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.Handler[]> = new Map();
  private zonesNamesToDelete: Set<{ name: string; id: string | number }> = new Set();

  constructor() {
    on('dg-polytarget:enter', (name: string, data: any, center: Vec3) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name)!.forEach(handler => handler(name, data, center));
    });
    on('dg-polytarget:exit', (name: string, data: any, center: Vec3) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name)!.forEach(handler => handler(name, data, center));
    });
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.zonesNamesToDelete.forEach(zoneInfo =>
        global.exports['dg-polytarget'].removeZone(zoneInfo.name, zoneInfo.id)
      );
    });
  }

  onEnter<T = any>(name: string, handler: PolyZone.Handler<T>) {
    const oldHandlers = this.enterHandlers.get(name) ?? [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave<T = any>(name: string, handler: PolyZone.Handler<T>) {
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
      routingBucket?: number;
    },
    removeOnRestart = true
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
      useZ?: boolean;
      data: { [key: string]: any };
      routingBucket?: number;
    },
    removeOnRestart = true
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

  buildAnyZone = (name: string, zone: Zones.Poly | Zones.Circle | Zones.Box, data: Record<string, any> = {}) => {
    // if vectors is defined, we build polyzone
    if ('vectors' in zone) throw new Error('Tried to build PolyTarget polyzone');
    if (!('center' in zone)) throw new Error(`Zone ${name} has no center property`);

    // if radius is defined, we build circlezone
    if ('radius' in zone) {
      this.addCircleZone(name, zone.center, zone.radius, {
        ...zone.options,
        data,
      });
      return;
    }

    // if no vectors or radius, we build box
    this.addBoxZone(name, zone.center, zone.width, zone.length, {
      ...zone.options,
      data,
    });
  };
}

class Keys {
  private listeners: Map<string, Map<number, (isDown: boolean) => void>>;
  private disabledListeners: Map<string, Map<number, (isDown: boolean) => void>>;

  private handlerId: number;

  private registedKeys: Set<{ name: string; description: string; defaultKey: string; type?: string }>;

  constructor() {
    this.handlerId = 0;

    this.listeners = new Map();
    this.disabledListeners = new Map();
    this.registedKeys = new Set();

    on('dg-lib:keyEvent', (name: string, isDown: boolean) => {
      if (this.listeners.has(name)) {
        this.listeners.get(name)!.forEach(handler => {
          handler(isDown);
        });
      }
    });
    on('dg-lib:keyEvent:disabled', (name: string, isDown: boolean) => {
      if (this.disabledListeners.has(name)) {
        this.disabledListeners.get(name)!.forEach(handler => {
          handler(isDown);
        });
      }
    });
    on('lib:keys:registerKeyMaps', () => {
      this.registedKeys.forEach(keyInfo => {
        global.exports['dg-lib'].registerKeyMapping(
          keyInfo.name,
          keyInfo.description,
          `+${keyInfo.name}`,
          `-${keyInfo.name}`,
          keyInfo.defaultKey,
          true,
          keyInfo.type
        );
      });
    });
  }

  register(name: string, description: string, defaultKey = '', type?: string) {
    this.registedKeys.add({ name, description, defaultKey, type });
    global.exports['dg-lib'].registerKeyMapping(name, description, `+${name}`, `-${name}`, defaultKey, true, type);
  }

  getBindedKey(keycommand: string, keycontroller = 2) {
    if (!keycommand.startsWith('+')) {
      keycommand = `+${keycommand}`;
    }
    return global.exports['dg-lib'].GetCurrentKeyMap(keycommand, keycontroller);
  }

  isModPressed(): boolean {
    return global.exports['dg-lib'].modifierKeyPressed();
  }

  onPress(keyName: string, handler: (isDown: boolean) => void, allowDisabled = false) {
    if (!this.listeners.has(keyName)) {
      this.listeners.set(keyName, new Map());
    }
    this.listeners.get(keyName)!.set(this.handlerId, handler);

    if (allowDisabled) {
      if (!this.disabledListeners.has(keyName)) {
        this.disabledListeners.set(keyName, new Map());
      }
      this.disabledListeners.get(keyName)!.set(this.handlerId, handler);
    }

    return this.handlerId++;
  }

  onPressUp(keyName: string, handler: () => void, allowDisabled = false) {
    return this.onPress(
      keyName,
      (isDown: boolean) => {
        if (!isDown) {
          handler();
        }
      },
      allowDisabled
    );
  }

  onPressDown(keyName: string, handler: () => void, allowDisabled = false) {
    return this.onPress(
      keyName,
      (isDown: boolean) => {
        if (isDown) {
          handler();
        }
      },
      allowDisabled
    );
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
