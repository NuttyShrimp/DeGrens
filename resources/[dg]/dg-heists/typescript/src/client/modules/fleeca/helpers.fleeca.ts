import { RPC, Util } from '@dgx/client';

export const getPercentageOfPowerBox = async (entity: number): Promise<number> => {
  const coords = Util.getEntityCoords(entity);
  const amount = await RPC.execute<number>('heists:server:fleeca:getPowerPercentage', coords);
  return amount ?? 0;
};

export const placePlayerAtPowerBox = (entity: number) => {
  const ped = PlayerPedId();
  const pos = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0, -1.2, 0));
  const heading = GetEntityHeading(entity);
  SetEntityCoords(ped, pos.x, pos.y, pos.z, false, false, false, false);
  SetEntityHeading(ped, heading);
};
