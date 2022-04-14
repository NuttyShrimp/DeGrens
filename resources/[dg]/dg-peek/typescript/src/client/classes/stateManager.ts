import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

import { DISABLED_KEYS, PEEK_TYPES } from '../cl_constant';
import { getActiveZones, getCurrentEntity } from '../helpers/actives';
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
  private checkInterval: NodeJS.Timer;
  private controlInterval: NodeJS.Timer;

  constructor() {
    this.canPeek = true;
    this.isPeeking = false;
    this.isUIFocused = false;
  }

  // @Export('setPeekEnabled')
  setCanPeek(canPeek: boolean) {
    this.canPeek = canPeek;
  }

  // Handler when button is pressed down
  startPeeking() {
    if (!this.canPeek || this.isPeeking) {
      return;
    }
    SendNUIMessage({ response: 'openTarget' });
    this.isPeeking = true;
    entryManager.loadActiveEntries();
    this.createCheckThread();
    this.createControlThread();
  }

  // Handler when button is released
  stopPeeking() {
    if (this.isUIFocused) {
      return;
    }
    SendNUIMessage({ response: 'closeTarget' });
    SetNuiFocusKeepInput(false);
    SetNuiFocus(false, false);

    this.isPeeking = false;
    this.isUIFocused = false;
    entryManager.clearActiveEntries();
  }

  focusUI() {
    if (this.isUIFocused) return;
    const activeEntries = entryManager.getAllActiveEntries();
    if (activeEntries.every(entry => isEntryDisabled(entry))) {
      return;
    }
    this.isUIFocused = true;
    SetCursorLocation(0.5, 0.5);
    SetNuiFocus(true, true);
    SetNuiFocusKeepInput(true);
    SendNUIMessage({ response: 'showOptions' });
  }

  removeFocus() {
    this.isUIFocused = false;
  }

  createCheckThread() {
    if (this.checkInterval !== undefined) {
      return;
    }
    const ped = PlayerPedId();
    this.checkInterval = setInterval(async () => {
      const currentEntity = getCurrentEntity();
      const activeZones = getActiveZones();
      if (!this.isPeeking || this.isUIFocused || (currentEntity.entity === null && activeZones.size === 0)) {
        clearInterval(this.checkInterval);
        this.checkInterval = undefined;
        return;
      }
      const plyCoords = Util.ArrayToVector3(GetEntityCoords(ped, true));
      let isDirty = false;
      // Check for bones
      const bonesManager = entryManager.getManagerForType('bones');
      const activeEntries = bonesManager.getActiveEntries();
      for (const index in activeEntries) {
        const entry = activeEntries[index];
        const boneId = GetEntityBoneIndexByName(currentEntity.entity, entry._metadata.boneName);
        const bonePos = GetWorldPositionOfEntityBone(currentEntity.entity, boneId);
        const oldDistance = Boolean(entry._metadata.state.distance);
        const dist = Vector3.subtract(plyCoords, Util.ArrayToVector3(bonePos)).Length;
        entry._metadata.state.distance = boneId == -1 || dist < entry.distance;
        if (oldDistance !== entry._metadata.state.distance) {
          isDirty = true;
        }
        // TODO: Test if this actually needed
        activeEntries[index] = entry;
      }
      // CanInteract check
      for (const type of PEEK_TYPES) {
        const manager = entryManager.getManagerForType(type);
        const activeEntries = manager.getActiveEntries();
        for (const index in activeEntries) {
          const entry = activeEntries[index];
          if (!entry.canInteract) {
            continue;
          }
          const oldCanInteract = Boolean(entry._metadata.state.canInteract);
          entry._metadata.state.canInteract = entry.canInteract(currentEntity.entity, entry.distance, entry);
          if (entry._metadata.state.canInteract instanceof Promise) {
            entry._metadata.state.canInteract = await entry._metadata.state.canInteract;
          }
          if (oldCanInteract !== entry._metadata.state.canInteract) {
            isDirty = true;
          }
        }
      }
      // distance Check
      // TODO: Merge loops
      PEEK_TYPES.filter(t => t !== 'bones').forEach(type => {
        const manager = entryManager.getManagerForType(type);
        const activeEntries = manager.getActiveEntries();
        for (const index in activeEntries) {
          const entry = activeEntries[index];
          if (!entry.distance) {
            continue;
          }
          const oldState = Boolean(entry._metadata.state.distance);
          let targetVector = null;
          if (type === 'zones') {
            if (activeZones.has(entry._metadata.name)) {
              const { x, y, z } = activeZones.get(entry._metadata.name).center;
              targetVector = new Vector3(x, y, z);
            }
          } else {
            const { x, y, z } = currentEntity.coords;
            targetVector = new Vector3(x, y, z);
          }
          entry._metadata.state.distance = targetVector
            ? plyCoords.subtract(targetVector).Length <= entry.distance
            : false;
          if (oldState !== entry._metadata.state.distance) {
            isDirty = true;
          }
        }
      });
      if (isDirty) {
        entryManager.refreshNUIList();
      }
    }, 150);
  }

  createControlThread() {
    this.controlInterval = setInterval(() => {
      if (!this.isPeeking) {
        clearInterval(this.controlInterval);
        this.controlInterval = undefined;
        return;
      }
      SetPauseMenuActive(false);
      DisablePlayerFiring(PlayerId(), true);
      DISABLED_KEYS.forEach(key => {
        DisableControlAction(0, key, true);
      });
      if (this.isUIFocused) {
        DisableControlAction(0, 1, true);
        DisableControlAction(0, 2, true);
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
    if (currentEntity.entity == null) {
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
