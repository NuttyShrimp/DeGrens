import { BaseManager } from './baseManager';

export class GlobalManager extends BaseManager implements IEntryManager {
  private entries: Map<PeekValueType, PeekOption[]> = new Map();

  addEntry(key: PeekValueType, info: Required<EntryAddParameter>): string[] {
    if (!this.entries.has(key)) {
      this.entries.set(key, []);
    }
    return info.options.map(option => {
      option.distance = option.distance ?? info.distance;
      option.id = `global-${++this.currentGenId}`;
      this.entries.get(key)?.push(option);
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
    if (!ctx.globalType) return;
    const entries = this.entries.get(ctx.globalType);
    if (!entries) return;
    entries.forEach(entry => {
      this.addActiveEntry(entry, ctx.entity);
    });
  }
}
