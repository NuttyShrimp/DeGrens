import { Auth, Chat, Events } from '@dgx/server';
import { generatePanelToken } from 'services/panelTokens';

setImmediate(() => {
  Chat.registerCommand('report', 'Open het report menu', [], 'user', src => {
    Events.emitNet('auth:panel:openReports', src);
  });
});

Auth.onAuth(src => {
  generatePanelToken(src);
});
