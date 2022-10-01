import { Util } from '@dgx/shared';
import {
  BLACKLISTED_SCENARIO_GROUPS,
  BLACKLISTED_SCENARIO_TYPES,
  DENSITY_SETTINGS,
  DISABLED_CONTROLS,
  HIDDEN_HUD_COMPONENT,
  RELATION_GROUPS,
} from './constants.gtabehaviour';

export const setGTABehaviour = async () => {
  await Util.awaitCondition(() => NetworkIsSessionStarted());

  // Disable automatic camera movement when afk'ing
  DisableIdleCamera(true);

  // Relationships between groups
  const playerHash = GetHashKey('PLAYER');
  RELATION_GROUPS.forEach(group => {
    SetRelationshipBetweenGroups(1, group, playerHash);
  });

  // Disable dispatch services
  for (let id = 1; id <= 15; id++) {
    EnableDispatchService(id, false);
  }

  // Max wanted level to 0
  SetMaxWantedLevel(0);

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
  SetAllLowPriorityVehicleGeneratorsActive(false);
  RemoveVehiclesFromGeneratorsInArea(35.2, -1132.4, -253.5, 635.2, -1132.4, 346.5, 0); // central los santos medical center
  RemoveVehiclesFromGeneratorsInArea(-58.2, -1487.9, -469.4, 941.8, -487.9, 530.6, 0); // police station mission row
  RemoveVehiclesFromGeneratorsInArea(16.7, -892.3, 343.2, 616.7, -292.3, 343.2, 0); // pillbox
  RemoveVehiclesFromGeneratorsInArea(-2650.4, 2575.9, -450.0, -1650.4, -2575.9, 532.8, 0); // military
  RemoveVehiclesFromGeneratorsInArea(-1408.3, 4620.6, -82.8, -808.3, 5220.6, 517.2, 0); // nudist
  RemoveVehiclesFromGeneratorsInArea(-858.2, 5719.8, -268.7, -158.2, 6319.8, 331.3, 0); // police station paleto
  RemoveVehiclesFromGeneratorsInArea(2154.8, 3379.4, -268.7, 2154.8, 3979.4, 333.8, 0); // police station sandy
  RemoveVehiclesFromGeneratorsInArea(-1024.4, -1744.0, -268.7, -424.46, -1144.0, 305.0, 0); // REMOVE CHOPPERS WOW
  RemoveVehiclesFromGeneratorsInArea(-1273.15, 5919.85, -290.0, -1273.15, 6519.85, 304.62, 0);
  RemoveVehiclesFromGeneratorsInArea(2781.76, -4470.42, -290.0, 3381.76, -4470.42, 315.26, 0); // Vliegdek schip

  // EVERY FRAME LOOP
  setInterval(() => {
    // Perma disable controls
    DISABLED_CONTROLS.forEach(control => {
      DisableControlAction(0, control, true);
    });

    // Set density settings
    SetParkedVehicleDensityMultiplierThisFrame(DENSITY_SETTINGS.parked);
    SetVehicleDensityMultiplierThisFrame(DENSITY_SETTINGS.vehicle);
    SetRandomVehicleDensityMultiplierThisFrame(DENSITY_SETTINGS.multiplier);
    SetPedDensityMultiplierThisFrame(DENSITY_SETTINGS.peds);
    SetScenarioPedDensityMultiplierThisFrame(DENSITY_SETTINGS.scenario, 0);

    // Hide hud components
    HIDDEN_HUD_COMPONENT.forEach(comp => {
      HideHudComponentThisFrame(comp);
    });
  }, 3);
};