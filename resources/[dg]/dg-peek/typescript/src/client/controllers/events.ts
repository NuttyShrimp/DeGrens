import { Keys, UI, Util, RayCast } from '@dgx/client';

import { entryManager } from '../classes/entryManager';
import { stateManager } from '../classes/stateManager';
import { activateZone, deactivateZone, getCurrentEntity, updateCurrentEntity } from '../helpers/actives';

UI.RegisterUICallback('peek:preventShow', (_, cb) => {
  stateManager.stopPeeking(false);
  cb({ meta: { message: 'done', ok: true }, data: {} });
});

UI.RegisterUICallback('peek:select', (data: { id: string }, cb) => {
  cb({ meta: { message: 'done', ok: true }, data: {} });
  let entry = entryManager.getEntry(data.id);
  stateManager.stopPeeking();

  // Cannot open peek again when just selected an entry for short while
  // This finally fixes the ui focus sometimes not being set
  stateManager.justSelectedEntry = true;
  setTimeout(() => {
    stateManager.justSelectedEntry = false;
  }, 500);

  if (!entry) {
    throw new Error(`[PEEK] Invalid entry | id: ${data.id}`);
  }
  const entity = getCurrentEntity()?.entity;
  if ((entry as FunctionOption)?.action) {
    entry = entry as FunctionOption;
    entry.action(entry, entity);
  }
  if ((entry as EventOption)?.event) {
    entry = entry as EventOption;
    if (entry.type === 'server') {
      emitNet(entry.event, entry, entity);
    } else {
      emit(entry.event, entry, entity);
    }
  }
});

RayCast.onEntityChange((entity, coords) => {
  updateCurrentEntity(entity != undefined && coords != undefined ? { entity, coords } : null);
  stateManager.createCheckThread();
  stateManager.forceRefreshList();
});

on('dg-polytarget:enter', (name: string, data: any, center: Vec3) => {
  activateZone(name, data, center);
  stateManager.forceRefreshZones(name, data);
  stateManager.createCheckThread();
});

on('dg-polytarget:exit', (name: string) => {
  deactivateZone(name);
  stateManager.forceRefreshZones(name, null);
});

Keys.onPress('playerPeek', isDown => {
  if (!LocalPlayer.state?.isLoggedIn) return;
  if (stateManager.justSelectedEntry) return;
  isDown ? stateManager.startPeeking() : stateManager.stopPeeking();
});
