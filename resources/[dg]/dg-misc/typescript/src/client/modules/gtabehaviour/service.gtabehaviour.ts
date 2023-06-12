import { Util } from '@dgx/client';
import {
  BLACKLISTED_SCENARIO_GROUPS,
  BLACKLISTED_SCENARIO_TYPES,
  DENSITY_SETTINGS,
  DISABLED_CONTROLS,
  HIDDEN_HUD_COMPONENT,
  PLAYER_RELATIONSHIP_HASH,
  RELATION_GROUPS,
} from './constants.gtabehaviour';
import { BLACKLISTED_VEHICLE_MODELS, BLACKLISTED_PED_MODELS } from '../../../shared/constants';

let cachedPed = 0;
let cachedId = 0;

let densitySettings: typeof DENSITY_SETTINGS = { ...DENSITY_SETTINGS };

let defaultReticleEnabled = false;
export const setDefaultReticleEnabled = (val: boolean) => {
  defaultReticleEnabled = val;
};

export const overrideDensitySettings = (settings: Partial<typeof DENSITY_SETTINGS>) => {
  densitySettings = { ...densitySettings, ...settings };
};

export const resetDensitySettings = () => {
  densitySettings = { ...DENSITY_SETTINGS };
};

export const setGTABehaviour = async () => {
  await Util.awaitCondition(() => NetworkIsSessionStarted(), 9999);

  cachedPed = PlayerPedId();
  cachedId = PlayerId();

  // Disable automatic camera movement when afk'ing
  DisableIdleCamera(true);

  // Initial state of radar is invisible
  DisplayRadar(false);

  // Relationships between groups
  RELATION_GROUPS.forEach(group => {
    SetRelationshipBetweenGroups(1, group, PLAYER_RELATIONSHIP_HASH);
  });

  // Relationship for insta attack peds
  const relationship = AddRelationshipGroup('ATTACK_ALL_PLAYERS')[1];
  SetRelationshipBetweenGroups(5, relationship, PLAYER_RELATIONSHIP_HASH);
  SetRelationshipBetweenGroups(5, PLAYER_RELATIONSHIP_HASH, relationship);

  // Disable dispatch services
  for (let id = 0; id <= 15; id++) {
    EnableDispatchService(id, false);
  }

  // Disable ammo pick ups
  SetPickupAmmoAmountScaler(0.0);

  // Max wanted level to 0
  SetMaxWantedLevel(0);

  // Shootyshooty
  NetworkSetFriendlyFireOption(true);

  // Disable scenarios
  BLACKLISTED_SCENARIO_GROUPS.forEach(group => {
    SetScenarioGroupEnabled(group, false);
  });
  BLACKLISTED_SCENARIO_TYPES.forEach(type => {
    SetScenarioGroupEnabled(type, false);
  });

  // Disable audio flags
  SetAudioFlag('PoliceScannerDisabled', true);
  DistantCopCarSirens(false);
  SetStaticEmitterEnabled('LOS_SANTOS_VANILLA_UNICORN_01_STAGE', false);
  SetStaticEmitterEnabled('LOS_SANTOS_VANILLA_UNICORN_02_MAIN_ROOM', false);
  SetStaticEmitterEnabled('LOS_SANTOS_VANILLA_UNICORN_03_BACK_ROOM', false);
  SetStaticEmitterEnabled('LOS_SANTOS_AMMUNATION_GUN_RANGE', false);

  // veh gens
  SetGarbageTrucks(false);
  SetCreateRandomCops(false);
  SetCreateRandomCopsNotOnScenarios(false);
  SetCreateRandomCopsOnScenarios(false);
  // SetAllLowPriorityVehicleGeneratorsActive(false);
  // RemoveVehiclesFromGeneratorsInArea(35.2, -1132.4, -253.5, 635.2, -1132.4, 346.5, 0); // central los santos medical center
  // RemoveVehiclesFromGeneratorsInArea(-58.2, -1487.9, -469.4, 941.8, -487.9, 530.6, 0); // police station mission row
  // RemoveVehiclesFromGeneratorsInArea(16.7, -892.3, 343.2, 616.7, -292.3, 343.2, 0); // pillbox
  // RemoveVehiclesFromGeneratorsInArea(-2650.4, 2575.9, -450.0, -1650.4, -2575.9, 532.8, 0); // military
  // RemoveVehiclesFromGeneratorsInArea(-1408.3, 4620.6, -82.8, -808.3, 5220.6, 517.2, 0); // nudist
  // RemoveVehiclesFromGeneratorsInArea(-858.2, 5719.8, -268.7, -158.2, 6319.8, 331.3, 0); // police station paleto
  // RemoveVehiclesFromGeneratorsInArea(2154.8, 3379.4, -268.7, 2154.8, 3979.4, 333.8, 0); // police station sandy
  // RemoveVehiclesFromGeneratorsInArea(-1024.4, -1744.0, -268.7, -424.46, -1144.0, 305.0, 0); // REMOVE CHOPPERS WOW
  // RemoveVehiclesFromGeneratorsInArea(-1273.15, 5919.85, -290.0, -1273.15, 6519.85, 304.62, 0);
  // RemoveVehiclesFromGeneratorsInArea(2781.76, -4470.42, -290.0, 3381.76, -4470.42, 315.26, 0); // Vliegdek schip

  // Suppress models
  BLACKLISTED_PED_MODELS.forEach(m => SetPedModelIsSuppressed(GetHashKey(m), true));
  BLACKLISTED_VEHICLE_MODELS.forEach(m => SetVehicleModelIsSuppressed(GetHashKey(m), true));

  SetWeaponsNoAutoswap(true);

  AddTextEntry('BLIP_OTHPLYR', 'Spelers');
  AddTextEntry('BLIP_PROPCAT', 'Politie');
  AddTextEntry('BLIP_APARTCAT', 'Ambulance');

  // EVERY FRAME LOOP
  setInterval(() => {
    // Perma disable controls
    DISABLED_CONTROLS.forEach(control => {
      DisableControlAction(0, control, true);
    });

    // Set density settings
    SetParkedVehicleDensityMultiplierThisFrame(densitySettings.parked);
    SetVehicleDensityMultiplierThisFrame(densitySettings.vehicle);
    SetRandomVehicleDensityMultiplierThisFrame(densitySettings.multiplier);
    SetPedDensityMultiplierThisFrame(densitySettings.peds);
    SetScenarioPedDensityMultiplierThisFrame(densitySettings.scenario, DENSITY_SETTINGS.scenario);

    // Hide hud components
    HIDDEN_HUD_COMPONENT.forEach(comp => {
      if (comp === 14 && defaultReticleEnabled) return;
      HideHudComponentThisFrame(comp);
    });

    // This one somehow needs to be set at interval
    SetPlayerHealthRechargeMultiplier(cachedId, 0.0);
  }, 1);
};

export const setCachedPed = (ped: number) => {
  cachedPed = ped;
};

export const setCachedId = (id: number) => {
  cachedId = id;
};
