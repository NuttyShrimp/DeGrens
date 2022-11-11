import { Events } from '@dgx/client';

Events.onNet('misc:toggleAnchor', (netId: number) => {
  const boat = NetworkGetEntityFromNetworkId(netId);
  //@ts-ignore returns false or 1
  const shouldAnchor = IsBoatAnchoredAndFrozen(boat) !== 1;

  if (shouldAnchor && !CanAnchorBoatHere(boat)) {
    console.log('Cannot anchor here');
    return;
  }

  SetBoatAnchor(boat, shouldAnchor);
  SetBoatFrozenWhenAnchored(boat, shouldAnchor);
  SetForcedBoatLocationWhenAnchored(boat, shouldAnchor);
});
