import { Chat, Notifications, Util } from '@dgx/server';

const toggleBoatAnchor = (boatEntity: number) => {
  Util.sendEventToEntityOwner(boatEntity, 'misc:toggleAnchor', NetworkGetNetworkIdFromEntity(boatEntity));
};

global.exports('toggleBoatAnchor', toggleBoatAnchor);

Chat.registerCommand('anker', 'Toggle het anker van je boot!', [], 'user', src => {
  const ped = GetPlayerPed(String(src));
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (!vehicle || GetVehicleType(vehicle) !== 'boat') {
    Notifications.add(src, 'Je zit niet in een boot', 'error');
    return;
  }
  if (GetPedInVehicleSeat(vehicle, -1) !== ped) {
    Notifications.add(src, 'Je kan dit enkel als bestuurder', 'error');
    return;
  }
  toggleBoatAnchor(vehicle);
});
