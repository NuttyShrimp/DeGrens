import { RayCast, UI, Util } from '@dgx/client';

import { DEFAULT_DISTANCE, DISABLED_KEYS, PEEK_TYPES } from '../cl_constant';
import { getActiveZones, getCurrentEntity, updateCurrentEntity } from '../helpers/actives';
import { isEntryDisabled } from '../helpers/entries';

import { ZoneManager } from './entryManagers/zoneManager';
import { entryManager } from './entryManager';

// @ExportManager
class StateManager {
  private static instance: StateManager;

  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private canPeek: boolean;
  private isPeeking: boolean;
  private isUIFocused: boolean;
  private isInDebounce: boolean;
  private checkInterval: NodeJS.Timer | null = null;
  private controlInterval: NodeJS.Timer | null = null;

  constructor() {
    this.canPeek = true;
    this.isPeeking = false;
    this.isUIFocused = false;
    this.isInDebounce = false;
  }

  // @Export('setPeekEnabled')
  setCanPeek(canPeek: boolean) {
    this.canPeek = canPeek;
  }

  // Handler when button is pressed down
  startPeeking() {
    if (!this.canPeek || this.isPeeking || LocalPlayer.state?.peekDisabled) {
      return;
    }

    // We refresh entity open
    // When we look at for example a vehicle, then move around it while aiming on the vehicle, and then start peeking
    // The old coords will get distance checked, which will most of the time not show entrys because distance limit
    const { entity, coords } = RayCast.doRaycast();
    updateCurrentEntity(entity != undefined && coords != undefined ? { entity, coords } : null);

    UI.openApplication('peek', {}, true);
    this.isPeeking = true;
    entryManager.loadActiveEntries(true);
    this.createCheckThread();
    this.createControlThread();
  }

  // Handler when button is released
  stopPeeking(shouldClose = true) {
    if (!this.isPeeking) {
      return;
    }
    if (shouldClose) {
      UI.closeApplication('peek');
    }

    this.isPeeking = false;
    this.isUIFocused = false;
    entryManager.clearActiveEntries();
  }

  focusUI() {
    if (this.isUIFocused || this.isInDebounce) return;
    setTimeout(() => {
      this.isInDebounce = false;
    }, 500);
    const activeEntries = entryManager.getAllActiveEntries();
    if (activeEntries.every(entry => isEntryDisabled(entry))) {
      return;
    }
    this.isUIFocused = true;
    SetCursorLocation(0.5, 0.5);
    UI.SendAppEvent('peek', {
      action: 'showOptions',
    });
    UI.SetUIFocusCustom(true, true);
  }

  createCheckThread() {
    if (this.checkInterval !== null) return;

    this.checkInterval = setInterval(async () => {
      const currentEntity = getCurrentEntity();
      const activeZones = getActiveZones();
      if (!this.isPeeking || this.isUIFocused || (currentEntity === null && activeZones.size === 0)) {
        if (this.checkInterval !== null) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
        return;
      }

      const plyCoords = Util.getPlyCoords();
      let isDirty = false;

      for (const entryType of PEEK_TYPES) {
        const manager = entryManager.getManagerForType(entryType);
        const activeEntries = manager.getActiveEntries();

        // Copy keys to properly be able to modify array while looping over
        const activeEntriesIndices = [...activeEntries.keys()];
        for (const index of activeEntriesIndices) {
          const entry = activeEntries[index];
          if (!entry._metadata) continue;
          const maxDistance = entry.distance ?? DEFAULT_DISTANCE;
          const oldCanInteract = Boolean(entry._metadata.state.canInteract);
          const oldDistance = Boolean(entry._metadata.state.distance);

          // CanInteract Check
          if (entry.canInteract) {
            entry._metadata.state.canInteract = entry.canInteract(currentEntity?.entity, maxDistance, entry);
            if (entry._metadata.state.canInteract instanceof Promise) {
              entry._metadata.state.canInteract = await entry._metadata.state.canInteract;
            }
          }

          // Distance Check
          let targetVector: Vec3 | null = null;
          switch (entryType) {
            case 'bones':
              if (currentEntity !== null) {
                const boneId = GetEntityBoneIndexByName(currentEntity.entity, entry._metadata.boneName);
                if (boneId !== -1) {
                  const bonePos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(currentEntity.entity, boneId));
                  // Check if raycast intersect point is close to bone
                  if (bonePos.distance(currentEntity.coords) <= maxDistance) {
                    targetVector = bonePos;
                  }
                }
              }
              break;
            case 'zones':
              const activeZone = activeZones.get(entry._metadata.name);
              if (activeZone) {
                targetVector = activeZone.center;
              }
              break;
            default:
              targetVector = currentEntity?.coords ?? null;
              break;
          }
          entry._metadata.state.distance =
            targetVector === null ? false : plyCoords.distance(targetVector) <= maxDistance;

          if (oldCanInteract !== entry._metadata.state.canInteract || oldDistance !== entry._metadata.state.distance) {
            isDirty = true;
          }
        }
      }

      if (isDirty) {
        entryManager.refreshNUIList();
      }
    }, 150);
  }

  createControlThread() {
    this.controlInterval = setInterval(() => {
      if (!this.isPeeking) {
        if (this.controlInterval !== null) {
          clearInterval(this.controlInterval);
          this.controlInterval = null;
        }
        return;
      }
      SetPauseMenuActive(false);
      DisablePlayerFiring(PlayerId(), true);
      DISABLED_KEYS.forEach(key => {
        DisableControlAction(0, key, true);
      });
      if (this.isUIFocused) {
        DisableAllControlActions(0);
      }
      // LMB
      if (!this.isUIFocused && (IsControlJustPressed(0, 24) || IsDisabledControlJustPressed(0, 24))) {
        this.focusUI();
      }
    }, 0);
  }

  forceRefreshList() {
    if (!this.isPeeking || this.isUIFocused) {
      return;
    }
    const currentEntity = getCurrentEntity();
    if (currentEntity === null) {
      entryManager.clearActiveEntries(false);
      entryManager.refreshNUIList();
    }
    entryManager.loadActiveEntries(false);
  }

  forceRefreshZones(zoneName: string, data: any) {
    if (!this.isPeeking || this.isUIFocused) {
      return;
    }
    const manager = entryManager.getManagerForType('zones') as ZoneManager;
    if (!manager.isZoneRegistered(zoneName)) {
      return;
    }
    if (data) {
      manager.handleZoneEnter(zoneName, data);
      return;
    }
    manager.handleZoneExit(zoneName);
    entryManager.refreshNUIList();
  }
}

export const stateManager = StateManager.getInstance();
