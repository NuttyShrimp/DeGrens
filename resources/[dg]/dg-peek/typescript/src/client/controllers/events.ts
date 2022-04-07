import { setCtxPlayerData } from '../helpers/context';
import { activateZone, deactivateZone, getCurrentEntity, updateCurrentEntity } from '../helpers/actives';
import { stateManager } from '../classes/stateManager';
import { entryManager } from '../classes/entryManager';

on('onResourceStart', (resName: string) => {
  if (resName !== GetCurrentResourceName()) return;
  if (!DGCore) return;
  setCtxPlayerData(DGCore.Functions.GetPlayerData());
});

RegisterNuiCallbackType('closeTarget');
on('__cfx_nui:closeTarget', (_: null, cb: Function) => {
  stateManager.removeFocus();
  stateManager.stopPeeking();
  cb('ok');
});

RegisterNuiCallbackType('selectTarget');
on('__cfx_nui:selectTarget', (data: { id: string }, cb: Function) => {
  cb('ok');
  let entry = entryManager.getEntry(data.id);
  stateManager.removeFocus();
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

DGX.RayCast.onChange((entity, type, coords) => {
  updateCurrentEntity({ entity, type, coords });
  stateManager.createCheckThread();
  stateManager.forceRefreshList();
});

DGX.PolyTarget.onEnter((name, data, center) => {
  activateZone(name, data, center);
  stateManager.forceRefreshZones(name, data);
  stateManager.createCheckThread();
});

DGX.PolyTarget.onLeave(name => {
  deactivateZone(name);
  stateManager.forceRefreshZones(name, null);
});

DGX.Keys.onPress('playerPeek', isDown => {
  isDown ? stateManager.startPeeking() : stateManager.stopPeeking();
});
