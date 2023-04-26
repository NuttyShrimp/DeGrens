import { Events, Inventory, Notifications, Police, Status, Taskbar, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { getOnDamageStatusFromWeapon } from './service.health';

export const registerHealItems = () => {
  const healItems = getHospitalConfig().health.healItems;

  Inventory.registerUseable(Object.keys(healItems), async (plyId, itemState) => {
    const healItem = healItems[itemState.name];
    if (!healItem) return;

    const [canceled] = await Taskbar.create(
      plyId,
      healItem.taskbar.icon,
      healItem.taskbar.label,
      healItem.taskbar.time,
      {
        canCancel: true,
        cancelOnDeath: true,
        disableInventory: true,
        disablePeek: true,
        controlDisables: {
          combat: true,
        },
        animation: healItem.taskbar.animation,
      }
    );
    if (canceled) return;

    const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
    if (!removed) {
      Notifications.add(plyId, 'Je heb dit niet', 'error');
      return;
    }

    Events.emitNet('hospital:health:useHealItem', plyId, healItem.effects);
  });
};

// Handle on damage statusses and blood drops
on('weaponDamageEvent', (sender: number, data: WeaponDamageEventData) => {
  const status = getOnDamageStatusFromWeapon(data.weaponType >>> 0);
  if (!status) return;

  const hitNetIds = data.hitGlobalIds;
  for (const netId of hitNetIds) {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(entity) || !IsPedAPlayer(entity)) continue;
    const plyId = NetworkGetEntityOwner(entity);
    if (!Status.doesPlayerHaveStatus(plyId, status)) {
      Status.addStatusToPlayer(plyId, status);
    }

    const bleedEvidenceChance = Util.getRndInteger(1, 101);
    if (bleedEvidenceChance < 10) {
      Police.addBloodDrop(plyId);
    }
  }
});
