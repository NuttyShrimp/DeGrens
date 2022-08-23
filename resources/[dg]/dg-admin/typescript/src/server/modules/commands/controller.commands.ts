import { Events } from '@dgx/server';

import { loadCommands } from './service.commands';

setImmediate(() => {
  loadCommands();
});

Events.onNet('admin:commands:damageEntity', (_, ent: number) => {
  emitNet('admin:commands:damageEntity', NetworkGetEntityOwner(ent), ent);
});

Events.onNet('admin:commands:deleteEntity', (_, ent: number) => {
  emitNet('admin:commands:deleteEntity', NetworkGetEntityOwner(ent), ent);
});
