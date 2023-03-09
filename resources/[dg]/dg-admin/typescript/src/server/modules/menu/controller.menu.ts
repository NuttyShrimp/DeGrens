import { Events, Financials, Inventory, RPC, SQL, Util, Weather } from '@dgx/server';
import { getUICommands } from 'modules/commands/service.commands';
import { getPointsForSteamId } from 'modules/penaltyPoints/service.penaltyPoints';

import { getUserData } from '../../helpers/identifiers';
import { ACBan } from '../penalties/service.penalties';
import { hasPlayerPermission } from '../permissions/service.permissions';

import { checkBinds, getDevModeSet, isInDevMode, setDevMode } from './service.menu';

global.exports('isInDevMode', isInDevMode);
global.exports('plyInDevMode', getDevModeSet);

Events.onNet('admin:menu:open', src => {
  if (!hasPlayerPermission(src, 'support')) {
    return;
  }
  Events.emitNet('admin:menu:open', src);
});

Events.onNet('admin:menu:openlog', src => {
  if (!hasPlayerPermission(src, 'support')) {
    ACBan(src, 'Event injection: open admin menu');
    return;
  }
  Util.Log('admin:menu:open', {}, `${GetPlayerName(String(src))} has opened the admin menu`, src);
});

Events.onNet('admin:menu:close', src => {
  if (!hasPlayerPermission(src, 'support')) {
    ACBan(src, 'Event injection: close admin menu');
    return;
  }
  Util.Log('admin:menu:close', {}, `${GetPlayerName(String(src))} has closed the admin menu`, src);
});

Events.onNet('admin:menu:toggleDevMode', (src, toggle) => {
  setDevMode(src, toggle);
});

Events.onNet('admin:menu:action', (src, data: { name: string; inputs: any[] }) => {
  const cmd = getUICommands(src).find(c => c.name === data.name);
  if (!cmd) {
    Util.Log(
      'admin:menu:action:error',
      {
        cmdData: data,
      },
      `${GetPlayerName(String(src))} tried to execute an unknown admin command`,
      src
    );
    ACBan(src, 'Event injection: do admin menu action (unknown CMD)');
    return;
  }
  if (!hasPlayerPermission(src, cmd.role)) {
    ACBan(src, 'Event injection: do admin menu action (unauthorized)');
    return;
  }
  Util.Log(
    'admin:menu:action',
    {
      cmdData: data,
    },
    `${GetPlayerName(String(src))} ${cmd.log} (${cmd.name})`,
    src
  );
  cmd.handler(getUserData(src), data.inputs);
});

Events.onNet('admin:menu:toggle', (src, data: { name: string; toggled: boolean }) => {
  const cmd = getUICommands(src).find(c => c.name === data.name);
  if (!cmd) {
    Util.Log(
      'admin:menu:toggle:error',
      {
        cmdData: data,
        type: 'action',
      },
      `${GetPlayerName(String(src))} tried to toggle an unknown admin command`,
      src
    );
    ACBan(src, 'Event injection: toggle admin menu action (unknown CMD)');
    return;
  }
  if (!hasPlayerPermission(src, cmd.role)) {
    ACBan(src, 'Event injection: toggle admin menu action (unauthorized)');
    return;
  }
  Util.Log(
    'admin:menu:action',
    {
      cmdData: data,
      type: 'toggle',
    },
    `${GetPlayerName(String(src))} ${cmd.log} (${cmd.name})`,
    src
  );
  cmd.handler(getUserData(src), !data.toggled);
});

Events.onNet('admin:bind:run', (src, cmdName: string) => {
  const cmd = getUICommands(src).find(c => c.name === cmdName);
  if (!cmd) {
    Util.Log(
      'admin:menu:toggle:error',
      {
        cmdData: {
          name: cmdName,
        },
        type: 'action',
      },
      `${GetPlayerName(String(src))} tried to toggle an unknown admin command`,
      src
    );
    ACBan(src, 'Event injection: do admin menu action via bind (unknown CMD)');
    return;
  }
  if (!hasPlayerPermission(src, cmd.role)) {
    ACBan(src, 'Event injection: do admin menu action via bind (unauthorized)');
    return;
  }
  Util.Log(
    'admin:menu:action',
    {
      cmdData: {
        name: cmdName,
      },
      type: 'toggle',
    },
    `${GetPlayerName(String(src))} ${cmd.log} (${cmd.name})`,
    src
  );
  cmd.handler(getUserData(src));
});

Events.onNet('admin:bind:check', (src, binds: Record<Binds.bindNames, string | null>) => {
  checkBinds(src, binds);
});

RPC.register('admin:menu:getPlayers', async () => {
  return Promise.all(Object.values(DGCore.Functions.GetQBPlayers()).map<Promise<UI.Player>>(async (ply: Player) => ({
    name: ply.PlayerData.name,
    cid: ply.PlayerData.citizenid,
    serverId: ply.PlayerData.source,
    steamId: ply.PlayerData.steamid,
    firstName: ply.PlayerData.charinfo.firstname,
    lastName: ply.PlayerData.charinfo.lastname,
    points: getPointsForSteamId(ply.PlayerData.steamid),
  })));
});

RPC.register('admin:menu:getAvailableActions', (src): UI.Entry[] =>
  getUICommands(src).map(c => ({ ...c.UI, name: c.name }))
);

RPC.register('admin:menu:getRoutingBuckets', () => {
  const buckets = global.exports['dg-lib'].getTrackedInstances() as Record<number, string>;
  return [
    { id: 0, name: 'Default Route' },
    ...Object.keys(buckets).map(k => {
      const id = parseInt(k);
      return { id, name: buckets[id] };
    }),
  ];
});

RPC.register('admin:menu:getBankAccounts', () => {
  const accounts = Financials.getAllAccounts();
  return accounts.map((a: any) => ({
    id: a.account_id,
    name: a.name,
    type: a.type,
    owner: a.members.find((m: any) => m.access_level === 31),
  }));
});

RPC.register('admin:menu:getPlayerData', (src): UI.PlayerData => {
  return {
    bucketId: GetPlayerRoutingBucket(String(src)),
  };
});

RPC.register('admin:menu:getItems', () => {
  const items = Inventory.getAllItemData();
  return Object.values(items).map(item => ({ name: item.name, label: item.label, size: item.size }));
});

RPC.register('admin:menu:getWeatherTypes', (): { name: string }[] => {
  const types: string[] = Weather.getWeatherTypes();
  return types.map(t => ({ name: t }));
});

RPC.register('admin:menu:getVehicleModels', (): UI.VehicleModel[] => {
  // We get more data from export but only need some so we type it like this
  const models = global.exports['dg-vehicles'].getVehicleModels() as UI.VehicleModel[];
  return models.map(t => ({ name: t.name, brand: t.brand, model: t.model, class: t.class }));
});