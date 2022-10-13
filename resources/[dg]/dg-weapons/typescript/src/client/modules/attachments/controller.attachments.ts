import { Events, Notifications, UI } from '@dgx/client';
import { getCurrentWeaponData } from 'modules/weapons/service.weapons';

UI.RegisterUICallback('weapons/removeAttachment', (data, cb) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData) {
    Events.emitNet('weapons:server:removeAttachment', currentWeaponData.id, data.name);
  } else {
    Notifications.add('Je hebt geen wapen vast', 'error');
  }
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('weapons:client:openAttachmentMenu', (menu: ContextMenu.Entry[]) => {
  UI.openApplication('contextmenu', menu);
});

Events.onNet('weapons:client:updateAttachments', (allComponents: string[], components: string[]) => {
  const weaponHash = getCurrentWeaponData()?.hash;
  if (!weaponHash) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }
  const ped = PlayerPedId();
  // first remove all then add the equipped ones
  allComponents.forEach(c => {
    if (HasPedGotWeaponComponent(ped, weaponHash, c)) {
      RemoveWeaponComponentFromPed(ped, weaponHash, c);
    }
  });
  components.forEach(c => GiveWeaponComponentToPed(ped, weaponHash, c));
});
