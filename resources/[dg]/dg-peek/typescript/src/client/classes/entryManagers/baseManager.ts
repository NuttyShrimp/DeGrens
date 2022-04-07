import { canEntryBeEnabled } from '../../helpers/entries';

export class BaseManager {
  protected currentGenId: number = 0;
  protected activeEntries: PeekOption[] = [];

  protected addActiveEntry(entry: PeekOption, entity: number): void {
    if (this.activeEntries.includes(entry)) return;
    entry = canEntryBeEnabled(entry, entity);
    if (!entry) return;
    this.activeEntries.push(entry);
  }

  getActiveEntries() {
    return this.activeEntries;
  }

  clearActiveEntries(): void {
    this.activeEntries = [];
  }
}
