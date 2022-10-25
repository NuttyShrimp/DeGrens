import { BONES } from '../../cl_constant';

import { BaseManager } from './baseManager';

export class BonesManager extends BaseManager implements IEntryManager {
  private entries: Map<string, PeekOption[]> = new Map();

  addEntry(key: PeekValueType, info: Required<EntryAddParameter>): string[] {
    if (!BONES.includes(String(key))) {
      throw new Error(`[PEEK] ${key} is a invalid bone`);
    }
    if (!this.entries.has(String(key))) {
      this.entries.set(String(key), []);
    }
    return info.options.map(option => {
      option.distance = option.distance ?? info.distance;
      option.id = `bone-${++this.currentGenId}`;
      this.entries.get(String(key))?.push(option);
      return option.id;
    });
  }

  getEntry(id: string) {
    return [...this.entries.values()]
      .reduce((acc, cur) => {
        return acc.concat(cur.filter(entry => entry.id === id));
      }, [])
      .find(entry => entry.id === id);
  }

  removeEntry(id: string) {
    this.entries.forEach((entries, key) => {
      this.entries.set(
        key,
        entries.filter(entry => entry.id !== id)
      );
    });
  }

  loadActiveEntries(ctx: Context): void {
    this.activeEntries = [];
    if (!IsEntityAVehicle(ctx.entity) && !IsEntityAPed(ctx.entity)) return;
    this.entries.forEach((entries, bone) => {
      const boneId = GetEntityBoneIndexByName(ctx.entity, bone);
      if (boneId === -1) return;
      entries.forEach(entry => {
        entry._metadata = {
          boneName: bone,
          state: {
            distance: false,
          },
        };
        this.addActiveEntry(entry, ctx.entity);
      });
    });
  }
}
