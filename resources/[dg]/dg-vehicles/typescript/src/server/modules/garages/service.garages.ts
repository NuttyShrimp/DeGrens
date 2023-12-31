import { Business, Events, Gangs, Jobs, Notifications, UI, Util } from '@dgx/server';
import { VehicleStateTranslation } from 'helpers/enums';
import { getConfigByModel, getVehicleType } from 'modules/info/service.info';
import {
  getPlayerOwnedVehiclesAtGarage,
  getPlayerSharedVehicles,
  getPlayerVehicleInfo,
  hasVehicleMaintenanceFees,
  insertVehicleStatus,
  setVehicleGarage,
  setVehicleState,
} from '../../db/repository';
import { deleteVehicle, getVinForNetId, spawnOwnedVehicle } from '../../helpers/vehicle';
import { getCidFromVin } from '../identification/service.id';
import { getNativeStatus } from '../status/service.status';
import { GarageThread } from './classes/parkingSpotThread';
import { garageLogger } from './logger.garages';
import { addVehicleGarageLog, getVehicleGarageLog } from './services/logs.garages';
import vinManager from '../identification/classes/vinmanager';
import { fuelManager } from 'modules/fuel/classes/fuelManager';
import { getServiceStatus } from 'modules/status/services/store';

const garages: Map<string, Vehicles.Garages.Garage> = new Map();
const parkingSpotThreads: Map<number, GarageThread> = new Map();
let isLoaded = false;

// region Garage info
export const registerGarage = (garage: Vehicles.Garages.Garage) => {
  if (garages.has(garage.garage_id)) {
    garageLogger.error(`Garage ${garage.garage_id} already registered, overwriting`);
  }
  garages.set(garage.garage_id, garage);
  if (areGaragesLoaded()) {
    Events.emitNet('vehicles:garage:load', -1, garage);
  }
};

export const unregisterGarage = (garageId: string) => {
  if (!garages.has(garageId)) return;
  if (!garages.get(garageId)!.runtime) {
    garageLogger.error(`Failed to unregister garage ${garageId}, it is not a runtime garage`);
    return;
  }
  garages.delete(garageId);
  Events.emitNet('vehicles:garage:remove', -1, garageId);
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

export const getGarageById = (garageId: string): Vehicles.Garages.Garage | null => {
  return garages.get(garageId) || null;
};
export const getFirstGarageSpot = (garageId: string) => {
  const garage = garages.get(garageId);
  if (!garage) return null;
  return garage.parking_spots[0];
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
  if (!garageInfo?.garage_id || !doesCidHasAccess(Util.getCID(src), garageInfo.garage_id)) {
    return;
  }
  return garageInfo;
};

export const openThreadedGarage = async (src: number) => {
  const garageInfo = validateAccessToGarage(src);
  if (!garageInfo) return;

  const { garage_id, shared } = garageInfo;
  showPlayerGarage(src, garage_id, shared);
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
export const showPlayerGarage = async (src: number, garage_id: string, shared = false) => {
  const cid = Util.getCID(src);

  const personalSubmenu: ContextMenu.Entry[] = [];
  const personalVehicles = await getPlayerOwnedVehiclesAtGarage(cid, garage_id);
  for (const veh of personalVehicles) {
    const vehInfo = getConfigByModel(veh.model);
    const garageLogsEntries = await buildVehicleGarageLogMenuEntries(veh.vin);

    personalSubmenu.push({
      title: vehInfo?.name ?? '',
      description: `Plaat: ${veh.plate} | ${VehicleStateTranslation[veh.state]}`,
      submenu: [
        ...buildBaseGarageVehicleMenuEntry(veh),
        {
          title: 'Voertuig Garage log',
          submenu: garageLogsEntries,
        },
      ],
    });
  }

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Persoonlijk',
      id: 'personal',
      icon: 'car-garage',
      submenu: personalSubmenu,
    },
  ];

  if (!shared) {
    UI.openContextMenu(src, menu);
    return;
  }

  const sharedSubmenu: ContextMenu.Entry[] = [];
  const sharedVehicles = await getPlayerSharedVehicles(cid, garage_id);
  for (const veh of sharedVehicles) {
    const vehInfo = getConfigByModel(veh.model);
    const vehSubmenu: ContextMenu.Entry[] = buildBaseGarageVehicleMenuEntry(veh);

    // only if you are owner or if its owned by 1000, can you see logs in shared garage
    if (veh.cid === cid || veh.cid === 1000) {
      const garageLogsEntries = await buildVehicleGarageLogMenuEntries(veh.vin);
      vehSubmenu.push({
        title: 'Voertuig Garage log',
        submenu: garageLogsEntries,
      });
    }

    sharedSubmenu.push({
      title: vehInfo?.name ?? '',
      description: `NrPlaat: ${veh.plate} | ${VehicleStateTranslation[veh.state]}`,
      submenu: vehSubmenu,
    });
  }

  menu.push({
    title: 'Gedeeld',
    id: 'shared',
    icon: 'car-garage',
    submenu: sharedSubmenu,
  });

  UI.openContextMenu(src, menu);
};

export const takeVehicleOutGarage = async (src: number, vin: string, garageId: string): Promise<number | undefined> => {
  if (!garages.has(garageId)) return;

  const garageInfo = validateAccessToGarage(src);
  if (!garageInfo) return;
  const parkingSpot = parkingSpotThreads.get(src)?.getCurrentParkingSpot() ?? null;
  if (!parkingSpot) return;
  const garageDetails = garages.get(garageId)!;

  // Things to check
  // - Is vehicle in same garaga Id
  //   - If not and garage is shared, check if player has access to this garage
  // - Is vehicle is parked
  const cid = Util.getCID(src);
  const vehicleInfo = await getPlayerVehicleInfo(vin, {
    cid,
    garageId: garageDetails.garage_id,
    isSharedGarage: garageDetails.shared,
  });
  if (!vehicleInfo) {
    garageLogger.info(
      `${cid} tried to take vehicle ${vin} out of garage ${garageDetails.garage_id} but didn't met the requirements`
    );
    Util.Log(
      `vehicle:garage:retrieve:failed`,
      {
        vin,
        garageId: garageDetails.garage_id,
        isShared: garageDetails.shared,
      },
      `${cid} tried to retrieve vehicle ${vin} from garage ${garageDetails.name} but didn't met the requirements`,
      src
    );
    Notifications.add(src, 'Dat is precies niet mogelijk!', 'error');
    return;
  }

  await setVehicleState(vin, 'out');
  const hasMaintenanceFees = await hasVehicleMaintenanceFees(vehicleInfo.vin);
  if (hasMaintenanceFees) {
    Notifications.add(src, 'Je moet eerst je maintenance fees betalen!', 'error');
    await setVehicleState(vin, 'parked');
    return;
  }

  const veh = await spawnOwnedVehicle(src, vehicleInfo, {
    ...parkingSpot.coords,
    z: parkingSpot.coords.z + 0.5,
    w: parkingSpot.heading,
  });
  if (!veh) {
    await setVehicleState(vin, 'parked');
    return;
  }

  const serviceStatus = await getServiceStatus(vin);
  addVehicleGarageLog(vin, cid, false, vehicleInfo.status.fuel, serviceStatus);
  Util.Log(
    'vehicle:garage:retrieve:success',
    {
      vin,
      netId: NetworkGetNetworkIdFromEntity(veh),
      garageId: garageDetails.garage_id,
      isShared: garageDetails.shared,
    },
    `${cid} has successfully retrieved vehicle with vin ${vin} from the garage with id ${garageDetails.garage_id}`,
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
  const cid = Util.getCID(src);
  const vin = getVinForNetId(NetworkGetNetworkIdFromEntity(entity));
  if (!vin) {
    garageLogger.warn(`Could not find vin for vehicle ${entity}`);
    return;
  }
  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) {
    Notifications.add(src, 'Je kunt dit voertuig hier niet parkeren', 'error');
    return;
  }
  if (!shared && cid !== vehicleInfo.cid) {
    garageLogger.silly(`Cannot store other peoples car in public garage`);
    Notifications.add(src, 'Enkel de eigenaar kan het voertuig in deze garage plaatsen', 'error');
    return;
  }
  if (!doesCidHasAccess(vehicleInfo.cid, garage_id)) {
    garageLogger.silly(`Player does not have access to garage`);
    Notifications.add(src, 'De eigenaar van dit voertuig heeft geen toegang tot deze garage', 'error');
    return;
  }
  // Save state
  const vehState = await getNativeStatus(entity, vin);
  await insertVehicleStatus(vin, vehState);

  // get fuel before deleting vehicle
  const fuelLevel = fuelManager.getFuelLevel(entity);

  // Delete vehicle
  deleteVehicle(entity);

  // Set vehicle as parked
  await setVehicleState(vin, 'parked');
  await setVehicleGarage(vin, garage_id);

  // get values needed to insert garage log
  const serviceStatus = await getServiceStatus(vin);
  addVehicleGarageLog(vin, cid, true, fuelLevel, serviceStatus);

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
  const garage = getGarageById(garageId);
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
    case 'gang':
      return Gangs.getPlayerGangName(cid) === garage.garage_id;
    case 'house':
      return global.exports['dg-real-estate'].playerHasAccess(cid, garage.garage_id);
    default:
      return false;
  }
};

const buildBaseGarageVehicleMenuEntry = (veh: Vehicle.Vehicle): ContextMenu.Entry[] => {
  return [
    {
      title: veh.state === 'parked' ? 'Neem voertuig uit garage' : 'Voertuig staat niet hier',
      callbackURL: veh.state === 'parked' ? 'vehicles:garage:takeVehicle' : 'vehicles:garage:tryToRecover',
      data: {
        vin: veh.vin,
        garageId: veh.garageId,
      },
    },
    {
      title: 'Voertuig Status',
      description: `${VehicleStateTranslation[veh.state]} | Engine: ${Math.round(
        (veh.status?.engine ?? 1000) / 10
      )}% | Body: ${Math.round((veh.status?.body ?? 1000) / 10)}%`,
    },
  ];
};

const buildVehicleGarageLogMenuEntries = async (vin: string): Promise<ContextMenu.Entry[]> => {
  const logs = await getVehicleGarageLog(vin);
  return logs.map(log => ({
    title: `${log.cid} heeft het voertuig ${log.action === 'parked' ? 'geparkeerd' : 'uitgehaald'}`,
    description: log.state,
  }));
};

// This function puts back a vehicle into a garage when it is currently out but not existing OR in a garage the player has no access to
export const recoverVehicle = async (plyId: number, vin: string) => {
  if (!vinManager.doesVinExist(vin) || !vinManager.isVinFromPlayerVeh(vin)) return;

  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) return;

  const cid = Util.getCID(plyId);
  if (vehicleInfo.state === 'parked' && !doesCidHasAccess(cid, vehicleInfo.garageId)) {
    // vehicle is in inaccessible (invalid) garage so move to alta
    setVehicleGarage(vin, 'alta_apartments');
    Notifications.add(plyId, 'Het voertuig is teruggezet aan Alta Apartments', 'success');

    Util.Log(
      'vehicles:garage:recover',
      {
        vin,
        garageId: vehicleInfo.garageId,
      },
      `${Util.getName(plyId)}(${plyId}) has recovered inaccessible vehicle (${vin})`,
      plyId
    );
  } else if (vehicleInfo.state === 'out') {
    if (vehicleInfo.vinscratched) {
      Notifications.add(plyId, 'Dit voertuig was niet verzekerd...', 'error');
      return;
    }

    // vehicle is out but entity does not exist so mark as parked
    const netId = vinManager.getNetId(vin);
    if (netId) {
      Notifications.add(plyId, 'Je voertuig staat nog ergens uit. Probeer het te tracken', 'error');
      return;
    }

    setVehicleState(vin, 'parked');
    Notifications.add(plyId, 'Je voertuig staat terug in de garage', 'success');

    Util.Log(
      'vehicles:garage:recover',
      {
        vin,
      },
      `${Util.getName(plyId)}(${plyId}) has recovered nonexistent vehicle (${vin})`,
      plyId
    );
  }
};
