import { Core, Events, Inventory, Peek, PolyZone, UI } from '@dgx/client';
import { cleanupJail, enterPrison, isInPrison, leavePrison, restoreSentence } from './service.prison';

global.exports('isInPrison', isInPrison);

PolyZone.onEnter('prison', () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh === 0) return;
  if (GetPedInVehicleSeat(veh, -1) !== ped) return;
  Events.emitNet('police:prison:enteredPrisonZone', NetworkGetNetworkIdFromEntity(veh));
});

PolyZone.onLeave('prison', () => {
  if (!isInPrison()) return;
  Events.emitNet('police:prison:leftPrisonZone');
  cleanupJail();
});

Peek.addZoneEntry('prison_item_retrieval', {
  options: [
    {
      label: 'Spullen Terugnemen',
      icon: 'fas fa-box-open-full',
      action: () => {
        const cid = LocalPlayer.state?.citizenid;
        if (!cid) return;
        const stashId = `prison_items_${cid}`;
        Inventory.openStash(stashId, 40); // Slots same as player inventory!
      },
    },
  ],
});

Peek.addZoneEntry('prison_phone', {
  options: [
    {
      label: 'Check Tijd',
      icon: 'fas fa-clock',
      action: () => {
        Events.emitNet('police:prison:checkTime');
      },
    },
    {
      label: 'Verlaten',
      icon: 'fas fa-person-walking-arrow-right',
      action: () => {
        Events.emitNet('police:prison:tryToLeave');
      },
    },
    {
      label: 'Uitloggen',
      icon: 'fas fa-bed',
      action: () => {
        DoScreenFadeOut(500);
        setTimeout(() => {
          Events.emitNet('chars:server:logOut');
        }, 500);
      },
    },
    {
      label: 'Telefoneren',
      icon: 'fas fa-phone',
      action: async () => {
        global.exports['dg-phone'].prisonCall();
      },
    },
  ],
  distance: 1.0,
});

Peek.addZoneEntry('prison_shop', {
  options: [
    {
      label: 'Cafetaria',
      icon: 'fas fa-mug-saucer',
      action: () => {
        Inventory.openShop('prison_shop');
      },
    },
  ],
  distance: 2.0,
});

Events.onNet('police:prison:goToPrison', () => {
  enterPrison();
});

Core.onPlayerUnloaded(() => {
  cleanupJail();
});

Events.onNet('police:prison:restoreSentence', () => {
  restoreSentence();
});

Events.onNet('police:prison:leave', () => {
  leavePrison();
});

Peek.addZoneEntry('check_prisoners', {
  options: [
    {
      label: 'Bekijk Gevangenen',
      icon: 'fas fa-people-simple',
      action: () => {
        Events.emitNet('police:prison:checkPrisoners');
      },
    },
  ],
});

UI.RegisterUICallback('prison/pingPrisoner', (data: { id: number }, cb) => {
  Events.emitNet('police:prison:pingPrisoner', data.id);
  cb({ meta: { message: 'done', ok: true }, data: {} });
});

// hehehe
Events.onNet('police:prison:boom', (netId: number) => {
  const veh = NetworkGetEntityFromNetworkId(netId);
  SetHeliTailRotorHealth(veh, 0);
});
