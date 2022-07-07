import { addCtxFlag } from 'helpers/context';

import { BaseManager } from './baseManager';

export class FlagManager extends BaseManager implements IEntryManager {
  private entries: Map<string, PeekOption[]> = new Map();

  addEntry(key: PeekValueType, info: EntryAddParameter): string[] {
    if (!this.entries.has(String(key))) {
      this.entries.set(String(key), []);
    }
    addCtxFlag(key as string);
    return info.options.map(option => {
      option.distance = option.distance ?? info.distance;
      option.id = `flag-${++this.currentGenId}`;
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

  loadActiveEntries(ctx: Context) {
    this.activeEntries = [];
    ctx.flags.forEach(flag => {
      const entries = this.entries.get(flag);
      if (!entries) return;
      entries.forEach(entry => {
        this.addActiveEntry(entry, ctx.entity);
      });
    });
  }
}
