import { Interiors, Notifications, Util, RPC, Taskbar, Events, PolyTarget, Peek } from '@dgx/client';
import { getContainerEntrance } from './helpers.containers';

export const enterContainer = async (entity: number) => {
  const containerCoords = getContainerEntrance(entity);

  const isValidContainer = await RPC.execute<boolean>('materials:containers:isValid', containerCoords);
  if (!isValidContainer) {
    Notifications.add('Deze deur is vastgeroest', 'error');
    return;
  }

  const canEnter = await RPC.execute<boolean>('materials:containers:canEnter', containerCoords);
  if (!canEnter) {
    Notifications.add('Deze deur zit op slot', 'error');
    return;
  }

  const animStartPos = getContainerEntrance(entity, 0.7);
  await Util.goToCoords({ ...animStartPos, w: GetEntityHeading(entity) });

  const [canceled] = await Taskbar.create('door-open', 'Openen', 30000, {
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
      animDict: 'amb@prop_human_parking_meter@male@base',
      anim: 'base',
      flags: 17,
    },
  });
  if (canceled) return;

  const position = Util.getEntityCoords(entity);
  DoScreenFadeOut(500);
  await Util.Delay(500);
  await Interiors.createRoom('bench_container', position.subtract({ x: 0, y: 0, z: 50 }));
  await Util.Delay(500);
  DoScreenFadeIn(500);
  Events.emitNet('materials:containers:entered', containerCoords);
};

export const buildMoldZone = (coords: Vec3) => {
  PolyTarget.addCircleZone('materials_mold_melting', coords, 4, { useZ: true, data: {} });
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
  });
};
