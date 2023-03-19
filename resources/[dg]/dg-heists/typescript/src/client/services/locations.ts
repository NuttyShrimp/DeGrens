import { Events, PolyZone, Util } from '@dgx/client';

let currentLocation: Heists.LocationId | null;

export const getCurrentLocation = () => currentLocation;

export const buildLocationZones = (zones: Heists.InitData['zones']) => {
  for (const [id, zone] of zones) {
    PolyZone.addPolyZone('heists_location', zone.points, {
      minZ: zone.minZ,
      maxZ: zone.maxZ,
      data: {
        id,
      },
    });
  }
};

export const handlePlayerEnteredLocation = (locationId: Heists.LocationId) => {
  currentLocation = locationId;
  Events.emitNet('heists:location:enter', locationId);
};

export const handlePlayerLeftLocation = (locationId: Heists.LocationId) => {
  currentLocation = null;
  Events.emitNet('heists:location:leave', locationId);
};

export const setDoorState = async (doorConfig: Heists.Door.Config, state: Heists.Door.State) => {
  if (doorConfig.isRayfireObject) {
    handleRayfireObjectDoor(doorConfig.model, doorConfig.coords, state === 'open');
    return;
  }

  if (doorConfig.portalId) {
    await updateInteriorPortalFlag(doorConfig.portalId);
  }

  const doorObject = GetClosestObjectOfType(
    doorConfig.coords.x,
    doorConfig.coords.y,
    doorConfig.coords.z,
    10.0,
    doorConfig.model,
    false,
    false,
    false
  );
  if (!doorObject || !DoesEntityExist(doorObject)) return console.log('Could not find door');

  const heading = doorConfig.heading?.[state] ?? 0;
  SetEntityHeading(doorObject, heading);
  FreezeEntityPosition(doorObject, true);
};

const updateInteriorPortalFlag = async (portalId: number) => {
  const interiorId = GetInteriorFromEntity(PlayerPedId());
  if (interiorId === 0) return;

  const portalFlag = GetInteriorPortalFlag(interiorId, portalId);
  if (portalFlag === 0) return;

  SetInteriorPortalFlag(interiorId, portalId, 0);
  RefreshInterior(interiorId);
  await Util.Delay(250);
};

const handleRayfireObjectDoor = (model: string, coords: Vec3, state: boolean) => {
  const doorObject = GetRayfireMapObject(coords.x, coords.y, coords.z, 10.0, model);
  if (!DoesRayfireMapObjectExist(doorObject)) return;

  if (!state) {
    SetStateOfRayfireMapObject(doorObject, 4);
    return;
  }

  // SetStateOfRayfireMapObject(vaultobject, 4)
  // Citizen.Wait(100)
  // SetStateOfRayfireMapObject(vaultobject, 5)
  // Citizen.Wait(100)
  // SetStateOfRayfireMapObject(vaultobject, 6)
  // Citizen.Wait(100)
  // SetStateOfRayfireMapObject(vaultobject, 7)
  // Citizen.Wait(100)
  // SetStateOfRayfireMapObject(vaultobject, 8)
  // AddExplosion(coords.x, coords.y, coords.z, 2, 0.0, true, true, true, true)
  // Citizen.Wait(100)

  SetStateOfRayfireMapObject(doorObject, 9);
};
