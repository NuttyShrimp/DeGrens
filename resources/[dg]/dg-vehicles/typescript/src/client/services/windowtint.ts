import { Events, Notifications, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

let originalWindowTint: number | null = null;
const WINDOWTINT_LEVELS = [4, 5, 3, 2, 1]; // order of these define the order in the menu

Events.onNet('vehicles:windowtint:openMenu', () => {
  const vehicle = getCurrentVehicle(true);
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  originalWindowTint = Math.max(upgradesManager.getByKeys(vehicle, ['windowTint'])?.windowTint ?? 0);

  UI.openApplication('contextmenu', [
    {
      title: 'Vehicle Tint',
      icon: 'paint-roller',
      disabled: true,
    },
    ...WINDOWTINT_LEVELS.map((val, idx) => ({
      title: `Level ${idx + 1}`,
      callbackURL: 'windowtint/set',
      preventCloseOnClick: true,
      data: {
        id: val,
      },
    })),
    {
      title: 'Apply',
      callbackURL: 'windowtint/apply',
    },
  ]);
});

const resetWindowTint = () => {
  if (originalWindowTint === null) return;

  const vehicle = getCurrentVehicle();
  if (!vehicle) return;

  upgradesManager.setByKey(vehicle, 'windowTint', originalWindowTint);
  originalWindowTint = null;
};

UI.onUIReload(resetWindowTint);
UI.onApplicationClose(resetWindowTint, 'contextmenu');

UI.RegisterUICallback('windowtint/set', (data: { id: number }, cb) => {
  if (originalWindowTint === null) return;

  const vehicle = getCurrentVehicle(true);
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  upgradesManager.setByKey(vehicle, 'windowTint', data.id);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('windowtint/apply', async (_, cb) => {
  if (originalWindowTint === null) return;

  const vehicle = getCurrentVehicle(true);
  if (!vehicle) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  const windowTint = upgradesManager.getByKeys(vehicle, ['windowTint'])?.windowTint;
  if (windowTint === undefined) return;
  Events.emitNet('vehicles:windowtint:save', windowTint);

  cb({ data: {}, meta: { ok: true, message: '' } });
});
