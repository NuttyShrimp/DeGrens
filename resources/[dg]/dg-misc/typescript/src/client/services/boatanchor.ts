import { BaseEvents, Events } from '@dgx/client';

const toggleAnchor = (boatEntity: number, toggle: boolean) => {
  if (toggle && !CanAnchorBoatHere(boatEntity)) {
    return;
  }

  SetBoatAnchor(boatEntity, toggle);
  SetBoatFrozenWhenAnchored(boatEntity, toggle);
  SetForcedBoatLocationWhenAnchored(boatEntity, toggle);
};

Events.onNet('misc:client:toggleAnchor', (netId: number, toggle: boolean) => {
  const boat = NetworkGetEntityFromNetworkId(netId);
  toggleAnchor(boat, toggle);
});

BaseEvents.onEnteredVehicle(boat => {
  if (!NetworkHasControlOfEntity(boat) || GetVehicleClass(boat) !== 14) return;
  const hasAnchor = Entity(boat).state.anchor;
  if (!hasAnchor) return;
  toggleAnchor(boat, hasAnchor);
});
