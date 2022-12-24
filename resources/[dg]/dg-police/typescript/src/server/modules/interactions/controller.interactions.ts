import { Chat, Events, Financials, Inventory, Jobs, Notifications, RPC, Util } from '@dgx/server';
import { getPoliceConfig } from 'services/config';
import {
  doCuffAction,
  getEscortedPlayer,
  isPlayerBeingEscorted,
  isPlayerCuffed,
  isPlayerEscorting,
  setPlayerCuffState,
  setPlayerEscorting,
  showCuffLogs,
  stopCarryDuo,
  startCarryDuo,
  isPlayerInCarryDuo,
  stoppedEscorting,
  getPlayerWhoIsEscorting,
} from './service.interactions';

global.exports('isCuffed', isPlayerCuffed);

Events.onNet(
  'police:interactions:takeOutVehicle',
  (src: number, netId: number, amountOfSeats: number, closestSeat: number | undefined) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(vehicle)) return;

    let targetPed: number | null = null;

    // Check if a player in closest seat to origin player
    if (closestSeat !== undefined) {
      const pedInClosestSeat = GetPedInVehicleSeat(vehicle, closestSeat);
      if (pedInClosestSeat !== 0 && IsPedAPlayer(pedInClosestSeat)) {
        targetPed = pedInClosestSeat;
      }
    }

    // If none was found in closest seat then check all seats starting from back
    if (targetPed === null) {
      for (let i = amountOfSeats - 2; i >= -1; i--) {
        const pedInSeat = GetPedInVehicleSeat(vehicle, i);
        if (pedInSeat !== 0 && IsPedAPlayer(pedInSeat)) {
          targetPed = pedInSeat;
          break;
        }
      }
    }

    if (targetPed === null) {
      Notifications.add(src, 'Er zit niemand in het voertuig', 'error');
      return;
    }

    TaskLeaveVehicle(targetPed, vehicle, 16);
  }
);

Events.onNet(
  'police:interactions:putInVehicle',
  (src: number, netId: number, amountOfSeats: number, closestSeat: number | undefined) => {
    const target = Util.getClosestPlayerOutsideVehicle(src);
    if (!target) return;

    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(vehicle)) return;

    let targetSeat: number | null = null;

    // Check if closest seat to origin player is free
    if (closestSeat !== undefined) {
      const pedInClosestSeat = GetPedInVehicleSeat(vehicle, closestSeat);
      if (pedInClosestSeat === 0) {
        targetSeat = closestSeat;
      }
    }

    // If closest wasnt free, check every other seat starting from back
    if (targetSeat === null) {
      for (let i = amountOfSeats - 2; i >= -1; i--) {
        const pedInSeat = GetPedInVehicleSeat(vehicle, i);
        if (pedInSeat === 0) {
          targetSeat = i;
          break;
        }
      }
    }

    if (targetSeat === null) {
      Notifications.add(src, 'Er is geen plaats in het voertuig', 'error');
      return;
    }

    setImmediate(() => {
      TaskWarpPedIntoVehicle(GetPlayerPed(String(target)), vehicle, targetSeat!);
    });
  }
);

RPC.register('police:interactions:getPlayerToRob', (src: number) => {
  const closestPlayer = Util.getClosestPlayerOutsideVehicle(src);
  if (!closestPlayer) return null;

  const targetMetadata = DGCore.Functions.GetPlayer(closestPlayer)?.PlayerData.metadata;
  if (!targetMetadata) return false;

  return {
    player: closestPlayer,
    canRob: isPlayerCuffed(closestPlayer) || targetMetadata.isdead || targetMetadata.inlaststand,
  };
});

Events.onNet('police:interactions:robbedPlayer', (src: number, target: number) => {
  const cash = Financials.getCash(target);
  const success = Financials.removeCash(target, cash, 'robbed-by-player');
  if (!success) return;
  Financials.addCash(src, cash, 'robbed-a-player');
  Notifications.add(src, `Je hebt €${cash} afgenomen`);
  Notifications.add(target, `Je bent berooft van €${cash}`);

  const targetPlayer = DGCore.Functions.GetPlayer(target);
  Util.Log(
    'police:interactions:robbedPlayer',
    {
      cid: targetPlayer.PlayerData.citizenid,
      serverId: targetPlayer.PlayerData.source,
      name: targetPlayer.PlayerData.name,
      steamId: targetPlayer.PlayerData.steamid,
    },
    `${Util.getName(src)} has robbed a player`,
    src
  );
});

Events.onNet('police:interactions:seizeCash', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const cash = Financials.getCash(target);
  const success = Financials.removeCash(target, cash, 'robbed-by-player');
  if (!success) return;
  Inventory.addItemToPlayer(src, 'seized_cash', 1, { amount: cash });

  const targetPlayer = DGCore.Functions.GetPlayer(target);
  Util.Log(
    'police:interactions:seizedCash',
    {
      cid: targetPlayer.PlayerData.citizenid,
      serverId: targetPlayer.PlayerData.source,
      name: targetPlayer.PlayerData.name,
      steamId: targetPlayer.PlayerData.steamid,
    },
    `${Util.getName(src)} has seized a players cash`,
    src
  );
});

Inventory.registerUseable('seized_cash', (src, itemState) => {
  if (Jobs.isWhitelisted(src, 'police')) {
    Notifications.add(src, 'Dit is niet de bedoeling e', 'error');
    return;
  }
  Inventory.destroyItem(itemState.id);
  const amount = itemState.metadata.amount;
  Financials.addCash(src, amount, 'opened-seized-cash');
  Util.Log(
    'police:interactions:openedSeizedCash',
    {
      amount,
    },
    `${Util.getName(src)} opened a seized cash bag`,
    src
  );
});

Events.onNet('police:interactions:patDown', async (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const cid = Util.getCID(target);
  const illegalItems = getPoliceConfig().config.patDownItems;
  const playerItems = await Inventory.getItemsInInventory('player', String(cid));
  const hasIllegal = playerItems.some(i => illegalItems.includes(i.name));
  const message = hasIllegal ? 'Persoon lijkt iets op zak te hebben' : 'Kon niks voelen op de persoon';
  Notifications.add(src, message, 'info');
  Notifications.add(target, 'Een agent heeft je oppervlakking gefouilleerd', 'error');
});

Events.onNet('police:interactions:search', async (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand bij je', 'error');
    return;
  }

  const cash = Financials.getCash(target);
  Notifications.add(src, `De persoon heeft €${cash} opzak`);
  Events.emitNet('police:interactions:searchPlayer', src, target);
  Notifications.add(target, 'Een agent is je aan het fouilleren', 'error');

  const targetPlayer = DGCore.Functions.GetPlayer(target);
  Util.Log(
    'police:interactions:searchedPlayer',
    {
      cid: targetPlayer.PlayerData.citizenid,
      serverId: targetPlayer.PlayerData.source,
      name: targetPlayer.PlayerData.name,
      steamId: targetPlayer.PlayerData.steamid,
    },
    `${Util.getName(src)} has searched a player`,
    src
  );
});

Events.onNet('police:interactions:tryToCuff', async (src: number, coords: Vec3) => {
  // Check if has cuffitem or is cop
  const hasCuffs = Jobs.getCurrentJob(src) === 'police' || (await Inventory.doesPlayerHaveItems(src, 'hand_cuffs'));
  if (!hasCuffs) return;

  // Check if not dead or cuffed himself
  const plyMetadata = DGCore.Functions.GetPlayer(src)?.PlayerData.metadata;
  if (!plyMetadata || isPlayerCuffed(src) || plyMetadata.isdead || plyMetadata.inlaststand) return;

  // get target
  const closestPlayer = Util.getClosestPlayerOutsideVehicle(src, 1.5);
  if (!closestPlayer) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const timeout = isPlayerCuffed(closestPlayer) ? 0 : getPoliceConfig().config.cuffTimeout;
  setTimeout(() => {
    doCuffAction(src, closestPlayer, coords);
  }, timeout);
});

Events.onNet('police:interactions:setCuffState', (src: number, state: Police.CuffType | null) => {
  setPlayerCuffState(src, state);

  // Stop escorting when uncuffed
  if (state === null) {
    const escortingPlayer = getPlayerWhoIsEscorting(src);
    if (!escortingPlayer) return;
    Events.emitNet('police:interactions:stopEscorting', escortingPlayer);
  }
});

Events.onNet('police:interactions:showCuffLogs', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const closestPlayer = Util.getClosestPlayerOutsideVehicle(src, 2);
  if (!closestPlayer) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  showCuffLogs(src, closestPlayer);
});

on('DGCore:server:playerUnloaded', (plyId: number, cid: number) => {
  if (!isPlayerCuffed(plyId)) return;
  Util.Log('police:interactions:droppedWithCuffs', { plyId, cid }, `Player ${cid} unloaded while cuffed`);
});

RPC.register('police:interactions:getPlyToEscort', (src: number) => {
  if (isPlayerEscorting(src)) return;

  const plyMetadata = DGCore.Functions.GetPlayer(src)?.PlayerData.metadata;
  if (!plyMetadata || isPlayerCuffed(src) || plyMetadata.isdead || plyMetadata.inlaststand) return;

  const closestPlayer = Util.getClosestPlayerOutsideVehicle(src, 1.5);
  if (!closestPlayer) return;

  if (isPlayerBeingEscorted(closestPlayer)) return;

  // TODO: Add dead check
  if (!isPlayerCuffed(closestPlayer)) return;

  return closestPlayer;
});

Events.onNet('police:interactions:escort', (src: number, target: number) => {
  Events.emitNet('police:interactions:getEscorted', target, src);
  setPlayerEscorting(src, target);
});

Events.onNet('police:interactions:stopEscort', (src: number) => {
  const player = getEscortedPlayer(src);
  if (!player) return;
  Events.emitNet('police:interactions:detachEscorted', player);
  stoppedEscorting(src);
});

Chat.registerCommand('carry', 'Neem een persoon op je schouder', [], 'user', src => {
  startCarryDuo(src);
});

Events.onNet('police:interactions:stopCarrying', (src: number, coords: Vec3) => {
  if (!isPlayerInCarryDuo(src)) return;
  stopCarryDuo(src, coords);
});
