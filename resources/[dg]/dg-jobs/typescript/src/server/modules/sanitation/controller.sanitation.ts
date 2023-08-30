import { Events, RPC } from '@dgx/server';
import {
  finishJobForGroup,
  takeBagFromDumpster,
  startJobForGroup,
  putBagInVehicle,
  skipCurrentLocation,
  openSanitationRecycleMenu,
  doSanitationRecycleAction,
} from './service.sanitation';

Events.onNet('jobs:sanitation:signIn', (src: number) => {
  startJobForGroup(src);
});

Events.onNet('jobs:sanitation:finish', (src: number, netId: number) => {
  finishJobForGroup(src, netId);
});

RPC.register('jobs:sanitation:takeFromDumpster', (src: number, location: Vec3) => {
  return takeBagFromDumpster(src, location);
});

Events.onNet('jobs:sanitation:putInVehicle', (src: number) => {
  putBagInVehicle(src);
});

Events.onNet('jobs:sanitation:skipLocation', (plyId: number) => {
  skipCurrentLocation(plyId);
});

Events.onNet('jobs:sanitation:openRecycleMenu', openSanitationRecycleMenu);
Events.onNet('jobs:sanitation:doRecycleAction', doSanitationRecycleAction);
