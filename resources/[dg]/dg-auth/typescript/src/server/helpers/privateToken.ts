import { createJWSHandlers } from 'modules/authTokens/service';
import { createPanelJWSHandlers } from 'services/panelTokens';

export let PRIVATE_TOKEN = 'bozo-1';

export const setPrivateToken = (token: string) => {
  PRIVATE_TOKEN = token;
  createJWSHandlers();
  createPanelJWSHandlers();
  emitNet('dg-auth:token:reset', -1);
};

export const getPrivateToken = () => {
  return PRIVATE_TOKEN;
};
