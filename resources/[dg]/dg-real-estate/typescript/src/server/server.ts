import { propertyManager } from 'classes/propertyManager';
import './services/config';
import { loadREConfig } from './services/config';
import './controllers/events';
import { Events, Util } from '@dgx/server';

RegisterCommand('realestate:reloadHouses', async () => {
  loadREConfig();
  await propertyManager.loadHouses();
  Util.getAllPlayers().forEach(player => {
    Events.emitNet('realestate:reloadInfo', player);
  });
}, true);

setImmediate(() => {
  loadREConfig();
  propertyManager.loadHouses();
});
