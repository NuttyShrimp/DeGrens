import { Events, Inventory, Notifications, Police, Status, Taskbar, Util } from '@dgx/server';
import { getHospitalConfig } from 'services/config';
import { getOnDamageStatusFromWeapon } from './service.health';

export const registerHealItems = () => {
  const healItems = getHospitalConfig().health.healItems;

  Inventory.registerUseable(Object.keys(healItems), async (plyId, itemState) => {
    const healItem = healItems[itemState.name];

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
        animation: healItem.animation,
      }
    );
    if (canceled) return;

    const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
    if (!removed) {
      Notifications.add(plyId, 'Je heb dit niet', 'error');
      return;
    }

    Events.emitNet('hospital:health:useHeal', plyId, healItem.health ?? 0, healItem.bleed ?? 0);
  });
};

// Handle on damage statusses and blood drops
on('weaponDamageEvent', (sender: number, data: WeaponDamageEventData) => {
  const status = getOnDamageStatusFromWeapon(data.weaponType);
  if (!status) return;

  const targets = data.hitGlobalIds;
  for (const target of targets) {
    const plyId = NetworkGetEntityOwner(NetworkGetEntityFromNetworkId(target));
    if (!Status.doesPlayerHaveStatus(plyId, status)) {
      Status.addStatusToPlayer(plyId, status);
    }

    const bleedEvidenceChance = Util.getRndDecimal(1, 101);
    if (bleedEvidenceChance < 10) {
      Police.addBloodDrop(plyId);
    }
  }
});