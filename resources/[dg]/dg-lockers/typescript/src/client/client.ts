import { Events } from '@dgx/client/classes';

import './controllers';

setImmediate(() => {
  Events.emitNet('lockers:server:request');
});
