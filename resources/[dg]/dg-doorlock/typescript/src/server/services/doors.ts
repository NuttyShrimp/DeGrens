import { Events, Sounds, Util } from '@dgx/server';
import fs from 'fs';
import { mainLogger } from 'sv_logger';

let doorsLoaded = false;
const doors = new Map<number, Doorlock.DoorData>(); // After loading doors, this should NEVER change
const doorStates = new Map<number, boolean>(); // We keep state seperate to not constantly modify the doorconfigdata

export const areDoorsLoaded = () => doorsLoaded;

export const loadDoors = async () => {
  try {
    const root = GetResourcePath(GetCurrentResourceName());
    const data = fs.readFileSync(`${root}/seeding/doors.json`, 'utf-8');
    const doorsConfig: Doorlock.DoorConfig[] = JSON.parse(data);

    doorsConfig.forEach(doorConfig => {
      // First we generate a correct amount of ids for every model in this config
      // This way we can instantly give every door the correct linkedDoors
      const doorIds = [...new Array(doorConfig.doors.length)].map(() => generateDoorId());

      // For every doormodel per config we add a door to the map
      for (let i = 0; i < doorIds.length; i++) {
        const doorId = doorIds[i];
        const doorData = doorConfig.doors[i];

        doorStates.set(doorId, doorConfig.locked);
        doors.set(doorId, {
          model: GetHashKey(doorData.model),
          coords: doorData.coords,
          distance: doorConfig.distance ?? 2,
          authorized: doorConfig.authorized ?? [],
          name: doorConfig.name,
          polyzone: doorConfig.polyzone,
          playSound: doorConfig.playSound ?? false,
          hideInteraction: doorConfig.hideInteraction ?? false,
          noAnimation: doorConfig.noAnimation ?? false,
          forceOpen: doorConfig.forceOpen ?? false,
          allowThroughWalls: doorConfig.allowThroughWalls ?? false,
          lockpickable: doorConfig.lockpickable ?? false,
          thermiteable: doorConfig.thermiteable,
          linkedIds: [...doorIds], // This array includes all the ids of doors to change state (including itself)
        });
      }
    });

    mainLogger.info(`Loaded ${doors.size} doors`);
    doorsLoaded = true;
  } catch (e) {
    mainLogger.error(`An error occured while loading the doorconfig from the json: ${e}`);
  }
};

export const registerNewDoor = (newDoor: Doorlock.DoorConfig) => {
  const root = GetResourcePath(GetCurrentResourceName());
  const path = `${root}/seeding/doors.json`;
  const data = fs.readFileSync(path, 'utf-8');
  const config: Doorlock.DoorConfig[] = JSON.parse(data);
  config.push(newDoor);
  fs.writeFileSync(path, JSON.stringify(config, undefined, 2));
};

// We combine doors and doorstate into an object to send to client (evt data serialization fucks maps)
export const getAllDoors = (): Doorlock.ClientData => {
  const ids = Array.from(doorStates.keys());
  return ids.reduce<Record<string, Doorlock.DoorData & { locked: boolean }>>((all, id) => {
    const door = doors.get(id);
    const locked = doorStates.get(id);
    if (door === undefined || locked === undefined) return all;
    all[id] = { ...door, locked };
    return all;
  }, {});
};

export const changeDoorState = (doorId: number, state: boolean) => {
  const door = doors.get(doorId);
  if (!door) {
    mainLogger.error(`Tried to change doorstate of unknown door with id ${doorId} to ${state}`);
    return;
  }

  door.linkedIds.forEach(id => {
    doorStates.set(id, state);
    Events.emitNet('doorlock:client:changeDoorState', -1, id, state);
  });

  if (door.playSound) {
    const soundName = state ? 'Remote_Control_Close' : 'Remote_Control_Open';
    Sounds.playFromCoord(`door_lock_${doorId}`, soundName, 'PI_Menu_Sounds', door.coords, door.distance);
  }
};

export const getDoorIdByName = (doorName: string) => {
  for (const [id, data] of doors) {
    if (data.name !== doorName) continue;
    return id;
  }
};

export const getDoorById = (doorId: number) => doors.get(doorId);

const generateDoorId = () => {
  let newId = Util.getRndInteger(100000, 999999);
  while (doors.has(newId)) {
    newId = Util.getRndInteger(100000, 999999);
  }
  return newId;
};
