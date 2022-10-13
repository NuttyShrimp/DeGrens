import { Events, Notifications, UI } from '@dgx/client';
import { getCurrentWeaponData } from 'services/equipped';

UI.RegisterUICallback('weapons/setTint', (data, cb) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData) {
    SetPedWeaponTintIndex(PlayerPedId(), currentWeaponData.hash, data.tint);
    Events.emitNet('weapons:server:setTint', currentWeaponData.id, data.tint);
  } else {
    Notifications.add('Je hebt geen wapen vast', 'error');
  }
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('weapons/removeAttachment', (data, cb) => {
  const currentWeaponData = getCurrentWeaponData();
  if (currentWeaponData) {
    Events.emitNet('weapons:server:removeAttachment', currentWeaponData.id, data.name);
  } else {
    Notifications.add('Je hebt geen wapen vast', 'error');
  }
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
