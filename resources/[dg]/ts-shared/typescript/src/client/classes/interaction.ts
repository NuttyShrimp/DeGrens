import { Vector3 } from '../../shared/classes/vector3';

import { Util } from './index';

class Peek {
  // Adders
  addModelEntry(model: string | number | (string | number)[], PeekParams: PeekParams): number[] {
    return global.exports['dg-peek'].addModelEntry(model, PeekParams);
  }

  addEntityEntry(model: number | number[], PeekParams: PeekParams): number[] {
    return global.exports['dg-peek'].addEntityEntry(model, PeekParams);
  }

  addBoneEntry(model: string | string[], PeekParams: PeekParams): number[] {
    return global.exports['dg-peek'].addBoneEntry(model, PeekParams);
  }

  addFlagEntry(model: string | string[], PeekParams: PeekParams): number[] {
    return global.exports['dg-peek'].addFlagEntry(model, PeekParams);
  }

  addZoneEntry(model: string | string[], PeekParams: PeekParams): number[] {
    return global.exports['dg-peek'].addZoneEntry(model, PeekParams);
  }

  // Removers
  removeModelEntry(ids: number | number[]) {
    return global.exports['dg-peek'].removeModelEntry(ids);
  }

  removeEntityEntry(ids: number | number[]) {
    return global.exports['dg-peek'].removeEntityEntry(ids);
  }

  removeBoneEntry(ids: number | number[]) {
    return global.exports['dg-peek'].removeBoneEntry(ids);
  }

  removeFlagEntry(ids: number | number[]) {
    return global.exports['dg-peek'].removeFlagEntry(ids);
  }

  removeZoneEntry(ids: number | number[]) {
    return global.exports['dg-peek'].removeZoneEntry(ids);
  }
}

class RayCast {
  private handlers: RayCast.Handler[] = [];

  constructor() {
    on('dg-lib:targetinfo:changed', (entity: number, type: 1 | 2 | 3, coords: number[]) => {
      this.handlers.forEach(handler => handler(entity, type, coords ? Util.ArrayToVector3(coords) : null));
    });
  }

  onChange(handler: RayCast.Handler) {
    this.handlers.push(handler);
  }
}

class PolyZone {
  private enterHandlers: Map<string, PolyZone.EnterHandler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.ExitHandler[]> = new Map();
  private zonesNamesToDelete: Set<string> = new Set();

  constructor() {
    on('dg-polyzone:enter', (name: string, data: any, center: number[]) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name).forEach(handler => handler(name, data, center ? Util.ArrayToVector3(center) : null));
    });
    on('dg-polyzone:exit', (name: string) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name).forEach(handler => handler(name));
    });
    on('onResourceStop', (res: string) => {
      if (res !== GetCurrentResourceName()) return;
      this.zonesNamesToDelete.forEach(name => global.exports['dg-polyzone'].removeZone(name));
    });
  }

  onEnter<T = any>(name: string, handler: PolyZone.EnterHandler<T>) {
    const oldHandlers = this.enterHandlers.has(name) ? this.enterHandlers.get(name) : [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave(name: string, handler: PolyZone.ExitHandler) {
    const oldHandlers = this.exitHandlers.has(name) ? this.exitHandlers.get(name) : [];
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
      data: Object;
      minZ?: number;
      maxZ?: number;
    },
    removeOnRestart = false
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    if (removeOnRestart) {
      this.zonesNamesToDelete.add(name);
    }
    global.exports['dg-polyzone'].AddBoxZone(name, pCenter, pWidth, pLength, options);
  }

  addPolyZone(
    name: string,
    pVectors: Vec2[],
    options: {
      data: Object;
      minZ?: number;
      maxZ?: number;
    },
    removeOnRestart = false
  ) {
    if (removeOnRestart) {
      this.zonesNamesToDelete.add(name);
    }
    global.exports['dg-polyzone'].AddPolyZone(name, pVectors, options);
  }
}

class PolyTarget {
  private enterHandlers: Map<string, PolyZone.EnterHandler[]> = new Map();
  private exitHandlers: Map<string, PolyZone.ExitHandler[]> = new Map();

  constructor() {
    on('dg-polytarget:enter', (name: string, data: any, center: number[]) => {
      if (!this.enterHandlers.has(name)) return;
      this.enterHandlers.get(name).forEach(handler => handler(name, data, center ? Util.ArrayToVector3(center) : null));
    });
    on('dg-polytarget:exit', (name: string) => {
      if (!this.exitHandlers.has(name)) return;
      this.exitHandlers.get(name).forEach(handler => handler(name));
    });
  }

  onEnter<T = any>(name: string, handler: PolyZone.EnterHandler<T>) {
    const oldHandlers = this.enterHandlers.has(name) ? this.enterHandlers.get(name) : [];
    oldHandlers.push(handler);
    this.enterHandlers.set(name, oldHandlers);
  }

  onLeave(name: string, handler: PolyZone.ExitHandler) {
    const oldHandlers = this.exitHandlers.has(name) ? this.exitHandlers.get(name) : [];
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
      data: Object;
      minZ?: number;
      maxZ?: number;
    }
  ) {
    if (pCenter instanceof Vector3) {
      pCenter = pCenter.add(0);
    }
    global.exports['dg-polytarget'].AddBoxZone(name, pCenter, pWidth, pLength, options);
  }
}

class Keys {
  register(name: string, description: string, defaultKey = '') {
    global.exports['dg-lib'].registerKeyMapping(name, description, `+${name}`, `-${name}`, defaultKey, true);
  }

  onPress(keyName: string, handler: (isDown: boolean) => void) {
    on('dg-lib:keyEvent', (name: string, isDown: boolean) => {
      if (name === keyName) {
        handler(isDown);
      }
    });
  }

  onPressUp(keyName: string, handler: () => void) {
    this.onPress(keyName, (isDown: boolean) => {
      if (!isDown) {
        handler();
      }
    });
  }

  onPressDown(keyName: string, handler: () => void) {
    this.onPress(keyName, (isDown: boolean) => {
      if (isDown) {
        handler();
      }
    });
  }
}

export default {
  PolyTarget: new PolyTarget(),
  PolyZone: new PolyZone(),
  RayCast: new RayCast(),
  Peek: new Peek(),
  Keys: new Keys(),
};
