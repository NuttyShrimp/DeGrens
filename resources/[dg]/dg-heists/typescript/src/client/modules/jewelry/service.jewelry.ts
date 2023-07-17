import { Events, Notifications, Particles, PolyTarget, RPC, Sounds, Util } from '@dgx/client';
import { getCurrentLocation } from 'services/locations';
import { ALARM_NAME, VITRINE_MODEL_DATA } from './constants.jewelry';
import { Vector3 } from '@dgx/shared';

let vitrines: Jewelry.VitrineConfig[] = [];
let vitrinesBuilt = false;

let alarmTimeout: NodeJS.Timeout | null = null;

export const loadJewelryInitData = (data: Jewelry.InitData) => {
  vitrines = data.vitrines;

  if (getCurrentLocation() === 'jewelry') {
    buildVitrineZones();
  }

  toggleAlarm(data.alarmEnabled);
};

export const buildVitrineZones = () => {
  if (vitrinesBuilt) return;

  for (let i = 0; i < vitrines.length; i++) {
    const vitrine = vitrines[i];
    PolyTarget.addBoxZone('jewelry_vitrine', vitrine.coords, 0.65, 1.3, {
      heading: vitrine.coords.w,
      minZ: vitrine.coords.z + 0.1,
      maxZ: vitrine.coords.z + 0.7,
      data: {
        id: i,
      },
    });
  }
  vitrinesBuilt = true;
};

export const destroyVitrineZones = () => {
  if (!vitrinesBuilt) return;
  PolyTarget.removeZone('jewelry_vitrine');
  vitrinesBuilt = false;
};

export const lootVitrine = async (vitrineId: number) => {
  const canLoot = await RPC.execute<boolean>('heists:jewelry:startLootingVitrine', vitrineId);
  if (!canLoot) {
    Notifications.add('Dit is al leeggehaald', 'error');
    return;
  }

  const vitrine = vitrines[vitrineId];
  const vitrineModelData = VITRINE_MODEL_DATA[vitrine.modelIdx];
  if (!vitrineModelData || !vitrine) return;

  const interactCoords = getInteractPositionOfVitrine(vitrineId);
  await Util.goToCoords(interactCoords);

  await Util.loadAnimDict('missheist_jewel');
  const ped = PlayerPedId();
  const animDuration = GetAnimDuration('missheist_jewel', vitrineModelData.animName);

  TaskPlayAnim(ped, 'missheist_jewel', vitrineModelData.animName, 8.0, 1.0, -1, 0, 0, false, false, false);
  setTimeout(() => {
    ClearPedTasks(ped);
    Events.emitNet('heists:jewelry:finishLootingVitrine', vitrineId);
  }, animDuration * 1000 - 500);

  await Util.Delay(vitrineModelData.delay);

  const ptfxId = Particles.add({
    dict: 'scr_jewelheist',
    name: 'scr_jewel_cab_smash',
    coords: Vector3.create(vitrine.coords).add(vitrineModelData.particleOffset),
    looped: true,
  });
  setTimeout(() => {
    Particles.remove(ptfxId);
  }, 2000);
  Sounds.playLocalSound('breaking_vitrine_glass', 0.4);
  Events.emitNet('heists:jewelry:smashVitrine', vitrineId);
};

export const getInteractPositionOfVitrine = (vitrineId: number) => {
  const vitrineCoords = vitrines[vitrineId].coords;
  const interactCoords = Util.getOffsetFromCoords(vitrineCoords, { x: 0, y: 1, z: 0 });
  const heading = Util.getHeadingToFaceCoordsFromCoord(interactCoords, vitrineCoords);
  return { ...interactCoords, w: heading };
};

export const handleJewelryResourceStop = () => {
  toggleAlarm(false);
};

export const toggleAlarm = (toggle: boolean) => {
  if (alarmTimeout) {
    clearTimeout(alarmTimeout);
    alarmTimeout = null;
  }

  const isPlaying = IsAlarmPlaying(ALARM_NAME);
  if (toggle && !isPlaying) {
    PrepareAlarm(ALARM_NAME);
    StartAlarm(ALARM_NAME, false);

    // no native to check if alarm has been loaded, but prepare is async so we just retry
    alarmTimeout = setTimeout(() => {
      alarmTimeout = null;
      toggleAlarm(toggle);
    }, 100);
  } else if (!toggle && isPlaying) {
    StopAlarm(ALARM_NAME, true);
  }
};

export const setVitrineOverrideModel = (vitrineId: number, override: boolean) => {
  const vitrineData = VITRINE_MODEL_DATA[vitrines[vitrineId].modelIdx];
  if (!vitrineData) return;

  const vitrineCoords = vitrines[vitrineId].coords;
  const vitrineEntity = GetClosestObjectOfType(
    vitrineCoords.x,
    vitrineCoords.y,
    vitrineCoords.z,
    0.5,
    override ? vitrineData.start : vitrineData.end,
    false,
    false,
    false
  );
  if (!vitrineEntity || !DoesEntityExist(vitrineEntity)) return;

  const entityCoords = Util.getEntityCoords(vitrineEntity);
  if (override) {
    CreateModelSwap(entityCoords.x, entityCoords.y, entityCoords.z, 0.1, vitrineData.start, vitrineData.end, true);
  } else {
    RemoveModelSwap(entityCoords.x, entityCoords.y, entityCoords.z, 0.1, vitrineData.start, vitrineData.end, false);
  }
};

export const loadAllVitrineOverrides = async () => {
  const smashedVitrines = await RPC.execute<number[]>('heists:jewelry:getLootedVitrines');
  if (!smashedVitrines) return;

  for (const vitrineId of smashedVitrines) {
    setVitrineOverrideModel(vitrineId, true);
  }
};

export const restoreAllVitrineModels = () => {
  for (let i = 0; i < vitrines.length; i++) {
    setVitrineOverrideModel(i, false);
  }
};
