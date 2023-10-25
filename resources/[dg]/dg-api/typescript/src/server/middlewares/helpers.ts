import { banManager } from 'classes/banManager';
import { FastifyReply, FastifyRequest } from 'fastify';

export const extractBearerToken = (req: FastifyRequest, res: FastifyReply) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    res.code(401).send({ message: 'No authentication token' });
    banManager.ban(req.ip);
    return false;
  }
  if (!bearerToken.match(/^Bearer .*$/)) {
    res.code(401).send({ message: 'Invalid authentication token' });
    banManager.ban(req.ip);
    return false;
  }
  return bearerToken.replace(/Bearer /, '');
};
