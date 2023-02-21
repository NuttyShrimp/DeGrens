import { Business, Jobs, Notifications, UI, Util } from '@dgx/server';
import { VehicleStateTranslation } from 'helpers/enums';
import { getConfigByModel, getVehicleType } from 'modules/info/service.info';

import {
  getPlayerOwnedVehiclesAtGarage,
  getPlayerSharedVehicles,
  getPlayerVehicleInfo,
  getVehicleLog,
  hasVehicleMaintenanceFees,
  insertVehicleParkLog,
  insertVehicleStatus,
  setVehicleGarage,
  setVehicleState,
} from '../../db/repository';
import { deleteVehicle, getVinForNetId, spawnOwnedVehicle } from '../../helpers/vehicle';
import vinmanager from '../identification/classes/vinmanager';
import { getCidFromVin } from '../identification/service.id';
import { getNativeStatus } from '../status/service.status';

import { GarageThread } from './classes/parkingSpotThread';
import { garageLogger } from './logger.garages';

const garages: Map<string, Garage.Garage> = new Map();
const parkingSpotThreads: Map<number, GarageThread> = new Map();
let isLoaded = false;

// region Garage info
export const registerGarage = (garage: Garage.Garage) => {
  if (garages.has(garage.garage_id)) {
    garageLogger.error(`Garage ${garage.garage_id} already registered, overwriting`);
  }
  garages.set(garage.garage_id, garage);
};

export const setGaragesLoaded = () => {
  isLoaded = true;
};

export const areGaragesLoaded = () => {
  return isLoaded;
};

export const GetGarages = () => {
  return [...garages.values()];
};

export const getGarageById = (garageId: string) => {
  return garages.get(garageId)!;
};
// endregion
// region: ParkingSpotThread
export const startThread = (src: number, garageId: string) => {
  const garage = garages.get(garageId);
  if (garage) {
    const thread = new GarageThread(src, garageId);
    parkingSpotThreads.set(src, thread);
    thread.start();
  }
};

export const stopThread = (src: number) => {
  const thread = parkingSpotThreads.get(src);
  if (thread) {
    thread.stop();
    parkingSpotThreads.delete(src);
  }
};

export const isOnParkingSpot = async (src: number, netId: number | null): Promise<boolean> => {
  const cid = Util.getCID(src);

  if (!parkingSpotThreads.has(src)) return false;
  const thread = parkingSpotThreads.get(src);
  if (!thread) return false;
  if (!netId) {
    if (!thread.isNearGarageSpot()) return false;
  }

  let targetEntity: number = GetPlayerPed(String(src));
  let targetIsPlayer = true;
  if (netId !== null) {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(entity)) return false;
    targetEntity = entity;
    targetIsPlayer = false;
  }

  let owner = 0;
  if (!targetIsPlayer) {
    // Check if vehicle is playerOwned
    const vehState = Entity(targetEntity).state;
    if (!vehState.vin) return false;
    owner = await getCidFromVin(vehState.vin);
    if (!owner) return false;
  } else {
    owner = cid;
  }

  // Check if owner has access to current garage to prevent players from storing vehicles in inaccessible garages
  // Only owner can store in public garages
  const garage = thread.getGarage();
  if (!garage) return false;
  const { garage_id, shared } = garage;
  if (!shared && owner !== cid) return false;
  const hasAccess = doesCidHasAccess(owner, garage_id);
  if (!hasAccess) return false;

  const entityCoords = Util.getEntityCoords(targetEntity);
  const spot = thread.getCurrentParkingSpot();
  if (!spot) return false;
  if (entityCoords.distance(spot.coords) > spot.size + spot.distance) return false;
  // Check if there are no vehicles already on spot when checking player
  if (targetIsPlayer && Util.isAnyVehicleInRange(spot.coords, spot.size)) return false;
  return true;
};
// endregion
// region Actual garage
const validateAccessToGarage = (src: number) => {
  if (!parkingSpotThreads.has(src)) {
    return;
  }
  const thread = parkingSpotThreads.get(src);
  if (!thread || !thread.isNearGarageSpot()) {
    return;
  }
  const garageInfo = thread.getGarage();
  if (!garageInfo?.garage_id || !doesCidHasAccess(Player(src).state.cid, garageInfo.garage_id)) {
    return;
  }
  return garageInfo;
};

/**
 *  An exampleTree for the menu
 *  Private
 *    - PrivateVeh1
 *      - Status: (body, engine, fuel)
 *      - Neem voertuig
 *      - Zet voertuig (niet) gedeeld
 *    - PrivateVeh2
 *      - Status: (body, engine, fuel)
 *      - Neem voertuig
 *      - Zet voertuig (niet) gedeeld
 *  Shared
 *    - SharedVeh1
 *      - Status: (body, engine, fuel)
 *      - Neem voertuig
 *    - SharedVeh2
 *      - Status: (body, engine, fuel)
 *      - Neem voertuig
 */
export const showPlayerGarage = async (src: number) => {
  const garageInfo = validateAccessToGarage(src);
  if (!garageInfo) return;
  const { garage_id, shared } = garageInfo;
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Persoonlijk',
      id: 'personal',
      icon: 'car-garage',
      submenu: [],
    },
  ];
  const cid = Player(src).state.cid;
  const plyVehicles = await getPlayerOwnedVehiclesAtGarage(cid, garage_id);
  // Generate menu
  for (const veh of plyVehicles) {
    const vehInfo = getConfigByModel(veh.model);
    menu[0].submenu!.push({
      title: vehInfo?.name ?? '',
      description: `Plaat: ${veh.plate} | ${VehicleStateTranslation[veh.state]}`,
      submenu: [
        {
          title: 'Neem voertuig uit garage',
          callbackURL: veh.state === 'parked' ? 'vehicles:garage:takeVehicle' : undefined,
          data: {
            vin: veh.vin,
          },
          disabled: veh.state !== 'parked',
        },
        {
          title: 'Voertuig Status',
          description: `${VehicleStateTranslation[veh.state]} | Engine: ${Math.round(
            (veh.status?.engine ?? 1000) / 10
          )}% | Body: ${Math.round((veh.status?.body ?? 1000) / 10)}%`,
        },
        {
          title: 'Voertuig Garage log',
          submenu: ((await getVehicleLog(veh.vin)) ?? []).map(log => {
            const entry: ContextMenu.Entry = {
              title: `${log.cid} heeft het voertuig ${log.action === 'parked' ? 'geparkeerd' : 'uitgehaald'}`,
              description: log.state,
            };
            return entry;
          }),
        },
      ],
    });
  }
  if (!shared) {
    UI.openContextMenu(src, menu);
    return;
  }
  menu.push({
    title: 'Gedeeld',
    id: 'shared',
    icon: 'car-garage',
    submenu: [],
  });
  const sharedVehicles = await getPlayerSharedVehicles(cid, garage_id);
  sharedVehicles.forEach(veh => {
    const vehInfo = getConfigByModel(veh.model);
    menu[1].submenu!.push({
      title: vehInfo?.name ?? '',
      description: `NrPlaat: ${veh.plate} | ${VehicleStateTranslation[veh.state]}`,
      submenu: [
        {
          title: 'Neem voertuig uit garage',
          callbackURL: 'vehicles:garage:takeVehicle',
          data: {
            vin: veh.vin,
          },
          disabled: veh.state !== 'parked',
        },
        {
          title: 'Voertuig Status',
          description: `${VehicleStateTranslation[veh.state]} | Engine: ${Math.round(
            veh.status.engine / 10
          )}% | Body: ${Math.round(veh.status.body / 10)}%`,
        },
      ],
    });
  });
  UI.openContextMenu(src, menu);
};

export const takeVehicleOutGarage = async (src: number, vin: string): Promise<number | undefined> => {
  const garageInfo = validateAccessToGarage(src);
  if (!garageInfo) return;
  const parkingSpot = parkingSpotThreads.get(src)?.getCurrentParkingSpot();
  if (!parkingSpot) return;
  const cid = Player(src).state.cid;

  // Things to check
  // - Is vehicle in same garaga Id
  //   - If not and garage is shared, check if player has access to this garage
  // - Is vehicle is parked
  const vehicleInfo = await getPlayerVehicleInfo(vin, {
    cid,
    garageId: garageInfo.garage_id,
    isSharedGarage: garageInfo.shared,
  });
  if (!vehicleInfo) {
    garageLogger.info(
      `${cid} tried to take vehicle ${vin} out of garage ${garageInfo.garage_id} but didn't met the requirements`
    );
    Util.Log(
      `vehicle:garage:retrieve:failed`,
      {
        vin,
        garageId: garageInfo.garage_id,
        isShared: garageInfo.shared,
      },
      `${cid} tried to retrieve vehicle ${vin} from garage ${garageInfo.name} but didn't met the requirements`,
      src
    );
    return;
  }

  const hasMaintenanceFees = await hasVehicleMaintenanceFees(vehicleInfo.vin);
  if (hasMaintenanceFees) {
    Notifications.add(src, 'Je moet eerst je maintenance fees betalen!', 'error');
    return;
  }

  const veh = await spawnOwnedVehicle(src, vehicleInfo, {
    ...parkingSpot.coords,
    z: parkingSpot.coords.z + 0.5,
    w: parkingSpot.heading,
  });
  if (!veh) return;

  await setVehicleState(vin, 'out');
  insertVehicleParkLog(vin, cid, false, vehicleInfo.status);
  Util.Log(
    'vehicle:garage:retrieve:success',
    {
      vin,
      garage: garageInfo,
      vehicleStatus: vehicleInfo.status,
    },
    `${cid} has successfully retrieved vehicle with vin ${vin} from the garage with id ${garageInfo.garage_id}`,
    src
  );

  return veh;
};

export const storeVehicleInGarage = async (src: number, entity: number) => {
  // Check if vehicle is on a parkingspot
  const garageThread = parkingSpotThreads.get(src);
  if (!garageThread) {
    garageLogger.silly(`No garage thread found`);
    return;
  }
  const vehCoords = Util.getEntityCoords(entity);
  const vehParkingSpot = garageThread.getNearestSpot(vehCoords);
  if (!vehParkingSpot) {
    garageLogger.silly(`No parkingspot found`);
    return;
  }
  const vehType = getVehicleType(entity);
  if (!vehParkingSpot.type.includes(vehType)) {
    Notifications.add(src, 'Je kunt dit voertuig hier niet parkeren', 'error');
    return;
  }
  const garage = garageThread.getGarage();
  if (!garage) {
    garageLogger.silly(`Could not get garage id from current garage`);
    return;
  }
  const { garage_id, shared } = garage;
  const cid = Player(src).state.cid;
  const vin = getVinForNetId(NetworkGetNetworkIdFromEntity(entity));
  if (!vin) {
    garageLogger.warn(`Could not find vin for vehicle ${entity}`);
    return;
  }
  if (!vinmanager.isVinFromPlayerVeh(vin)) {
    Notifications.add(src, 'Je kunt dit voertuig hier niet parkeren', 'error');
    return;
  }
  const { cid: vehOwner } = await getPlayerVehicleInfo(vin);
  if (!shared && cid !== vehOwner) {
    garageLogger.silly(`Cannot store other peoples car in public garage`);
    Notifications.add(src, 'Enkel de eigenaar kan het voertuig in deze garage plaatsen', 'error');
    return;
  }
  if (!doesCidHasAccess(vehOwner, garage_id)) {
    garageLogger.silly(`Player does not have access to garage`);
    Notifications.add(src, 'De eigenaar van dit voertuig heeft geen toegang tot deze garage', 'error');
    return;
  }
  // Save state
  const vehState = await getNativeStatus(entity, vin);
  await insertVehicleStatus(vin, vehState);
  // Delete vehicle
  deleteVehicle(entity);
  // Set vehicle as parked
  await setVehicleState(vin, 'parked');
  await setVehicleGarage(vin, garage_id);
  insertVehicleParkLog(vin, cid, true, vehState);
  Util.Log(
    'vehicle:garage:parked:success',
    {
      vin,
      garageId: garage_id,
      vehicleStatus: vehState,
    },
    `${cid} has successfully parked a vehicle with vin ${vin} in a garage with id ${garage_id}`,
    src
  );
};

// endregion
export const doesCidHasAccess = (cid: number, garageId: string) => {
  const garage = garages.get(garageId);
  if (!garage) return false;

  switch (garage.type) {
    case 'public':
      return true;
    case 'police':
      return Jobs.isCidWhitelisted(cid, 'police');
    case 'ambulance':
      return Jobs.isCidWhitelisted(cid, 'ambulance');
    case 'business':
      return Business.hasPlyPermission(garage.garage_id, cid, 'garage_access');
    default:
      return false;
  }
};
