import { Vector3 } from '../../shared/classes/vector3';

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
  onChange(handler: (entity: number, type: 1 | 2 | 3, coords: Vec3) => void) {
    on('dg-lib:targetinfo:changed', handler);
  }
}

class PolyZone {
  onEnter<T = any>(handler: (name: string, data: T, center: Vec3) => void) {
    on('dg-polyzone:enter', handler);
  }

  onLeave(handler: (name: string) => void) {
    on('dg-polyzone:exit', handler);
  }
}

class PolyTarget {
  onEnter<T = any>(handler: (name: string, data: T, center: Vec3) => void) {
    on('dg-polytarget:enter', handler);
  }

  onLeave(handler: (name: string) => void) {
    on('dg-polytarget:exit', handler);
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
    exports['dg-polytarget'].AddBoxZone(name, pCenter, pWidth, pLength, options);
  }
}

class Keys {
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