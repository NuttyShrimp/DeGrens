import { Events, HUD, Util } from '@dgx/client';

let config: HUD.Config | null = null;
let isDiving = false;
let stressLevel = 0;
let stressTimeout: NodeJS.Timeout | null;
let stressSteps: number;

export const setConfig = (newConfig: HUD.Config) => {
  config = newConfig;
  stressSteps = (newConfig.shake.interval.max - newConfig.shake.interval.min) / (100 - newConfig.shake.minimum);
};

export const getStressLevel = () => stressLevel;

export const setIsDiving = (diving: boolean) => {
  isDiving = diving;
  HUD.toggleEntry('lung-capacity', isDiving);
};

export const getCapacity = (ped: number, id: number) => {
  if (!isDiving) return 0;
  return GetPlayerUnderwaterTimeRemaining(id) * 10;
};

export const updateStress = (amount: number) => {
  stressLevel = amount;
  HUD.toggleEntry('stress', stressLevel > 0);
  scheduleBlurEffect();
};

export const doSpeedStress = () => {
  if (!config) return;
  const ped = PlayerPedId();
  if (!IsPedInAnyVehicle(ped, false)) return;
  const speed = GetEntitySpeed(GetVehiclePedIsIn(ped, false)) * 3.6;
  const stressSpeed = config.speed.minimum;
  const isSeatbeltOn = global.exports['dg-vehicles'].isSeatbeltOn();
  if (speed >= (stressSpeed * isSeatbeltOn ? 1.3 : 1)) {
    Events.emitNet('hud:server:GainStress', Util.getRndInteger(1, 6) / 10);
  }
};

const SKIPPED_WEAPONS = ['WEAPON_UNARMED', 'WEAPON_PETROLCAN', 'WEAPON_HAZARDCAN', 'WEAPON_FIREEXTINGUISHER'].map(
  w => GetHashKey(w) >>> 0
);

export const doWeaponStress = () => {
  if (!config) return;
  const ped = PlayerPedId();
  const pedWeapon = GetSelectedPedWeapon(ped) >>> 0;
  if (
    IsPedShooting(ped) &&
    !SKIPPED_WEAPONS.includes(pedWeapon) &&
    Util.getRndInteger(0, 100) < config.shootingChance
  ) {
    Events.emitNet('hud:server:GainStress', Util.getRndInteger(3, 21) / 10);
  }
};

export const scheduleBlurEffect = async () => {
  if (!config) return;
  if (stressLevel < config.shake.minimum) return;
  if (stressTimeout) return;
  const timeout = config.shake.interval.max - stressSteps * (stressLevel - config.shake.minimum);
  const blurAmount = Math.ceil((config.shake.maxAmount / 100) * stressLevel);
  for (let i = 0; i < blurAmount; i++) {
    await doBlurEffect();
  }
  stressTimeout = setTimeout(() => {
    stressTimeout = null;
    scheduleBlurEffect();
  }, timeout);
};

const doBlurEffect = async () => {
  if (!config) return;
  const length = (config.shake.maxLength / 100) * stressLevel;
  TriggerScreenblurFadeIn(250);
  await Util.Delay(length + 100);
  TriggerScreenblurFadeOut(250);
  await Util.Delay(500);
};
