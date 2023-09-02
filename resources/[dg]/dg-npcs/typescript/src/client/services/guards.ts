export const setupGuard = (ped: number, guardData: NPCs.Guard) => {
  SetPedRelationshipGroupHash(ped, GetHashKey('ATTACK_ALL_PLAYERS'));
  SetPedDropsWeaponsWhenDead(ped, false);
  StopPedWeaponFiringWhenDropped(ped);
  RemoveAllPedWeapons(ped, true);
  PlaceObjectOnGroundProperly(ped);

  // flags
  SetPedCombatAbility(ped, 2);
  SetPedCombatAttributes(ped, 46, true);
  SetPedCombatAttributes(ped, 5, true);
  SetPedCombatMovement(ped, guardData.combat?.movement ?? 2);
  SetPedCombatRange(ped, guardData.combat?.range ?? 2);

  if (guardData.weapon) {
    const weaponHash = typeof guardData.weapon === 'string' ? GetHashKey(guardData.weapon) : guardData.weapon;
    GiveWeaponToPed(ped, weaponHash, 9999, false, true);
    SetCurrentPedWeapon(ped, weaponHash, true);
  }

  if (guardData.criticalHits === false) {
    SetPedSuffersCriticalHits(ped, guardData.criticalHits ?? true);
    SetPedCanRagdollFromPlayerImpact(ped, false);
    SetRagdollBlockingFlags(ped, 1);
  }

  const doCombatTaskOnSpawn = guardData.doCombatTaskOnSpawn ?? true;
  if (doCombatTaskOnSpawn) {
    TaskCombatPed(ped, PlayerPedId(), 0, 16);
  }
};
