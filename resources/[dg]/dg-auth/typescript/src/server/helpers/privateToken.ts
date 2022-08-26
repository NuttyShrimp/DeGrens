export let PRIVATE_TOKEN = 'bozo-1';

export const setPrivateToken = (token: string) => {
  PRIVATE_TOKEN = token;
  emitNet('dg-auth:token:reset', -1);
};
