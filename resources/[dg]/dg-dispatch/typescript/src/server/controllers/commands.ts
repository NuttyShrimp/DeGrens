import { Chat, Events, Util, Inventory, Jobs, Notifications } from '@dgx/server';
import { setPlayerAsDisabled } from 'services/blips';

import { createDispatchCall, hasPlayerToggledDispatch, setPlayerToggledDispatch } from 'services/dispatch';

Chat.registerCommand('toggleDispatch', 'Toggle dispatch notifications', [], 'user', async plyId => {
  const job = Jobs.getCurrentJob(plyId);
  if (job !== 'police' && job !== 'ambulance') {
    Notifications.add(plyId, 'Dit is enkel voor hulpdiensten', 'error');
    return;
  }

  const toggledDispatch = !hasPlayerToggledDispatch(plyId);
  setPlayerToggledDispatch(plyId, toggledDispatch);
  Events.emitNet('dispatch:toggleNotifications', plyId, toggledDispatch);

  // disable if player toggled dispatch but dont enable if he also doesnt have button
  const hasBtn = await Inventory.doesPlayerHaveItems(plyId, 'emergency_button');
  setPlayerAsDisabled(plyId, toggledDispatch || !hasBtn);
});

setImmediate(() => {
  if (Util.isDevEnv()) {
    Chat.registerCommand('testDispatch', 'create dummy dispatch', [], 'developer', src => {
      const plyPed = GetPlayerPed(String(src));
      const plyVeh = GetVehiclePedIsIn(plyPed, false);
      createDispatchCall('police', {
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
