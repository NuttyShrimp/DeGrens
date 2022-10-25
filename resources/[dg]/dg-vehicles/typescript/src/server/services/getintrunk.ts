import { Chat, Events, Notifications, RayCast, RPC, Taskbar, Util } from '@dgx/server';

// players in trunks -- key: vehNetId, value: ply set
const trunks: Map<number, Set<number>> = new Map();

Events.onNet('vehicles:trunk:enter', (plyId: number, netId: number) => {
  const players = trunks.get(netId) ?? new Set();
  players.add(plyId);
  trunks.set(netId, players);
});

Events.onNet('vehicles:trunk:leave', (plyId: number) => {
  for (const [netId, players] of Array.from(trunks.entries())) {
    if (!players.has(plyId)) continue;

    players.delete(plyId);
    if (players.size === 0) {
      trunks.delete(netId);
    } else {
      trunks.set(netId, players);
    }
    break;
  }
});

Chat.registerCommand('putintrunk', 'Put closest person in trunk', [], 'user', async src => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(src)), false)) {
    Notifications.add(src, 'Je kan dit niet van uit een voertuig', 'error');
    return;
  }
  const [veh, entType] = await RayCast.getEntityPlayerLookingAt(src);
  if (!veh || entType !== 2) {
    Notifications.add(src, 'Er is geen voertuig in de buurt', 'error');
    return;
  }
  const netId = NetworkGetNetworkIdFromEntity(veh);
  const isCloseToTrunk = await RPC.execute<boolean>('vehicles:trunk:canEnterVehicle', src, netId);
  if (!isCloseToTrunk) {
    Notifications.add(src, 'Je staat niet bij de open kofferbak', 'error');
    return;
  }
  const target = Util.getClosestPlayer(src, 2);
  if (!target) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }
  // TODO: Check if cuffed or dead/laststand

  const [canceled] = await Taskbar.create(src, 'put-in-trunk', 'car', 'In koffer plaatsen', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  Events.emitNet('vehicles:trunk:forceEnter', target, netId);
});

Chat.registerCommand('takeouttrunk', 'Get person from trunk', [], 'user', async src => {
  const [veh, entType] = await RayCast.getEntityPlayerLookingAt(src);
  if (!veh || entType !== 2) {
    Notifications.add(src, 'Er is geen voertuig in de buurt', 'error');
    return;
  }
  const netId = NetworkGetNetworkIdFromEntity(veh);
  const isCloseToTrunk = await RPC.execute<boolean>('vehicles:trunk:canEnterVehicle', src, netId);
  if (!isCloseToTrunk) {
    Notifications.add(src, 'Je staat niet bij de open kofferbak', 'error');
    return;
  }
  const playersInTrunk = [...(trunks.get(netId)?.values() ?? [])];
  const target = playersInTrunk[0];
  if (!target) {
    Notifications.add(src, 'Er zit niemand in deze koffer', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'take-out-trunk', 'car', 'Uit koffer halen', 3000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  Events.emitNet('vehicles:trunk:forceLeave', target, netId);
});
