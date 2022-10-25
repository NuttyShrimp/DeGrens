import { Keys, UI, Util, RayCast, Jobs } from '@dgx/client';

import { entryManager } from '../classes/entryManager';
import { stateManager } from '../classes/stateManager';
import { activateZone, deactivateZone, getCurrentEntity, updateCurrentEntity } from '../helpers/actives';
import { setCtxJob, setCtxPlayerData } from '../helpers/context';

on('onResourceStart', (resName: string) => {
  if (resName !== GetCurrentResourceName()) return;
  if (!DGCore) return;
  setCtxPlayerData(DGCore.Functions.GetPlayerData());
  const job = Jobs.getCurrentJob();
  setCtxJob({ name: job.name, grade: job.rank });
});

UI.RegisterUICallback('peek:preventShow', (_, cb) => {
  stateManager.stopPeeking(false);
  cb({ meta: { message: 'done', ok: true }, data: {} });
});

UI.RegisterUICallback('peek:select', (data: { id: string }, cb) => {
  cb({ meta: { message: 'done', ok: true }, data: {} });
  let entry = entryManager.getEntry(data.id);
  stateManager.stopPeeking();
  if (!entry) {
    throw new Error(`[PEEK] Invalid entry | id: ${data.id}`);
  }
  const { entity } = getCurrentEntity();
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

onNet('DGCore:Player:SetPlayerData', (data: PlayerData) => {
  setCtxPlayerData(data);
});

onNet('dg-jobs:signin:update', (name: string | null, grade: number | null) => {
  setCtxJob({ name, grade });
});

RayCast.onChange((entity, type, coords) => {
  updateCurrentEntity({ entity, type, coords });
  stateManager.createCheckThread();
  stateManager.forceRefreshList();
});

on('dg-polytarget:enter', (name: string, data: any, center: number[]) => {
  activateZone(name, data, Util.ArrayToVector3(center));
  stateManager.forceRefreshZones(name, data);
  stateManager.createCheckThread();
});

on('dg-polytarget:exit', (name: string) => {
  deactivateZone(name);
  stateManager.forceRefreshZones(name, null);
});

Keys.onPress('playerPeek', isDown => {
  if (!LocalPlayer.state?.loggedIn) return;
  isDown ? stateManager.startPeeking() : stateManager.stopPeeking();
});
