import './modules/attachments';
import './modules/ammo';
import './modules/weapons';
import './services/tint';

import { loadConfig } from 'services/config';
import { registerUseableWeapons } from 'modules/weapons/service.weapons';
import { registerUseableAmmo } from 'modules/ammo/service.ammo';
import { registerUseableAttachments } from 'modules/attachments/service.attachments';

setImmediate(async () => {
  await loadConfig();

  registerUseableWeapons();
  registerUseableAmmo();
  registerUseableAttachments();
});
