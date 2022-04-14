import { getActiveZones } from '../../helpers/actives';

import { BaseManager } from './baseManager';

export class ZoneManager extends BaseManager implements IEntryManager {
  private entries: Map<string, PeekOption[]> = new Map();

  addEntry(key: PeekValueType, info: EntryAddParameter): string[] {
    if (!this.entries.has(String(key))) {
      this.entries.set(String(key), []);
    }
    return info.options.map(option => {
      option.distance = option.distance ?? info.distance;
      option.id = `zone-${++this.currentGenId}`;
      this.entries.get(String(key)).push(option);
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

  private isZoneEntryActive(zone: string, index: number): boolean {
    return Array.from(this.activeEntries.values()).some(e => e._metadata.name === zone && e._metadata.index === index);
  }

  isZoneRegistered(name: string): boolean {
    return this.entries.has(name);
  }

  loadActiveEntries(ctx: Context) {
    this.activeEntries = [];
    const activeZones = getActiveZones();
    activeZones.forEach((zoneData, zone) => {
      const entries = this.entries.get(zone);
      if (!entries) return;
      entries.forEach((entry, i) => {
        if (this.isZoneEntryActive(zone, i)) return;
        entry._metadata = {
          name: zone,
          index: i,
        };
        entry.data = {
          ...entry.data,
          ...zoneData.data,
        };
        this.addActiveEntry(entry, ctx.entity);
      });
    });
  }

  handleZoneEnter(name: string, data: any) {
    const entries = this.entries.get(name);
    if (!entries) return;
    entries.forEach((entry, i) => {
      if (this.isZoneEntryActive(name, i)) return;
      entry._metadata = {
        name: name,
        index: i,
      };
      entry.data = {
        ...entry.data,
        ...data,
      };
      this.addActiveEntry(entry, null);
    });
  }

  handleZoneExit(name: string) {
    this.activeEntries = this.activeEntries.filter(e => e._metadata.name !== name);
  }
}
