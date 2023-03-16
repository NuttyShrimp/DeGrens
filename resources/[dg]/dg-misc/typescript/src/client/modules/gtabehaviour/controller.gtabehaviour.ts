import { BaseEvents } from '@dgx/client';
import { PED_CONFIG_FLAGS, PICKUP_HASHES, PLAYER_RELATIONSHIP_HASH } from './constants.gtabehaviour';
import { overrideDensitySettings, resetDensitySettings, setDefaultReticleEnabled } from './service.gtabehaviour';

BaseEvents.onPedChange(() => {
  const ped = PlayerPedId();

  SetPedMinGroundTimeForStungun(ped, 5000);
  SetPedCanLosePropsOnDamage(ped, false, 0);
  SetPedMaxHealth(ped, 200);
  SetEntityHealth(ped, 200);
  SetPedDropsWeaponsWhenDead(ped, false);
  PED_CONFIG_FLAGS.forEach(([flag, val]) => {
    SetPedConfigFlag(ped, flag, val);
  });
  SetPedRelationshipGroupHash(ped, PLAYER_RELATIONSHIP_HASH);
  SetCanAttackFriendly(ped, true, false);
});

BaseEvents.onIdChange(() => {
  const id = PlayerId();

  SetPlayerHealthRechargeLimit(id, 0.0);
  PICKUP_HASHES.forEach(hash => ToggleUsePickupsForPlayer(id, hash, false));
  SetPlayerMaxArmour(id, 100);
  SetAutoGiveParachuteWhenEnterPlane(id, false);
  SetAutoGiveScubaGearWhenExitVehicle(id, false);
});

global.exports('setDefaultReticleEnabled', setDefaultReticleEnabled);
global.exports('overrideDensitySettings', overrideDensitySettings);
global.exports('resetDensitySettings', resetDensitySettings);
