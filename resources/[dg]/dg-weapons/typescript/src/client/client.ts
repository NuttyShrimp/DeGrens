import './controllers';
import './services/equipped';

import { Peek, RPC, UI } from '@dgx/client';
import { PICKUP_HASHES, setAmmoConfig, TINT_COLOR_NAMES } from './constants';
import { getCurrentWeaponData } from 'services/equipped';

setImmediate(async () => {
  RPC.execute<Weapons.Config['ammo']>('weapons:server:getAmmoConfig').then(cfg => cfg !== null && setAmmoConfig(cfg));

  // Disable picksups
  const playerId = PlayerId();
  PICKUP_HASHES.forEach(hash => ToggleUsePickupsForPlayer(playerId, hash, false));
  SetPickupAmmoAmountScaler(0.0);

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
            ...Object.entries(TINT_COLOR_NAMES).map(([id, name]) => ({
              title: name,
              callbackURL: 'weapons/setTint',
              data: { tint: id },
            })),
          ];
          UI.openApplication('contextmenu', menu);
        },
        canInteract: () => getCurrentWeaponData() !== null,
      },
    ],
    distance: 1.5,
  });
});
