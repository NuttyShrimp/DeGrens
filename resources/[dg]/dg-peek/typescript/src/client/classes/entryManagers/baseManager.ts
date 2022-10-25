import { canEntryBeEnabled } from '../../helpers/entries';

export class BaseManager {
  protected currentGenId = 0;
  protected activeEntries: PeekOption[] = [];

  protected async addActiveEntry(entry: PeekOption, entity: number): Promise<void> {
    if (this.activeEntries.includes(entry)) return;
    const newEntry = await canEntryBeEnabled(entry, entity);
    if (!newEntry) return;
    this.activeEntries.push(newEntry);
  }

  getActiveEntries() {
    return this.activeEntries;
  }

  clearActiveEntries(): void {
    this.activeEntries = [];
  }
}
