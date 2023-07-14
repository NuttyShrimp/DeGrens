import { Events, Notifications, Util, PolyZone, Peek, BlipManager, RPC, Npcs } from '@dgx/client';

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

  const shouldSpawn = await RPC.execute<boolean>('business:kingpills:handlePickupEnter');
  if (!shouldSpawn) return;

  Npcs.spawnGuard({
    model: 'a_m_m_hillbilly_02',
    position: position,
    heading: Util.getHeadingToFaceCoordsFromCoord(position, Util.getPlyCoords()),
    weapon: 'WEAPON_KNIFE',
    flags: {
      isKingPillsEnemy: true,
    },
    deleteTime: {
      alive: 180,
      dead: 30,
    },
  });

  peekIds = Peek.addGlobalEntry('ped', {
    options: [
      {
        label: 'Doorzoeken',
        icon: 'fas fa-magnifying-glass',
        action: (_, ent) => {
          if (!ent) return;
          Events.emitNet('business:kingpills:loot', NetworkGetNetworkIdFromEntity(ent));
        },
        canInteract: entity =>
          !!entity && DoesEntityExist(entity) && IsEntityDead(entity) && Entity(entity).state.isKingPillsEnemy,
      },
    ],
  });
};

export const cleanupKingPillsJob = () => {
  PolyZone.removeZone('kingpills_job_zone');
  Peek.removeGlobalEntry(peekIds);
  BlipManager.removeBlip('kingpills_job_blip');
};
