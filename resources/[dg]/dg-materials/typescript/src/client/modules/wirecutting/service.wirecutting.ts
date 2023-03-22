import { Notifications, RPC, Events, Taskbar, Inventory, Minigames, PolyTarget } from '@dgx/client';

export const buildWirecuttingZones = (zones: Materials.Wirecutting.Config['locations']) => {
  zones.forEach((coords, i) => {
    const { w: heading, ...position } = coords;
    PolyTarget.addBoxZone(
      'wirecutting',
      position,
      8,
      2.0,
      { minZ: position.z - 1, maxZ: position.z + 1, heading, data: { id: i } },
      true
    );
  });
};

export const tryToCutWire = async (locationId: number) => {
  const hasScissors = await Inventory.doesPlayerHaveItems('bolt_cutters');
  if (!hasScissors) {
    Notifications.add('Hoe ga je dit knippen?', 'error');
    return;
  }

  const canCut = await RPC.execute<boolean>('materials:wirecutting:canCut', locationId);
  if (!canCut) {
    Notifications.add('Hier is niks meer...');
    return;
  }

  const minigameSucces = await Minigames.keygame(5, 2, 10);
  Events.emitNet('materials:wirecutting:dispatch', locationId);
  if (!minigameSucces) {
    Notifications.add('Je was net niet sterk genoeg om te knippen...');
    return;
  }

  doCutAction(locationId);
};

const doCutAction = async (locationId: number) => {
  const canCut = await RPC.execute<boolean>('materials:wirecutting:canCut', locationId);
  if (!canCut) {
    Notifications.add('Hier is niks meer...');
    return;
  }

  const [canceled] = await Taskbar.create('scissors', 'Knippen', 40000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });
  if (canceled) return;

  Events.emitNet('materials:wirecutting:cut', locationId);
};
