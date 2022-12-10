import { Events, Interiors, Inventory, Notifications, Peek, RPC, Util } from '@dgx/client';
import { CONTAINER_MODELS } from './constants.containers';
import { getContainerEntrance } from './helpers.containers';
import { enterContainer } from './service.containers';

Peek.addModelEntry(
  CONTAINER_MODELS.map(i => i.model),
  {
    options: [
      {
        label: 'Proberen Openen',
        icon: 'fas fa-lock',
        action: (_, entity) => {
          if (!entity) return;
          enterContainer(entity);
        },
        canInteract: entity => {
          if (!entity) return false;
          const entrance = getContainerEntrance(entity);
          return Util.getPlyCoords().distance(entrance) < 1.5;
        },
      },
    ],
    distance: 3.0,
  }
);

Peek.addZoneEntry('materials_mold_melting', {
  options: [
    {
      label: 'Mal Vullen',
      icon: 'fas fa-fill',
      items: 'key_mold',
      action: () => {
        Events.emitNet('materials:containers:meltMold');
      },
    },
  ],
  distance: 3.0,
});

on('materials:containers:leave', async () => {
  DoScreenFadeOut(500);
  await Util.Delay(500);
  Interiors.exitRoom();
  await Util.Delay(500);
  DoScreenFadeIn(500);
  Events.emitNet('materials:containers:left');
});

on('materials:containers:open', async () => {
  const benchName = await RPC.execute<string | undefined>('materials:containers:getBenchName');
  if (!benchName) {
    Notifications.add('Er is iets foutgelopen', 'error');
    return;
  }
  Inventory.openBench(benchName);
});
