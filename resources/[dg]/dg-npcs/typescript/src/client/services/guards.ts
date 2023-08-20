import { Events, Sync } from '@dgx/client';

export const setupGuard = (ped: number, guardId: string, guardData: NPCs.Guard) => {
  SetPedRelationshipGroupHash(ped, GetHashKey('ATTACK_ALL_PLAYERS'));
  SetPedDropsWeaponsWhenDead(ped, false);
  StopPedWeaponFiringWhenDropped(ped);
  RemoveAllPedWeapons(ped, true);

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

  TaskCombatPed(ped, PlayerPedId(), 0, 16);

  startDeathCheck(ped, guardId);
};

export const startDeathCheck = (ped: number, guardId: string) => {
  const deathThread = setInterval(() => {
    if (!DoesEntityExist(ped)) {
      Events.emitNet('npcs:guards:transferDeathCheck', guardId);
      clearInterval(deathThread);
    }

    if (IsPedInjured(ped)) {
      Events.emitNet('npcs:guards:died', guardId);
      clearInterval(deathThread);
    }
  }, 500);
};
