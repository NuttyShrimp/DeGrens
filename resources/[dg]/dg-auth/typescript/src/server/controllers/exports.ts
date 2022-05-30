import { getPlayerInfo, getPlyToken } from 'helpers/tokens';
import { registerEventForManager, registerHandlerForManager, registerServerEventHandler } from '../helpers/events';

global.exports('validateToken', getPlayerInfo);
global.exports('getPlayerToken', getPlyToken);

global.exports('registerEventResource', registerServerEventHandler);
global.exports('registerEvent', registerEventForManager);
global.exports('registerHandler', registerHandlerForManager);
