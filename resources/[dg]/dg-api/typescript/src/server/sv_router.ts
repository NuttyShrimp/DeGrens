import fastify, { FastifyLoggerOptions, FastifyReply, FastifyRequest, RawServerDefault } from 'fastify';
import { Config, Util } from '@dgx/server';
import { setHttpCallback } from '@citizenfx/http-wrapper';
import { tokenManager } from 'classes/tokenManager';
import { mainLogger } from 'sv_logger';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

import { banManager } from './classes/banManager';
import { infoRouter } from 'routes/info';
import { tokenRouter } from 'routes/token';
import { adminRouter } from 'routes/admin';
import { businessRouter } from 'routes/business';
import { financialsRouter } from 'routes/financials';
import { PassThrough } from 'stream';
import { PinoLoggerOptions } from 'fastify/types/logger';

const apiConfig = Config.getModuleConfig('api');

const prodLogger = (): (FastifyLoggerOptions<RawServerDefault> & PinoLoggerOptions) | Logger => {
  return {};
};

const devLogger = (): Logger => {
  const stream = pretty({
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
  });

  return pino(
    {
      name: 'API',
      timestamp: true,
      level: 'debug',
    },
    stream
  );
};

export const server = fastify({
  logger: Util.isDevEnv() ? devLogger() : undefined, //prodLogger(),
});

setImmediate(async () => {
  await server.register(cors, {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: apiConfig.allowedDomains.map((d: string) => `http://${d}`),
  });

  await server.register(sensible);

  server.addHook('preValidation', async (req: FastifyRequest, res) => {
    validateRequest(req, res);
  });

  server.register(infoRouter, { prefix: '/info' });
  server.register(tokenRouter, { prefix: '/tokens' });
  server.register(adminRouter, { prefix: '/admin' });
  server.register(businessRouter, { prefix: '/business' });
  server.register(financialsRouter, { prefix: '/financials' });

  server.ready(err => {
    if (err) {
      console.error(err);
      return;
    }
    setHttpCallback((req: any, res: any) => {
      server.routing(req, res);
    });
  });
});

const validateRequest = (req: FastifyRequest, res: FastifyReply) => {
  if (!checkBan(req, res)) {
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${req.url}, but the IP is banned`,
      undefined,
      true
    );
    throw res.forbidden('Banned due mis-use');
  }
  if (!authorizationMiddleware(req, res)) {
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${req.url}, but used an invalid token`,
      undefined,
      true
    );
    throw res.unauthorized('Invalid token');
  }
};

const authorizationMiddleware = (req: FastifyRequest, res: FastifyReply): boolean => {
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
  const token = bearerToken.replace(/Bearer /, '');
  if (!tokenManager.isTokenValid(token)) {
    res.code(401).send({ message: 'Invalid authentication token' });
    banManager.ban(req.ip);
    return false;
  }
  return true;
};

const checkBan = (req: FastifyRequest, res: FastifyReply): boolean => {
  if (banManager.isBanned(req.ip)) {
    res.code(403).send({ message: 'Your access to this API has been revoked due to infringement' });
    return false;
  }
  return true;
};

RegisterCommand(
  'createAPIToken',
  (src: number, args: string[]) => {
    if (src > 0) {
      mainLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to create a API token!`);
      Util.Log(
        `API:tokencreation`,
        {},
        `${GetPlayerName(String(src))}(${src}) tried to create a API token!`,
        src,
        true
      );
      return;
    }
    const comment = args.join(' ');
    let token = Util.uuidv4();
    while (tokenManager.isTokenValid(token)) {
      token = Util.uuidv4();
    }
    tokenManager.registeToken(token, comment);
  },
  true
);
