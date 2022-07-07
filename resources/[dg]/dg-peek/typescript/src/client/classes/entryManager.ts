import { UI } from '@dgx/client';

import { ENTRY_TYPES } from '../cl_constant';
import { getCurrentEntity } from '../helpers/actives';
import { getEntityCtx } from '../helpers/context';
import { isEntryDisabled } from '../helpers/entries';

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

  private readonly managers: Map<string, IEntryManager>;

  constructor() {
    this.managers = new Map<PeekEntryType, IEntryManager>([
      ['bones', new BonesManager()],
      ['entity', new EntityManager()],
      ['flags', new FlagManager()],
      ['global', new GlobalManager()],
      ['model', new ModelManager()],
      ['zones', new ZoneManager()],
    ]);
  }

  private getManagersWithoutZone(): IEntryManager[] {
    return Array.from(this.managers.keys())
      .filter(k => k !== 'zones')
      .map(key => this.managers.get(key));
  }

  /**
   * Get all entries active entries from all managers
   */
  getAllActiveEntries() {
    return [...this.managers.values()].reduce<PeekOption[]>((acc, manager) => {
      return [...acc, ...manager.getActiveEntries()];
    }, []);
  }

  getManagerForType(type: PeekEntryType): IEntryManager {
    return this.managers.get(type);
  }

  addEntry(entryType: PeekEntryType, id: PeekValueType | PeekValueType[], peekInfo: EntryAddParameter): string[] {
    if (Array.isArray(id)) {
      return id.reduce((acc, value) => {
        return [...acc, ...this.addEntry(entryType, value, peekInfo)];
      }, []);
    }
    if (!ENTRY_TYPES[entryType].includes(typeof id)) {
      throw new Error(`[PEEK] ${id}(${typeof id}) is not valid as key for ${entryType}`);
    }
    if (!this.managers.has(entryType)) {
      throw new Error(`[PEEK] [Add] ${entryType} is not supported`);
    }
    const ids = this.managers.get(entryType).addEntry(id, peekInfo);
    this.refreshNUIList();
    return ids;
  }

  removeEntry(entryType: PeekEntryType, id: string | string[], blockRefresh = false) {
    if (Array.isArray(id)) {
      id.forEach(value => {
        this.removeEntry(entryType, value, true);
      });
      entryManager.loadActiveEntries();
      return;
    }
    const manager = this.managers.get(entryType);
    if (!manager) {
      throw new Error(`[PEEK] [Remove] ${entryType} is not supported`);
    }
    manager.removeEntry(id);
    if (blockRefresh) return;
    entryManager.loadActiveEntries();
  }

  getEntry(id: string) {
    return [...this.managers.values()].reduce((acc, manager) => {
      return acc || manager.getEntry(id);
    }, undefined) as PeekOption;
  }

  loadActiveEntries(includeZones = true) {
    const { entity, type } = getCurrentEntity();
    if (!entity) return;
    const entityCtx = getEntityCtx(entity, type);
    const managers = includeZones ? this.managers : this.getManagersWithoutZone();
    managers.forEach(manager => {
      manager.loadActiveEntries(entityCtx);
    });
    this.refreshNUIList();
  }

  clearActiveEntries(includeZones = true) {
    const managers = includeZones ? this.managers : this.getManagersWithoutZone();
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
