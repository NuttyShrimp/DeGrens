import { Chat, Jobs, Notifications, Inventory, Events, Util, RPC, UI, Vehicles, Police } from '@dgx/server';
import { isPlayerCuffed } from 'modules/interactions/service.interactions';
import { getPoliceConfig } from 'services/config';
import {
  cleanupPlayerInJail,
  escapePrison,
  getAllPlayersInPrison,
  getPlayerMonths,
  leavePrison,
  moveAllPlayerItemsToPrisonStash,
  restorePlayerSentence,
  sendPlayerToPrison,
} from './service.prison';

Chat.registerCommand(
  'jail',
  'Stuur een persoon naar de gevangenis',
  [
    { name: 'id', description: 'ID van burger' },
    { name: 'aantal', description: 'Aantal maanden' },
  ],
  'user',
  (src, _, args) => {
    if (Jobs.getCurrentJob(src) !== 'police') {
      Chat.sendMessage(src, {
        type: 'system',
        message: `Dit is enkel voor overheidsdiensten`,
        prefix: '',
      });
      return;
    }

    const target = Number(args[0]);
    const amount = Number(args[1]);
    if (isNaN(target) || isNaN(amount)) {
      Notifications.add(src, 'Geen getal', 'error');
      return;
    }

    if (amount <= 0) {
      Notifications.add(src, 'Aantal moet meer dan 0 zijn', 'error');
      return;
    }

    const cid = Util.getCID(target, true);
    if (!cid) {
      Notifications.add(src, 'Deze persoon is niet in de stad', 'error');
      return;
    }

    const originPosition = Util.getPlyCoords(src);
    const targetPosition = Util.getPlyCoords(target);
    if (originPosition.distance(targetPosition) > 8) {
      Notifications.add(src, 'Je moet bij de persoon zijn', 'error');
      return;
    }

    sendPlayerToPrison(target, amount);
    Util.Log(
      'police:prison:jailed',
      { targetCid: cid, months: amount },
      `${Util.getName(src)} has send a player to prison for ${amount} months`,
      src
    );
  }
);

// We preload the prison stash inventory for each player to ensure there are no allowed items
on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  const stashId = `prison_items_${playerData.citizenid}`;
  Inventory.createScriptedStash(stashId, 40, []); // Same as player inventory!
});

on('DGCore:server:playerUnloaded', (plyId: number) => {
  cleanupPlayerInJail(plyId);
});

Events.onNet('police:prison:confiscate', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }
  if (!isPlayerCuffed(target)) {
    Notifications.add(src, 'Deze persoon is niet geboeit', 'error');
    return;
  }

  moveAllPlayerItemsToPrisonStash(target);
  Util.Log(
    'police:prison:confiscatedItems',
    { target, place: Util.getPlyCoords(target) },
    `${Util.getName(src)} has confiscated someones items`,
    src
  );
});

Events.onNet('police:prison:checkTime', (src: number) => {
  const amount = getPlayerMonths(src);

  if (amount === undefined) {
    Notifications.add(src, 'Je zit niet in de gevangenis', 'error');
    return;
  }
  Notifications.add(src, `Je moet nog ${amount} maanden zitten`);
});

Events.onNet('police:prison:tryToLeave', (src: number) => {
  const amount = getPlayerMonths(src);

  if (amount === undefined) {
    Notifications.add(src, 'Je zit niet in de gevangenis', 'error');
    return;
  }
  if (amount > 0) {
    Notifications.add(src, `Je hebt nog ${amount} maanden tegaan`, 'error');
    return;
  }

  leavePrison(src);
});

Events.onNet('police:prison:tryToRestore', (src: number) => {
  restorePlayerSentence(src);
});

Events.onNet('police:prison:checkPrisoners', (src: number) => {
  const prisoners = getAllPlayersInPrison();

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Gevangenen',
      disabled: true,
      description: 'Klik op een naam om deze persoon te roepen',
      icon: 'fas fa-handcuffs',
    },
  ];

  prisoners.forEach(p => {
    menu.push({
      title: p.name,
      description: `Nog ${p.months} maanden te gaan`,
      callbackURL: `prison/pingPrisoner`,
      data: {
        id: p.id,
      },
    });
  });

  UI.openContextMenu(src, menu);
});

Events.onNet('police:prison:pingPrisoner', (src: number, target: number) => {
  Chat.sendMessage(target, {
    type: 'normal',
    prefix: 'Gevangenis: ',
    message: 'er staat iemand in de bezoekersruimte voor je',
  });
});

Events.onNet('police:prison:enteredPrisonZone', (src: number, netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (!DoesEntityExist(veh)) return;
  if (GetVehicleType(veh) !== 'heli') return;
  const whitelisted = getPoliceConfig().prison.whitelistedZoneVehicle.map(m => GetHashKey(m));
  const model = GetEntityModel(veh);
  if (whitelisted.includes(model)) return;

  Events.emitNet('police:prison:boom', src, NetworkGetNetworkIdFromEntity(veh));
});

Events.onNet('police:prison:leftPrisonZone', (src: number) => {
  escapePrison(src);
  Util.Log(
    'police:prison:leftZone',
    {
      cuffed: isPlayerCuffed(src),
    },
    `${Util.getName(src)} has left the prison zone while jailed`,
    src
  );
  const coords = Util.getPlyCoords(src);
  Police.createDispatchCall({
    tag: '10-98',
    title: 'Gevangenis Uitbraak',
    description: 'Melding van mogelijks gevangenisuitbraak',
    coords: coords,
    entries: {
      'camera-cctv': getPoliceConfig().prison.camId,
    },
    criminal: src,
    blip: {
      sprite: 237,
      color: 4,
    },
    important: true,
  });
});

global.exports('leavePrison', (plyId: number) => {
  leavePrison(plyId);
});
