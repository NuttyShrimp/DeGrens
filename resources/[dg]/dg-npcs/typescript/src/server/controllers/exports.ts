import { spawnGuard } from 'services/guards';
import { addNpc, removeNpc } from 'services/npcs';

global.exports('addNpc', addNpc);
global.exports('removeNpc', removeNpc);
global.exports('spawnGuard', spawnGuard);
