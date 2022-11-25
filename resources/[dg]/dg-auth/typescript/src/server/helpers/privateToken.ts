import { createJWSHandlers } from "modules/authTokens/service";

export let PRIVATE_TOKEN = 'bozo-1';

export const setPrivateToken = (token: string) => {
  PRIVATE_TOKEN = token;
  createJWSHandlers();
  emitNet('dg-auth:token:reset', -1);
};

export const getPrivateToken = () => {
  return PRIVATE_TOKEN;
}
