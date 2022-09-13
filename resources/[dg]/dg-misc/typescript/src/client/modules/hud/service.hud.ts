import { Events, HUD, RPC, Util } from '@dgx/client';

let config: HUD.Config;
let inWater = false;
export let stressLevel = 0;
let stressTimeout: NodeJS.Timeout | null;
let stressSteps: number;

export const loadConfig = async (tries = 0) => {
  if (tries >= 3) {
    throw new Error('[MISC] Failed to get hud config');
  }
  const newConfig = await RPC.execute<HUD.Config>('hud:server:getConfig');
  if (!newConfig) {
    loadConfig(++tries);
    return;
  }
  config = newConfig;
  stressLevel = DGCore.Functions.GetPlayerData().metadata.stress ?? 0;
  stressSteps = (config.shake.interval.max - config.shake.interval.min) / (100 - config.shake.minimum);
};

export const getCapacity = (ped: number, id: number) => {
  if (IsEntityInWater(ped) !== inWater) {
    inWater = IsEntityInWater(ped);
    HUD.toggleEntry('lung-capacity', inWater);
  }
  return inWater ? GetPlayerUnderwaterTimeRemaining(id) * 10 : 0;
};

export const updateStress = (amount: number) => {
  stressLevel = amount;
  HUD.toggleEntry('stress', stressLevel > 0);
  scheduleBlurEffect();
};

export const doSpeedStress = () => {
  const ped = PlayerPedId();
  if (!IsPedInAnyVehicle(ped, false)) return;
  const speed = GetEntitySpeed(GetVehiclePedIsIn(ped, false)) * 3.6;
  const stressSpeed = config.speed.minimum;
  // TODO: add check if ply has seatbelt on
  if (speed >= stressSpeed) {
    Events.emitNet('hud:server:GainStress', Util.getRndInteger(5, 21) / 10);
  }
};

const SKIPPED_WEAPONS = ['WEAPON_UNARMED', 'WEAPON_PETROLCAN', 'WEAPON_HAZARDCAN', 'WEAPON_FIREEXTINGUISHER'].map(w =>
  GetHashKey(w)
);

export const doWeaponStress = () => {
  const ped = PlayerPedId();
  const pedWeapon = GetSelectedPedWeapon(ped);
  if (
    IsPedShooting(ped) &&
    !SKIPPED_WEAPONS.includes(pedWeapon) &&
    Util.getRndInteger(0, 100) < config.shootingChance
  ) {
    console.log('gaiing stress');
    Events.emitNet('hud:server:GainStress', Util.getRndInteger(1, 4));
  }
};

export const scheduleBlurEffect = async () => {
  if (!config) {
    await Util.awaitCondition(() => config !== undefined);
  }
  console.log(stressLevel, config.shake.minimum);
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
  const length = (config.shake.maxLength / 100) * stressLevel;
  console.log('doing blur', length);
  TriggerScreenblurFadeIn(100);
  await Util.Delay(length + 100);
  TriggerScreenblurFadeOut(100);
  await Util.Delay(500);
};
