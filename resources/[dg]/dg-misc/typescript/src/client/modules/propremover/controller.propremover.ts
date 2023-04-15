import { Events } from '@dgx/client';
import { addRemovedProp, registerRemovedProp, unregisterRemovedProp } from './service.propremover';

global.exports('addRemovedProp', addRemovedProp);

Events.onNet('misc:propremover:register', registerRemovedProp);
Events.onNet('misc:propremover:unregister', unregisterRemovedProp);
