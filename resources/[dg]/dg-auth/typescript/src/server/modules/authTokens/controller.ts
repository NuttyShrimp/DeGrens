import { createResourceToken, validateToken } from './service';

global.exports('validateToken', validateToken);

onNet('dg-auth:token:requestResource', (resource: string) => {
  createResourceToken(source, resource);
});
