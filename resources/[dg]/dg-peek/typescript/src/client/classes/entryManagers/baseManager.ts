import { canEntryBeEnabled } from '../../helpers/entries';

export class BaseManager {
  protected currentGenId = 0;
  protected activeEntries: PeekOption[] = [];

  protected async addActiveEntry(entry: PeekOption, entity: number): Promise<void> {
    if (this.activeEntries.includes(entry)) return;
    entry = await canEntryBeEnabled(entry, entity);
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
