import { registerResource } from 'helpers/resourceSet';
import { generateToken, refreshAllPlayers, setPrivateToken } from 'helpers/tokens';

import { handleIncomingEvent } from '../helpers/events';

setImmediate(() => {
  refreshAllPlayers();
})

onNet('__dg_auth_register', (resName: string) => {
  registerResource(resName, source);
});

onNet('dg-auth:authenticate', () => {
  const src = source;
  generateToken(src);
  emitNet('dg-chars:client:startSession', src);
});

onNet('__dg_evt_c_s_emitNet', (evtData: EventData) => {
  handleIncomingEvent(source, evtData);
});

on('dg-config:moduleLoaded', (moduleId: string, config: any) => {
  if (moduleId !== 'auth') return;
  setPrivateToken(config.private_key);
});
