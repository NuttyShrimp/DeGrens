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

export default {
  Peek: new Peek(),
}