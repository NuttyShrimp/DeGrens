import { Animations, Events, Minigames, RPC, Util } from '@dgx/client';

export const startHackingBanktruck = async (vehicle: number) => {
  const hackData = await RPC.execute<Criminal.Banktruck.Config['hack'] | undefined>(
    'criminal:banktruck:startHacking',
    NetworkGetNetworkIdFromEntity(vehicle)
  );
  if (!hackData) return;

  const [min, max] = GetModelDimensions(GetEntityModel(vehicle));
  const halfLength = (max[1] - min[1]) / 2;
  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, -(halfLength + 1), 0));
  const heading = Util.getHeadingToFaceCoordsFromCoord(coords, Util.getEntityCoords(vehicle));

  await Util.goToCoords({ ...coords, w: heading });

  const result = await Animations.doLaptopHackAnimation(async () => {
    if (Util.isDevEnv()) return true;
    return await Minigames.binarysudoku(hackData.gridSize, hackData.time);
  });

  Events.emitNet('criminal:banktruck:finishHacking', result);
};

export const startLootingBanktruck = (vehicle: number) => {
  Events.emitNet('criminal:banktruck:startLooting', NetworkGetNetworkIdFromEntity(vehicle));
};
