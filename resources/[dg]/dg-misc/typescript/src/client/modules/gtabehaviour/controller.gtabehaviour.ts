import { PED_CONFIG_FLAGS, PICKUP_HASHES, PLAYER_RELATIONSHIP_HASH } from './constants.gtabehaviour';

on('baseevents:playerPedChanged', () => {
  console.log('Player ped changed, reapplying config');
  const ped = PlayerPedId();

  SetEntityProofs(ped, false, false, false, false, false, true, false, false);
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

on('baseevents:playerIdChanged', () => {
  console.log('Player id changed, reapplying config');
  const id = PlayerId();

  SetPlayerHealthRechargeLimit(id, 0.0);
  PICKUP_HASHES.forEach(hash => ToggleUsePickupsForPlayer(id, hash, false));
  SetPlayerMaxArmour(id, 100);
});
