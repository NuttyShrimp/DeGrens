import { Events, RPC, Storage, Util, RayCast, UI, Notifications } from '@dgx/client';

import { assignBind, getAllBinds } from '../helpers/binds';
import { RegisterUICallback } from '../helpers/ui';
import { selectedEntity, selectedEntityType } from '../modules/selector/service.selector';

RegisterUICallback('logOpenMenu', (_, cb) => {
  Events.emitNet('admin:menu:open');
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('closeMenu', (_, cb) => {
  Events.emitNet('admin:menu:close');
  SetNuiFocus(false, false);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

// region Getters
RegisterUICallback('getBinds', async (_, cb) => {
  const binds = getAllBinds();
  cb({ meta: { ok: true, message: 'done' }, data: binds });
});

RegisterUICallback('getPlayers', async (_, cb) => {
  const players = await RPC.execute('admin:menu:getPlayers');
  cb({ meta: { ok: true, message: 'done' }, data: players ?? [] });
});

RegisterUICallback('getVehicleModels', async (_, cb) => {
  const vehicleModels = await RPC.execute('admin:menu:getVehicleModels');
  cb({ meta: { ok: true, message: 'done' }, data: vehicleModels ?? [] });
});

RegisterUICallback('getRoutingBuckets', async (_, cb) => {
  const instances = await RPC.execute('admin:menu:getRoutingBuckets');
  cb({ meta: { ok: true, message: 'done' }, data: instances ?? [] });
});

RegisterUICallback('getBankAccounts', async (_, cb) => {
  const accounts = await RPC.execute('admin:menu:getBankAccounts');
  cb({ meta: { ok: true, message: 'done' }, data: accounts ?? [] });
});

RegisterUICallback('getWhitelistedJobs', async (_, cb) => {
  const jobs = await RPC.execute('jobs:whitelist:getInfoList');
  cb({ meta: { ok: true, message: 'done' }, data: jobs ?? [] });
});

RegisterUICallback('getItems', async (_, cb) => {
  const items = await RPC.execute('admin:menu:getItems');
  cb({ meta: { ok: true, message: 'done' }, data: items ?? [] });
});

RegisterUICallback('getWeatherTypes', async (_, cb) => {
  const weatherTypes = await RPC.execute('admin:menu:getWeatherTypes');
  cb({ meta: { ok: true, message: 'done' }, data: weatherTypes ?? [] });
});

RegisterUICallback('getAvailableActions', async (_, cb) => {
  let actions = await RPC.execute<UI.Entry[]>('admin:menu:getAvailableActions');
  const favorites = Storage.getValue('admin:favoriteActions');
  if (!actions) return cb({ meta: { ok: false, message: 'no actions' }, data: [] });
  if (!favorites) return cb({ meta: { ok: true, message: 'done' }, data: actions });
  actions = actions.map(a => {
    a.favorite = favorites.includes(a.name);
    return a;
  });
  cb({ meta: { ok: true, message: 'done' }, data: actions });
});

RegisterUICallback('getPenaltyInfo', async (_, cb) => {
  const info = await RPC.execute('admin:penalties:getUIInfo');

  cb({
    meta: info ? { ok: true, message: 'done' } : { ok: false, message: 'Failed to retrieve new penalty info' },
    data: info ?? null,
  });
});

RegisterUICallback('getPlayerData', async (_, cb) => {
  const data = await RPC.execute('admin:menu:getPlayerData');

  cb({
    meta: { ok: true, message: 'done' },
    data,
  });
});

RegisterUICallback('getSelectorActions', async (_, cb) => {
  const actions = await RPC.execute('admin:selector:getActions');
  cb({ data: actions, meta: { ok: true, message: 'done' } });
});
RegisterUICallback('isDevEnv', (_, cb) => {
  cb({ data: Util.isDevEnv(), meta: { ok: true, message: 'done' } });
});
// endregion
// region Setters
RegisterUICallback('setActionFavorite', (data: { name: string; favorite: boolean }, cb) => {
  const favorites = Storage.getValue('admin:favoriteActions') ?? [];
  if (data.favorite) {
    favorites.push(data.name);
  } else {
    favorites.splice(favorites.indexOf(data.name), 1);
  }
  Storage.setValue('admin:favoriteActions', favorites);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('assignBind', (data: { name: string; bind: Binds.bindNames }, cb) => {
  assignBind(data.bind, data.name);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});
// endregion

RegisterUICallback('doAction', async (data: { name: string; inputs: any[] }, cb) => {
  Events.emitNet('admin:menu:action', data);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('doSelectorAction', async (data: { name: string }, cb) => {
  if (!selectedEntity) return;
  Events.emitNet('admin:selector:action', {
    ...data,
    netId: NetworkGetNetworkIdFromEntity(selectedEntity),
    entity: selectedEntity,
    entityType: IsPedAPlayer(selectedEntity) ? 0 : selectedEntityType,
  });
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('toggleAction', async (data: { name: string; toggled: boolean }, cb) => {
  Events.emitNet('admin:menu:toggle', data);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('toggleDevMode', (data: { toggle: boolean }, cb) => {
  Events.emitNet('admin:menu:toggleDevMode', data.toggle);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});

RegisterUICallback('copyCoords', (_, cb) => {
  const coords = Util.getPlyCoords();
  const heading = GetEntityHeading(PlayerPedId());
  Notifications.add('Check clipboard for coordinate');
  cb({ meta: { ok: true, message: 'done' }, data: JSON.stringify({ ...coords.add(0), w: heading }) });
});

RegisterUICallback('openCoordsSelector', async (_, cb) => {
  SendNUIMessage({
    action: 'forceCloseMenu',
  });

  UI.showInteraction('Enter to select');
  let selectedCoords: Vec3 | null = null;

  const tick = setTick(() => {
    const coords = RayCast.getLastHitCoord();
    if (coords) {
      const plyCoords = Util.getPlyCoords();
      DrawLine(plyCoords.x, plyCoords.y, plyCoords.z, coords.x, coords.y, coords.z, 0, 0, 255, 255);
      DrawMarker(
        28,
        coords.x,
        coords.y,
        coords.z,
        0,
        0,
        0,
        0,
        0,
        0,
        0.05,
        0.05,
        0.05,
        0,
        0,
        255,
        255,
        false,
        true,
        2,
        false,
        null,
        null,
        false
      );
      if (IsControlJustPressed(0, 18)) {
        selectedCoords = coords;
      }
    }
  });

  await Util.awaitCondition(() => selectedCoords !== null);
  clearTick(tick);

  UI.hideInteraction();
  Notifications.add('Check clipboard for coordinate');
  cb({ meta: { ok: true, message: 'done' }, data: JSON.stringify(selectedCoords) });
});

RegisterUICallback('penalisePlayer', (data: any, cb) => {
  Events.emitNet('admin:penalties:penalisePlayer', data);
  cb({ meta: { ok: true, message: 'done' }, data: {} });
});
