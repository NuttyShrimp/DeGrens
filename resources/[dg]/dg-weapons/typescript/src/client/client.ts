import './modules/ammo';
import './modules/attachments';
import './modules/weapons';
import './services/tint';

import { registerTintPeek } from 'services/tint';

setImmediate(() => {
  registerTintPeek();
});
