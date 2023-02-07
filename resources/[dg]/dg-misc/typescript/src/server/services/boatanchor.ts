import { Events, Notifications, Util } from '@dgx/server';

const toggleBoatAnchor = (boatEntity: number) => {
  const entState = Entity(boatEntity).state;
  const newState = !entState.anchor;
  entState.anchor = newState;
  Util.sendEventToEntityOwner(
    boatEntity,
    'misc:client:toggleAnchor',
    NetworkGetNetworkIdFromEntity(boatEntity),
    newState
  );
};

global.exports('toggleBoatAnchor', toggleBoatAnchor);

Events.onNet('misc:server:toggleAnchor', (plyId: number) => {
  const plyPed = GetPlayerPed(String(plyId));
  const boat = GetVehiclePedIsIn(plyPed, false);
  if (GetPedInVehicleSeat(boat, -1) !== plyPed) {
    Notifications.add(plyId, 'Je bent geen bestuurder van dit voertuig', 'error');
    return;
  }

  toggleBoatAnchor(boat);
});
