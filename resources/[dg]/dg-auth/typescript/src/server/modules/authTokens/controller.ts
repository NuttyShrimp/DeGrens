import { createResourceToken, validateToken } from './service';

global.exports('validateToken', (src: number, resource: string, token: string) => validateToken(src, resource, token));

onNet('dg-auth:token:requestResource', (resource: string) => {
  createResourceToken(source, resource);
});
