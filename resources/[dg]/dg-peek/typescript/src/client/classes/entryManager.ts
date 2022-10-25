import { DEFAULT_DISTANCE, ENTRY_TYPES, PEEK_TYPES } from '../cl_constant';
import { getCurrentEntity } from '../helpers/actives';
import { getEntityCtx } from '../helpers/context';
import { isEntryDisabled } from '../helpers/entries';
import { UI } from '@dgx/client';

import { BonesManager } from './entryManagers/bonesManager';
import { EntityManager } from './entryManagers/entityManager';
import { FlagManager } from './entryManagers/flagManager';
import { GlobalManager } from './entryManagers/globalManager';
import { ModelManager } from './entryManagers/modelManager';
import { ZoneManager } from './entryManagers/zoneManager';

class EntryManager {
  private static instance: EntryManager;

  public static getInstance(): EntryManager {
    if (!EntryManager.instance) {
      EntryManager.instance = new EntryManager();
    }
    return EntryManager.instance;
  }

  // Record instead of map to enforce keys being present
  private readonly managers: Record<PeekEntryType, IEntryManager>;

  constructor() {
    this.managers = {
      bones: new BonesManager(),
      entity: new EntityManager(),
      flags: new FlagManager(),
      global: new GlobalManager(),
      model: new ModelManager(),
      zones: new ZoneManager(),
    };
  }

  getManagerForType(type: PeekEntryType): IEntryManager {
    return this.managers[type];
  }

  private getAllManagers(includeZones = true): IEntryManager[] {
    return (Object.keys(this.managers) as PeekEntryType[])
      .filter(type => includeZones || type !== 'zones')
      .map(type => this.getManagerForType(type));
  }

  /**
   * Get all entries active entries from all managers
   */
  getAllActiveEntries() {
    return Object.values(this.managers).reduce<PeekOption[]>((acc, manager) => {
      return [...acc, ...manager.getActiveEntries()];
    }, []);
  }

  addEntry(entryType: PeekEntryType, id: PeekValueType | PeekValueType[], peekInfo: EntryAddParameter): string[] {
    if (!PEEK_TYPES.includes(entryType)) {
      throw new Error(`[PEEK] [Add] ${entryType} is not supported`);
    }
    if (Array.isArray(id)) {
      return id.reduce<string[]>((acc, value) => {
        return [...acc, ...this.addEntry(entryType, value, peekInfo)];
      }, []);
    }
    if (!ENTRY_TYPES[entryType].includes(typeof id)) {
      throw new Error(`[PEEK] ${id}(${typeof id}) is not valid as key for ${entryType}`);
    }
    const ids = this.getManagerForType(entryType).addEntry(id, { distance: DEFAULT_DISTANCE, ...peekInfo });
    this.refreshNUIList();
    return ids;
  }

  removeEntry(entryType: PeekEntryType, id: string | string[], blockRefresh = false) {
    if (!PEEK_TYPES.includes(entryType)) {
      throw new Error(`[PEEK] [Add] ${entryType} is not supported`);
    }
    if (Array.isArray(id)) {
      id.forEach(value => {
        this.removeEntry(entryType, value, true);
      });
      entryManager.loadActiveEntries();
      return;
    }
    this.getManagerForType(entryType).removeEntry(id);
    if (blockRefresh) return;
    entryManager.loadActiveEntries();
  }

  getEntry(id: string) {
    return Object.values(this.managers).reduce<PeekOption | undefined>((acc, manager) => {
      return acc || manager.getEntry(id);
    }, undefined);
  }

  loadActiveEntries(includeZones = true) {
    const { entity, type } = getCurrentEntity();
    if (entity) {
      const entityCtx = getEntityCtx(entity, type);
      const managers = this.getAllManagers(includeZones);
      managers.forEach(manager => {
        manager.loadActiveEntries(entityCtx);
      });
    } else if (includeZones) {
      // Zone manager loadActives function does not take any arguments
      this.getManagerForType('zones').loadActiveEntries();
    }
    if (entity || includeZones) {
      this.refreshNUIList();
    }
  }

  clearActiveEntries(includeZones = true) {
    const managers = this.getAllManagers(includeZones);
    managers.forEach(manager => {
      manager.clearActiveEntries();
    });
  }

  refreshNUIList() {
    const activeEntries = this.getAllActiveEntries();
    if (activeEntries.every(entry => isEntryDisabled(entry))) {
      UI.SendAppEvent('peek', { action: 'leftTarget' });
      return;
    }
    const visibleEntries = activeEntries
      .filter(entry => !isEntryDisabled(entry))
      .map(entry => ({
        id: entry.id,
        label: entry.label,
        icon: entry.icon,
      }));
    UI.SendAppEvent('peek', { action: 'foundTarget', entries: visibleEntries });
  }
}

export const entryManager = EntryManager.getInstance();
