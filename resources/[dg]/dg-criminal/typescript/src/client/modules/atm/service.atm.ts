import { Events, Keys, Notifications, Particles, Police, Taskbar, UI, Util, Vehicles } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { REQUIRED_PULLS, REQUIRED_PULL_LENGTH, ROPE_LENGTH } from './constants.atm';
import { getBackCoordsOfEntity } from './helpers.atm';

let attachingAtm: number | null = null;

let whitelistedVehicleModels: number[] = [];

const activeRobberies: (Criminal.ATM.Robbery & {
  rope: number | null;
})[] = [];

let currentActiveRobberyVehicleNetId = 0;
let activeRobberyVehicleDriverThread: NodeJS.Timeout | null = null;

export const setWhitelistedAtmRobberyVehicleModels = (models: string[]) => {
  whitelistedVehicleModels = models.map(GetHashKey);
};

export const startAtmThread = () => {
  setInterval(() => {
    const plyCoords = Util.getPlyCoords();

    for (let i = 0; i < activeRobberies.length; i++) {
      const robbery = activeRobberies[i];
      if (!robbery) continue;

      const entities = getEntitiesForActiveRobbery(i, plyCoords);
      if (!entities) {
        if (robbery.rope !== null) {
          destroyRopeForActiveRobbery(i);
        }
        continue;
      }

      if (robbery.rope === null) {
        createRopeForActiveRobbery(i, entities.vehicle, entities.atm);
      }
    }
  }, 1000);
};

export const canDoAtmRobbery = (data?: { atm?: number; vehicle?: number }) => {
  if (!Police.canDoActivity('atm_robbery')) return false;

  const atmEntity = data?.atm ?? attachingAtm; // provided atm has prio

  // Validate if robbery can be done with provided ATM entity
  if (atmEntity) {
    if (NetworkGetEntityIsNetworked(atmEntity)) return false;
  }

  // Validate if robbery can be done with provided vehicle
  if (data?.vehicle) {
    if (whitelistedVehicleModels.indexOf(GetEntityModel(data.vehicle)) === -1) return false;
    if (!NetworkGetEntityIsNetworked(data.vehicle)) return false;
  }

  // Validate if both entities are close enough to each other
  if (atmEntity && data?.vehicle) {
    const vehicleBackCoords = getBackCoordsOfEntity(data.vehicle);
    const atmCoords = Util.getEntityCoords(atmEntity);
    if (vehicleBackCoords.distance(atmCoords) > ROPE_LENGTH - 1) return false;
  }

  return true;
};

export const isCurrentlyAttaching = () => attachingAtm !== null && DoesEntityExist(attachingAtm);

export const startAttaching = async (atm: number) => {
  if (!canDoAtmRobbery({ atm })) return;

  const coords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(atm, 0, -0.5, 0));
  const heading = Util.getHeadingToFaceCoordsFromCoord(coords, Util.getEntityCoords(atm));
  await Util.goToCoords({ ...coords, w: heading });

  Events.emitNet('criminal:atm:dispatch');

  const particleCoods = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(atm, 0.15, 0.1, 1.3));
  const particleRotation = Util.getEntityRotation(atm).add({ x: 90, y: 0, z: 0 });
  const particleId = Particles.add({
    dict: 'core',
    name: 'ent_amb_sparking_wires',
    coords: particleCoods,
    rotation: particleRotation,
    looped: true,
  });

  const [canceled] = await Taskbar.create('link', 'Vastmaken', Util.isDevEnv() ? 1000 : 60 * 1000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'anim@heists@fleeca_bank@drilling',
      anim: 'drill_straight_idle',
    },
    prop: 'big_drill',
  });

  Particles.remove(particleId);

  if (canceled) return;

  attachingAtm = atm;
  UI.showInteraction(`${Keys.getBindedKey('+cancelEmote')} - Loslaten`);
};

export const finishAttaching = async (vehicle: number) => {
  if (!canDoAtmRobbery({ vehicle })) return;
  if (!isCurrentlyAttaching()) return;

  const [canceled] = await Taskbar.create('link', 'Vastmaken', Util.isDevEnv() ? 1000 : 60 * 1000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
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

  UI.hideInteraction();

  const atmData: Criminal.ATM.AtmData = {
    coords: Util.getEntityCoords(attachingAtm!),
    rotation: Util.getEntityRotation(attachingAtm!),
    model: GetEntityModel(attachingAtm!),
  };
  const vehicleNetId = NetworkGetNetworkIdFromEntity(vehicle);

  Events.emitNet('criminal:atm:start', vehicleNetId, atmData);
};

export const stopAttaching = () => {
  attachingAtm = null;
  UI.hideInteraction();
};

const createRopeForActiveRobbery = (robberyIdx: number, vehicle: number, atm: number) => {
  if (!activeRobberies[robberyIdx]) return;

  const [atmDimensionMin, atmDimensionMax] = GetModelDimensions(GetEntityModel(atm));
  const atmHalfHeight = (atmDimensionMax[2] - atmDimensionMin[2]) / 2;
  const atmCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(atm, 0.0, 0.2, atmHalfHeight));

  const backCoords = getBackCoordsOfEntity(vehicle);

  RopeLoadTextures();
  const [rope] = AddRope(
    atmCoords.x,
    atmCoords.y,
    atmCoords.z,
    0.0,
    0.0,
    0.0,
    2,
    2,
    ROPE_LENGTH,
    1.0,
    5.0,
    true,
    true,
    true,
    1.0,
    false,
    0
  );
  LoadRopeData(rope, 'ropeFamily3');
  activeRobberies[robberyIdx].rope = rope;

  AttachEntitiesToRope(
    rope,
    atm,
    vehicle,
    atmCoords.x,
    atmCoords.y,
    atmCoords.z,
    backCoords.x,
    backCoords.y,
    backCoords.z,
    ROPE_LENGTH,
    true,
    true,
    //@ts-ignore
    null,
    null
  );
};

const destroyRopeForActiveRobbery = (robberyIdx: number) => {
  const rope = activeRobberies[robberyIdx]?.rope;
  if (!rope) return;

  const [ropeExists] = DoesRopeExist(rope);
  if (ropeExists) {
    DeleteRope(rope);
  }
  activeRobberies[robberyIdx].rope = null;
};

const getEntitiesForActiveRobbery = (robberyIdx: number, plyCoords: Vector3) => {
  const robbery = activeRobberies[robberyIdx];
  if (!robbery) return;

  if (plyCoords.distance(robbery.atmData.coords) > 100) return;

  if (!NetworkDoesEntityExistWithNetworkId(robbery.vehicleNetId)) return;
  const vehicle = NetworkGetEntityFromNetworkId(robbery.vehicleNetId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const atm = GetClosestObjectOfType(
    robbery.atmData.coords.x,
    robbery.atmData.coords.y,
    robbery.atmData.coords.z,
    1,
    robbery.atmData.model,
    false,
    false,
    false
  );
  if (!atm || !DoesEntityExist(atm)) return;

  return { atm: atm, vehicle };
};

export const destroyAllRopes = () => {
  for (const robbery of activeRobberies) {
    if (robbery.rope === null) continue;
    const [ropeExists] = DoesRopeExist(robbery.rope);
    if (!ropeExists) continue;
    DeleteRope(robbery.rope);
  }
};

export const registerActiveRobbery = (robbery: Criminal.ATM.Robbery) => {
  activeRobberies.push({ ...robbery, rope: null });

  // try starting driverthread if active got registered while ply is in active vehicle
  const currentVehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (currentVehicle && DoesEntityExist(currentVehicle)) {
    startActiveRobberyVehicleDriverThread(currentVehicle);
  }
};

export const unregisterActiveRobbery = (vehicleNetId: number) => {
  const robberyIdx = activeRobberies.findIndex(r => r.vehicleNetId === vehicleNetId);
  if (robberyIdx === -1) return;

  // clear thread if removing
  if (currentActiveRobberyVehicleNetId === vehicleNetId) {
    clearActiveRobberyVehicleDriverThread();
  }

  destroyRopeForActiveRobbery(robberyIdx);
  activeRobberies.splice(robberyIdx, 1);
};

export const startActiveRobberyVehicleDriverThread = (vehicle: number) => {
  if (activeRobberyVehicleDriverThread !== null) return;

  const netId = NetworkGetNetworkIdFromEntity(vehicle);
  const robberyIdx = activeRobberies.findIndex(r => r.vehicleNetId === netId);
  if (robberyIdx === -1) return;

  currentActiveRobberyVehicleNetId = netId;

  let speedBeforePulling = 0;
  let pullsDone = 0;
  let pullStartTime = 0;

  activeRobberyVehicleDriverThread = setInterval(() => {
    const rope = activeRobberies[robberyIdx]?.rope;
    if (!rope) return;
    const [ropeExists] = DoesRopeExist(rope);
    if (!ropeExists) return;

    const vehSpeed = Vehicles.getVehicleSpeed(vehicle);
    const ropeLength = RopeGetDistanceBetweenEnds(rope);
    if (ropeLength < ROPE_LENGTH * 0.9) {
      speedBeforePulling = vehSpeed;
      pullStartTime = 0;
      return;
    }

    const gameTime = GetGameTimer();

    if (pullStartTime === 0) {
      // dont count as a pull if vehicle is not accelerating or was going slow
      if (IsControlPressed(0, 71) && speedBeforePulling > 15) {
        pullStartTime = gameTime;
      }
    } else {
      // check if ply has been pulling for required time
      const timePulling = gameTime - pullStartTime;
      if (timePulling > REQUIRED_PULL_LENGTH) {
        pullStartTime = 0;
        pullsDone++;

        if (pullsDone >= REQUIRED_PULLS) {
          clearActiveRobberyVehicleDriverThread();
          Events.emitNet('criminal:atm:unattach', netId);
        } else {
          Notifications.add('Je hoort iets kraken aan de ATM!', 'success');
        }
      }
    }

    speedBeforePulling = 0;
  }, 250);
};

export const clearActiveRobberyVehicleDriverThread = () => {
  if (activeRobberyVehicleDriverThread === null) return;

  clearInterval(activeRobberyVehicleDriverThread);
  activeRobberyVehicleDriverThread = null;
  currentActiveRobberyVehicleNetId = 0;
};

export const pickupAtm = async (atmEntity: number) => {
  const [canceled] = await Taskbar.create('hand-holding', 'Opnemen', Util.isDevEnv() ? 1000 : 30 * 1000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
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

  if (!DoesEntityExist(atmEntity)) return;

  Events.emitNet('criminal:atm:pickup', NetworkGetNetworkIdFromEntity(atmEntity));
};
