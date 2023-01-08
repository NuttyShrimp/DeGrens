import { Events, Keys, Util, Inventory, Police, Weapons, RPC, Jobs } from '@dgx/client';
import { setBleedAmount, setHealth } from 'modules/health/service.health';
import { ENABLED_CONTROLS, DOWN_ANIMATIONS } from './constants.down';
import { doGetUpAnimation, getWeightOfState, resetPedFlagsAfterDown, setPedFlagsOnDown, setText } from './helpers.down';

let playerState: Hospital.State = 'alive';
let downThread: NodeJS.Timer | null = null;

let respawnTime = 0;
let respawnButtonPressTime: number | null = null;

let pauseDownAnimation = false;
let awaitingRagdollFinish = false;

let respawnTimeConfig: Hospital.Config['health']['respawnTime'];
let damageTypesConfig: Record<number, { cause: string; type: Hospital.DownType }> = {};

export const setDownConfig = (resConfig: typeof respawnTimeConfig, weapons: Hospital.Config['damagetypes']) => {
  respawnTimeConfig = resConfig;

  for (const [name, data] of Object.entries(weapons)) {
    damageTypesConfig[GetHashKey(name)] = { cause: name, type: data.downType };
  }
};

export const setPauseDownAnimation = (pause: boolean) => {
  pauseDownAnimation = pause;
};

export const getPlayerState = () => playerState;
export const setPlayerState = (state: Hospital.State, save = true) => {
  playerState = state;
  if (save) {
    Events.emitNet('hospital:down:changeState', playerState);
  }

  if (state === 'alive') {
    cleanDownThread();
    setPauseDownAnimation(false);
    Police.pauseCuffAnimation(false);
  } else {
    startDownThread();
    Inventory.close();
    Weapons.removeWeapon(undefined, true);
    Police.pauseCuffAnimation(true);
  }
};

export const loadDownStateOnRestart = () => {
  const state = DGCore.Functions.GetPlayerData()?.metadata?.downState;
  if (!state) return;
  setPlayerState(state, false);
};

export const resetRespawnTime = () => {
  if (playerState === 'alive') {
    respawnTime = 0;
    return;
  }

  respawnTime = GetGameTimer() + respawnTimeConfig[playerState] * 1000;
};

export const checkDeathOnDamage = (originPed: number, weaponHash: number) => {
  if (awaitingRagdollFinish) return;

  const ped = PlayerPedId();
  const isInjured = IsPedInjured(ped);
  if (!isInjured) return;

  // stupid edgecase...
  // we want ejections from vehicle to always be unconscious to improve gameplay
  // most of the time hash is 'WEAPON_RUN_OVER_BY_CAR' or 'WEAPON_RAMMED_BY_CAR' but can also 'WEAPON_FALL' in rare cases
  if (weaponHash === GetHashKey('WEAPON_FALL') && global.exports['dg-vehicles'].justEjected()) {
    weaponHash = GetHashKey('WEAPON_RAMMED_BY_CAR');
  }

  const damageTypeData = damageTypesConfig[weaponHash] ?? { cause: 'UNKNOWN', type: 'unconscious' };

  // Check if new state is more important than state player is already in
  const downType = damageTypeData.type;
  const weight = getWeightOfState(downType);
  const currentWeight = getWeightOfState(playerState);
  if (currentWeight >= weight) return;

  const origin = Util.getServerIdForPed(originPed);
  Events.emitNet('hospital:down:playerDied', damageTypeData.cause, origin);

  // Clear bleed on death, otherwise anim would get spam canceled because of bleed damage
  setHealth(1);
  setBleedAmount(0);

  // Resurrect and set health when stopped ragdolling
  awaitingRagdollFinish = true;
  Util.awaitCondition(() => !IsPedRagdoll(ped)).then(() => {
    const coords = Util.getPlyCoords();
    const heading = GetEntityHeading(ped);
    const vehData = Util.getCurrentVehicleInfo(); // resurrect tps ped out of veh
    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, heading, true, false);
    setPedFlagsOnDown();
    if (vehData) {
      SetPedIntoVehicle(ped, vehData.vehicle, vehData.seat);
    }
    awaitingRagdollFinish = false;
  });

  setPlayerState(downType);
};

const startDownThread = async () => {
  resetRespawnTime();

  if (downThread !== null || playerState === 'alive') return;

  for (const { animDict } of Object.values(DOWN_ANIMATIONS)) {
    await Util.loadAnimDict(animDict);
  }

  downThread = setInterval(() => {
    if (playerState === 'alive') return;

    if (!awaitingRagdollFinish && !pauseDownAnimation) {
      const ped = PlayerPedId();
      const inVehicle = IsPedInAnyVehicle(ped, false);
      const { animDict, anim, flag } = DOWN_ANIMATIONS[inVehicle ? 'vehicle' : playerState];

      if (!IsEntityPlayingAnim(ped, animDict, anim, 3)) {
        ClearPedTasksImmediately(ped);
        TaskPlayAnim(ped, animDict, anim, 128, 128, -1, flag, 0, false, false, false);
      }
    }

    // Disable keys
    DisableAllControlActions(0);
    ENABLED_CONTROLS.forEach(key => EnableControlAction(0, key, true));

    const currentTime = GetGameTimer();
    const timeRemaining = Math.max(respawnTime - currentTime, 0);
    const canRespawn = timeRemaining === 0;

    // If you pressed button but cannot respawn yet, then act like you released it again
    if (!canRespawn && respawnButtonPressTime !== null) {
      respawnButtonReleased();
    }

    // Draw UI text
    let pressTimeRemaining = 5;
    if (respawnButtonPressTime !== null) {
      pressTimeRemaining = Math.ceil(Math.max(5000 + respawnButtonPressTime - currentTime, 0) / 1000);
    }
    const isDead = playerState === 'dead';
    const primaryText = isDead ? 'Je bent neer' : 'Je bent bewusteloos';
    let secondaryText: string;
    if (canRespawn) {
      const key = Keys.getBindedKey('+GeneralUse');
      secondaryText = `${key} - ${pressTimeRemaining} Seconden${isDead ? ' (of wacht op hulp)' : ''}`;
    } else {
      secondaryText = `Nog ${Math.ceil(timeRemaining / 1000)} seconden`;
    }
    setText(primaryText, secondaryText, canRespawn ? 'green' : 'red');

    // Handle respawn when press
    if (pressTimeRemaining === 0) {
      respawnButtonPressTime = null;
      respawnPlayer();
    }
  }, 1);
};

const cleanDownThread = () => {
  if (downThread === null) return;
  clearInterval(downThread);
  downThread = null;
  Object.values(DOWN_ANIMATIONS).forEach(({ animDict }) => RemoveAnimDict(animDict));
  resetPedFlagsAfterDown();
};

export const doNormalRevive = async () => {
  if (playerState === 'alive') return;

  const previousState = playerState;
  setPlayerState('alive');

  if (previousState === 'unconscious') {
    setHealth(25);
  } else {
    setHealth(100);
  }

  const ped = PlayerPedId();
  if (previousState === 'unconscious' && !IsPedInAnyVehicle(ped, false)) {
    setPauseDownAnimation(true);
    await doGetUpAnimation();
    setPauseDownAnimation(false);
  } else {
    ClearPedTasks(ped);
  }
};

export const respawnButtonPressed = () => {
  respawnButtonPressTime = GetGameTimer();
};
export const respawnButtonReleased = () => {
  respawnButtonPressTime = null;
};

const respawnPlayer = async () => {
  // If unconsious just revive
  if (playerState === 'unconscious') {
    doNormalRevive();
    return;
  }

  const respawnPosition = await RPC.execute<Vec3>('hospital:down:getRespawnPosition');
  if (!respawnPosition) return;

  const ped = PlayerPedId();
  const isNearRespawn = Util.getPlyCoords().distance(respawnPosition) < 3;
  const isInWater = IsEntityInWater(ped);
  const anyAmbuOnline = Jobs.getAmountForJob('ambulance') > 0;
  if (isNearRespawn || isInWater || !anyAmbuOnline) {
    setPauseDownAnimation(true);
    Events.emitNet('hospital:down:respawnToBed');
  } else {
    SetEntityCoords(ped, respawnPosition.x, respawnPosition.y, respawnPosition.z, false, false, false, false);
    resetRespawnTime();
    Events.emitNet('hospital:down:respawnToHospital');
  }
};