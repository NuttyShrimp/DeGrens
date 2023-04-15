import { Auth, Events } from '@dgx/server';
import { addRemovedProp, restoreRemovedProp, seedRemovedProps } from './service.propremover';

Events.onNet('misc:propremover:remove', (_, model: number, coords: Vec3) => {
  addRemovedProp({ model, coords });
});

global.exports('addRemovedProp', addRemovedProp);
global.exports('restoreRemovedProp', restoreRemovedProp);

Auth.onAuth(seedRemovedProps);
