import { Events, Notifications, Peek, UI } from '@dgx/client';
import { getCurrentWeaponData } from 'modules/weapons/service.weapons';

const TINT_COLOR_NAMES: Record<number, string> = {
  [0]: 'Origineel',
  [1]: 'Groen',
  [2]: 'Goud',
  [3]: 'Roos',
  [4]: 'Leger',
  [5]: 'Politie',
  [6]: 'Oranje',
  [7]: 'Platinum',
};

export const registerTintPeek = () => {
  Peek.addFlagEntry('isWeaponCustomizer', {
    options: [
      {
        label: 'Tint Wapen',
        icon: 'fas fa-spray-can',
        action: () => {
          const menu: ContextMenu.Entry[] = [
            {
              title: 'Wapen Tinten',
              description: 'Selecteer een kleur voor je wapen',
              disabled: true,
            },
            ...Object.values(TINT_COLOR_NAMES).map(name => ({
              title: name,
              callbackURL: 'weapons/setTint',
              data: { tint: name },
            })),
          ];
          UI.openApplication('contextmenu', menu);
        },
        canInteract: () => {
          const currentWeaponData = getCurrentWeaponData();
          if (currentWeaponData === null) return false;
          return currentWeaponData.canTint;
        },
      },
    ],
    distance: 1.5,
  });
};

const getTintIdOfName = (tintName: string) => {
  for (const [id, name] of Object.entries(TINT_COLOR_NAMES)) {
    if (name !== tintName) continue;
    return Number(id);
  }
};

UI.RegisterUICallback('weapons/setTint', (data: { tint: string }, cb) => {
  const currentWeaponData = getCurrentWeaponData();
  if (!currentWeaponData) {
    Notifications.add('Je hebt geen wapen vast', 'error');
    return;
  }
  Events.emitNet('weapons:server:saveTint', currentWeaponData.id, data.tint);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('weapons:server:applyTint', (tintName: string) => {
  const tintId = getTintIdOfName(tintName);
  if (tintId === undefined) {
    console.error(`Failed to get tintId from name: ${tintName}`);
    return;
  }
  const ped = PlayerPedId();
  const weaponHash = GetSelectedPedWeapon(ped);
  SetPedWeaponTintIndex(ped, weaponHash, tintId);
});
