import { BaseManager } from './baseManager';

export class EntityManager extends BaseManager implements IEntryManager {
  private entries: Map<number, PeekOption[]> = new Map();

  addEntry(key: PeekValueType, info: EntryAddParameter): string[] {
    key = Number(key);
    if (!this.entries.has(key)) {
      this.entries.set(key, []);
    }
    return info.options.map(option => {
      option.distance = option.distance ?? info.distance;
      option.id = `entity-${++this.currentGenId}`;
      this.entries.get(key as number)?.push(option);
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
    if (!NetworkGetEntityIsNetworked(ctx.entity)) return;
    if (!ctx.netId) return;
    const entries = this.entries.get(ctx.netId);
    if (!entries) return;
    entries.forEach(entry => this.addActiveEntry(entry, ctx.entity));
  }
}
