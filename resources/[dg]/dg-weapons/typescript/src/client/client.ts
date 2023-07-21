import './modules/ammo';
import './modules/attachments';
import './modules/weapons';
import './services/tint';
import './services/crosshair';

import { registerTintPeek } from 'services/tint';

setImmediate(() => {
  registerTintPeek();
});
