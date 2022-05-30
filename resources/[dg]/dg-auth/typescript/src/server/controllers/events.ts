import { registerResource } from 'helpers/resourceSet';
import { generateToken } from 'helpers/tokens';
import { handleIncomingEvent, setServerStarted } from '../helpers/events';

onNet('__dg_auth_register', (resName: string) => {
  registerResource(resName);
});

onNet('dg-auth:authenticate', () => {
  const src = source;
  setServerStarted();
  generateToken(src);
  emitNet('dg-chars:client:startSession', src);
});

onNet('__dg_evt_c_s_emitNet', (evtData: EventData) => {
  handleIncomingEvent(source, evtData);
});
