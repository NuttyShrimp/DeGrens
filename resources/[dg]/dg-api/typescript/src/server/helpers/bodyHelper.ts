import { FastifyReply } from 'fastify';

export const validateBody = (res: FastifyReply, reqBody: Record<string, any>, required: string[]) => {
  if (!reqBody || typeof reqBody !== 'object') {
    res.code(400).send({
      message: 'Request body does not exists or is not a object',
    });
    return false;
  }
  for (let rk of required) {
    if (reqBody[rk] === undefined || reqBody[rk] === null) {
      res.code(400).send({
        message: `Request body does not contain ${rk}`,
      });
      return false;
    }
  }
  return true;
};
