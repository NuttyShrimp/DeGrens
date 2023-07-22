import { generatePanelToken, getSteamIdFromPanelToken, removePanelToken } from 'services/panelTokens';
import { getPlyServerId } from '../services/steamids';

global.asyncExports('generatePanelToken', generatePanelToken);
global.exports('removePanelToken', removePanelToken);
global.exports('getSteamIdFromPanelToken', getSteamIdFromPanelToken);
global.asyncExports('getServerIdForSteamId', getPlyServerId);
