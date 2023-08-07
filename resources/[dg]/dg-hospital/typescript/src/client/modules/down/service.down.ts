import { Core, Events, Keys, Util, Inventory, Police, Weapons, RPC, Jobs, Animations, Vehicles } from '@dgx/client';
import { setBleedAmount, setHealth } from 'modules/health/service.health';
import { ENABLED_CONTROLS, DOWN_ANIMATIONS, NO_TP_VEHICLE_CLASSES } from './constants.down';
import { doGetUpAnimation, getWeightOfState, resetPedFlagsAfterDown, setPedFlagsOnDown, setText } from './helpers.down';

let playerState: Hospital.State = 'alive';
let downThread: NodeJS.Timer | null = null;

let respawnTime = 0;
let respawnButtonPressTime: number | null = null;

let resurrectingPlayer = false;
let downAnimLoopId: number | null = null;

let respawnTimeConfig: Hospital.Config['health']['respawnTime'];
let damageTypesConfig: Record<number, { cause: string; type: Hospital.DownType }> = {};

let charModule = Core.getModule('characters');

export const setDownConfig = (resConfig: typeof respawnTimeConfig, weapons: Hospital.Config['damagetypes']) => {
  respawnTimeConfig = resConfig;

  for (const [name, data] of Object.entries(weapons)) {
    damageTypesConfig[GetHashKey(name) >>> 0] = { cause: name, type: data.downType };
  }
};
export const getPlayerState = () => playerState;
export const setPlayerState = (state: Hospital.State, save = true) => {
  playerState = state;
  if (save) {
    Events.emitNet('hospital:down:changeState', playerState);
  }

  if (state === 'alive') {
    cleanDownThread();
  } else {
    startDownThread();
    updateRespawnTime();
    Inventory.close();
    Weapons.removeWeapon(undefined, true);
  }

  handleDownAnimLoop();
};

export const loadDownStateOnRestart = () => {
  const state = charModule.getMetadata()?.downState;
  if (!state) return;
  setPlayerState(state, false);
};

const updateRespawnTime = (overrideAmount?: number) => {
  if (playerState === 'alive') {
    respawnTime = 0;
    return;
  }

  respawnTime = GetGameTimer() + (overrideAmount ?? respawnTimeConfig[playerState]) * 1000;
};

export const checkDeathOnDamage = (originPed: number, weaponHash: number) => {
  if (resurrectingPlayer) return;

  const ped = PlayerPedId();
  const isInjured = IsPedInjured(ped);
  if (!isInjured) return;

  // do reviving/health/bleed settings when dead
  resurrectWhenRagdollFinished();
  setHealth(1);
  setBleedAmount(0);

  // stupid edgecase...
  // we want ejections from vehicle to always be unconscious to improve gameplay
  // most of the time hash is 'WEAPON_RUN_OVER_BY_CAR' or 'WEAPON_RAMMED_BY_CAR' but can also be 'WEAPON_FALL' in rare cases
  if (weaponHash === GetHashKey('WEAPON_FALL') >>> 0 && global.exports['dg-vehicles'].justEjected()) {
    weaponHash = GetHashKey('WEAPON_RAMMED_BY_CAR');
  }
  weaponHash = weaponHash >>> 0;

  const damageTypeData = damageTypesConfig[weaponHash] ?? { cause: 'UNKNOWN', type: 'unconscious' };

  // Check if new state is more important than state player is already in
  const downType = damageTypeData.type;
  const weight = getWeightOfState(downType);
  const currentWeight = getWeightOfState(playerState);

  if (currentWeight >= weight) return;

  const origin = Util.getServerIdForPed(originPed);
  Events.emitNet('hospital:down:playerDied', damageTypeData.cause, origin);
  setPlayerState(downType);
};

// We do resurrect when we stopped ragdolling
const resurrectWhenRagdollFinished = async () => {
  const ped = PlayerPedId();
  resurrectingPlayer = true;
  Animations.pauseAnimLoopAnimations(true);

  // First we wait till player starts ragdolling with timeout of 1 sec
  await Util.awaitCondition(() => IsPedRagdoll(ped), 1000);

  // then we wait till players stops with timeout of 5 sec
  await Util.awaitCondition(() => !IsPedRagdoll(ped), 5000);

  const coords = Util.getEntityCoords(ped);
  const heading = GetEntityHeading(ped);
  const vehData = Vehicles.getCurrentVehicleInfo(); // resurrect tps ped out of veh
  NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, heading, false, false);
  setPedFlagsOnDown();
  if (vehData && !NO_TP_VEHICLE_CLASSES.includes(vehData.class)) {
    SetPedIntoVehicle(ped, vehData.vehicle, vehData.seat);
  }

  resurrectingPlayer = false;
  Animations.pauseAnimLoopAnimations(false);
};

const startDownThread = () => {
  if (downThread !== null || playerState === 'alive') return;

  downThread = setInterval(() => {
    if (playerState === 'alive') return;

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

  await Police.forceStopInteractions();

  const ped = PlayerPedId();
  if (previousState === 'unconscious' && !IsPedInAnyVehicle(ped, false)) {
    // pause animloops to allow proper standup anim
    Animations.pauseAnimLoopAnimations(true);
    await doGetUpAnimation();
    Animations.pauseAnimLoopAnimations(false);
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
  if (playerState === 'alive') return;

  // If unconsious just revive
  if (playerState === 'unconscious') {
    doNormalRevive();
    return;
  }

  const respawnPosition = await RPC.execute<Vec3>('hospital:down:getRespawnPosition');
  if (!respawnPosition) return;

  const ped = PlayerPedId();
  if (
    Util.getPlyCoords().distance(respawnPosition) < 3 ||
    IsEntityInWater(ped) ||
    Jobs.getAmountForJob('ambulance') === (Jobs.getCurrentJob()?.name === 'ambulance' ? 1 : 0)
  ) {
    Events.emitNet('hospital:down:respawnToBed');
    return;
  }

  SetEntityCoords(ped, respawnPosition.x, respawnPosition.y, respawnPosition.z, false, false, false, false);
  updateRespawnTime(60);
  Events.emitNet('hospital:down:respawnToHospital');
};

export const loadPedFlags = () => {
  if (getPlayerState() === 'alive') {
    resetPedFlagsAfterDown();
  } else {
    setPedFlagsOnDown();
  }
};

export const handleDownAnimLoop = () => {
  if (playerState === 'alive') {
    if (downAnimLoopId !== null) {
      Animations.stopAnimLoop(downAnimLoopId);
      downAnimLoopId = null;
    }
    return;
  }

  const ped = PlayerPedId();
  const inVehicle = IsPedInAnyVehicle(ped, false);
  const { animDict, anim, flag } = DOWN_ANIMATIONS[inVehicle ? 'vehicle' : playerState];

  const animLoop: AnimLoops.Anim = {
    animation: {
      dict: animDict,
      name: anim,
      flag,
    },
    weight: 75,
    disableAllControls: true,
    enabledControls: ENABLED_CONTROLS,
  };

  if (downAnimLoopId === null) {
    downAnimLoopId = Animations.startAnimLoop(animLoop);
  } else {
    Animations.modifyAnimLoop(downAnimLoopId, animLoop);
  }
};
