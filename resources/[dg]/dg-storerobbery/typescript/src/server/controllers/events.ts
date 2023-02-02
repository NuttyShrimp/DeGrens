import { Auth, Events } from '@dgx/server';
import { getConfig } from 'helpers/config';

Auth.onAuth(plyId => {
  const config = getConfig();
  Events.emitNet('storerobbery:client:init', plyId, config.stores);
});
