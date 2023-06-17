import { Events, Notifications, Util, PolyZone, Peek, BlipManager, RPC } from '@dgx/client';

let peekIds: string[] = [];

export const startKingPillsJob = (zone: Vec4) => {
  BlipManager.addBlip({
    category: 'kingpills_job',
    id: 'kingpills_job_blip',
    coords: zone,
    sprite: 51,
    color: 0,
    text: 'King Pills Job',
  });
  PolyZone.addCircleZone('kingpills_job_zone', zone, 20, { routingBucket: 0, data: {} });
};

export const handlePickupEnter = async (position: Vec3) => {
  Notifications.add('Je hoort iemand roepen', 'success');

  const shouldSpawn = await RPC.execute<boolean>('business:kingpills:shouldSpawn');
  if (!shouldSpawn) return;

  const enemyPed = await Util.spawnAggressivePed('a_m_m_hillbilly_02', { ...position, w: 0 });
  if (!enemyPed) return;

  TaskCombatPed(enemyPed, PlayerPedId(), 0, 16);
  GiveWeaponToPed(enemyPed, GetHashKey('WEAPON_KNIFE'), 250, false, true);
  SetPedAsNoLongerNeeded(enemyPed);

  Events.emitNet('business:kingpills:pedSpawned', NetworkGetNetworkIdFromEntity(enemyPed));

  peekIds = Peek.addGlobalEntry('ped', {
    options: [
      {
        label: 'Doorzoeken',
        icon: 'fas fa-magnifying-glass',
        action: () => {
          Events.emitNet('business:kingpills:loot');
        },
        canInteract: entity =>
          !!entity && DoesEntityExist(entity) && IsEntityDead(entity) && Entity(entity).state.isKingPillsEnemy,
      },
    ],
  });
};

export const cleanupKingPillsJob = () => {
  PolyZone.removeZone('kingpills_job_zone');
  Peek.removeEntityEntry(peekIds);
  BlipManager.removeBlip('kingpills_job_blip');
};
