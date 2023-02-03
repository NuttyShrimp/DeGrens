import { Events, Inventory, Notifications, UI } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';

import { applyUpgrade, getCosmeticUpgrades } from './service.upgrades';
import { getIsInItemZone } from './zones.upgrades';

let controllerMenuOpen = false;

let previousWindowTint: number | null = null;

UI.onUIReload(() => {
  controllerMenuOpen = false;
  resetWindowTint();
});

UI.onApplicationClose(() => {
  if (controllerMenuOpen) {
    controllerMenuOpen = false;
    const veh = getCurrentVehicle();
    if (!veh || !isDriver()) {
      Notifications.add('Kon veranderingen niet opslaan...', 'error');
      return;
    }
    const upgrades = getCosmeticUpgrades(veh);
    const newUpgrades: Partial<Upgrades.Cosmetic> = { neon: upgrades?.neon, xenon: upgrades?.xenon };
    Events.emitNet('vehicles:itemupgrades:saveChanges', NetworkGetNetworkIdFromEntity(veh), newUpgrades);
  }
  resetWindowTint();
}, 'contextmenu');

Events.onNet('vehicles:itemupgrades:openControllerMenu', (menu: ContextMenu.Entry[]) => {
  if (!getIsInItemZone()) return;
  controllerMenuOpen = true;
  UI.openApplication('contextmenu', menu);
});

UI.RegisterUICallback('upgrades/item/toggle', (data: { item: 'neon' | 'xenon'; id?: number }, cb) => {
  if (!controllerMenuOpen) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  if (data.item === 'neon') {
    const currentState = getCosmeticUpgrades(veh)?.neon.enabled.find(x => x.id === data.id);
    if (!currentState) return;
    applyUpgrade(veh, 'neon', { enabled: [{ id: data.id, toggled: !currentState.toggled ?? false }] });
  } else if (data.item === 'xenon') {
    const currentState = getCosmeticUpgrades(veh)?.xenon;
    applyUpgrade(veh, 'xenon', { active: !currentState?.active ?? false });
  }

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('upgrades/item/set', (data: { item: 'neon' | 'xenon'; value: number | RGB }, cb) => {
  if (!controllerMenuOpen) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  if (data.item === 'neon') {
    applyUpgrade(veh, 'neon', { color: data.value as RGB });
  } else if (data.item === 'xenon') {
    applyUpgrade(veh, 'xenon', { color: data.value as number });
  }

  cb({ data: {}, meta: { ok: true, message: '' } });
});

Events.onNet('vehicles:windowtint:openMenu', (menu: ContextMenu.Entry[]) => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }
  if (!getIsInItemZone()) return;
  previousWindowTint = getCosmeticUpgrades(veh)?.windowTint ?? 0;
  previousWindowTint = previousWindowTint === -1 ? 0 : previousWindowTint;
  UI.openApplication('contextmenu', menu);
});

UI.RegisterUICallback('upgrades/windowtint/set', (data: { id: number }, cb) => {
  if (previousWindowTint === null) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }
  applyUpgrade(veh, 'windowTint', data.id);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('upgrades/windowtint/apply', async (_, cb) => {
  if (previousWindowTint === null) return;
  previousWindowTint = null;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Kon veranderingen niet opslaan...', 'error');
    return;
  }

  const removed = await Inventory.removeItemFromPlayer('window_tint');
  if (!removed) {
    Notifications.add('Je hebt geen folie...', 'error');
    return;
  }

  const tint = getCosmeticUpgrades(veh)?.windowTint ?? 0;
  Events.emitNet('vehicles:itemupgrades:saveChanges', NetworkGetNetworkIdFromEntity(veh), { windowTint: tint });

  cb({ data: {}, meta: { ok: true, message: '' } });
});

const resetWindowTint = () => {
  if (previousWindowTint === null) return;
  const veh = getCurrentVehicle();
  if (!veh) return;
  applyUpgrade(veh, 'windowTint', previousWindowTint);
  previousWindowTint = null;
};
