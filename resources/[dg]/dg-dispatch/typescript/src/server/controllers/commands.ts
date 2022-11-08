import { Chat, Events, Util } from '@dgx/server';
import { createDispatchCall } from 'services/dispatch';

Chat.registerCommand('toggleDispatch', 'Toggle dispatch notifications', [], 'user', src => {
  Events.emitNet('dispatch:toggleDispatchNotifications', src);
});

setImmediate(() => {
  if (Util.isDevEnv()) {
    Chat.registerCommand('testDispatch', 'create dummy dispatch', [], 'developer', src => {
      const plyPed = GetPlayerPed(String(src));
      const plyVeh = GetVehiclePedIsIn(plyPed, false);
      createDispatchCall({
        title: '10-13A: BOZO DOWN',
        description: 'This a description with some useless text for testing purposes only. Do not try this at home :)',
        tag: '100',
        officer: src,
        vehicle: plyVeh,
        entries: {},
        coords: Util.getPlyCoords(src),
      });
    });
  }
});
