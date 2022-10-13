import './modules/ammo';
import './modules/attachments';
import './modules/weapons';
import './services/tint';

import { RPC } from '@dgx/client';
import { PICKUP_HASHES, setAmmoConfig } from './constants';
import { registerTintPeek } from 'services/tint';

setImmediate(async () => {
  RPC.execute<Weapons.Config['ammo']>('weapons:server:getAmmoConfig').then(cfg => cfg !== null && setAmmoConfig(cfg));

  // Disable picksups
  const playerId = PlayerId();
  PICKUP_HASHES.forEach(hash => ToggleUsePickupsForPlayer(playerId, hash, false));
  SetPickupAmmoAmountScaler(0.0);

  registerTintPeek();
});
