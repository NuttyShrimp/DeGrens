import { PolyZone, RPC, Util } from '@dgx/client';

const garages: Map<string, Vehicles.Garages.Garage> = new Map();

export const createGarageZone = (garage: Vehicles.Garages.Garage) => {
  if (Array.isArray(garage.location.vector)) {
    PolyZone.addPolyZone(
      'garage',
      garage.location.vector,
      {
        ...garage.location.options,
        data: {
          id: garage.garage_id,
        },
      },
      true
    );
  } else {
    garage.location = garage.location as Vehicles.Garages.BoxLocation;
    PolyZone.addBoxZone(
      'garage',
      garage.location.vector,
      garage.location.width,
      garage.location.length,
      {
        ...garage.location.options,
        data: {
          id: garage.garage_id,
        },
      },
      true
    );
  }
};

export const registerGarages = async (pGarages: Vehicles.Garages.Garage[]) => {
  for (const g of pGarages) {
    garages.set(g.garage_id, g);
    createGarageZone(g);
    await Util.Delay(10);
  }
  console.log(`[Garages] Loaded ${garages.size} garages`);
};

export const isOnParkingSpot = async (entity?: number): Promise<boolean> => {
  if (entity && (!NetworkGetEntityIsNetworked(entity) || IsPedAPlayer(entity))) return false;
  const netId = entity !== undefined ? NetworkGetNetworkIdFromEntity(entity) : null;
  const onSpot = await RPC.execute<boolean>('vehicles:garage:isOnParkingSpot', netId);
  return onSpot ?? false;
};

export const removeGarage = (garageId: string) => {
  garages.delete(garageId);
  PolyZone.removeZone('garage', garageId);
};
