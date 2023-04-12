import { Events, Notifications, RPC, Taskbar, Util, Minigames, Particles } from '@dgx/client';

export const checkPercentageOfLocation = async (entity: number) => {
  await movePlayerToBox(entity);

  const [canceled] = await Taskbar.create('bolt', 'Signaal meten', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      carMovement: true,
      movement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 16,
    },
  });
  if (canceled) return;

  const location = Util.getEntityCoords(entity);
  Events.emitNet('heists:fleeca:checkLocationPercentage', location);
};

export const disableLocationPower = async (entity: number) => {
  await movePlayerToBox(entity);

  const location = Util.getEntityCoords(entity);
  const canDisable = await RPC.execute<Fleeca.CanDisable>('heists:fleeca:canDisableLocation', location);
  if (!canDisable) return;

  switch (canDisable) {
    case 'incorrectLocation':
      Notifications.add('Signaalsterkte te laag', 'error');
      return;
    case 'unfulfilledRequirements':
      Notifications.add('Te sterk beveiligd', 'error');
      return;
  }

  const hackSuccess = await Minigames.sequencegame(3, 6, 10);
  if (hackSuccess) {
    const [modelSizeMin, modelSizeMax] = GetModelDimensions(GetEntityModel(entity));
    const halfDepth = (modelSizeMax[1] - modelSizeMin[1]) / 2;
    const halfHeight = (modelSizeMax[2] - modelSizeMin[2]) / 2;
    const particleCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0, -halfDepth, halfHeight));
    Particles.add({
      dict: 'core',
      name: 'ent_sht_electrical_box',
      looped: false,
      coords: particleCoords,
    });
  } else {
    Notifications.add('Mislukt', 'error');
  }

  Events.emitNet('heists:fleeca:disablePower', location, hackSuccess);
};

export const movePlayerToBox = async (entity: number) => {
  const ped = PlayerPedId();
  const pos = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0, -1.2, 0));
  const heading = GetEntityHeading(entity);
  await Util.goToCoords({ ...pos, w: heading });
};
