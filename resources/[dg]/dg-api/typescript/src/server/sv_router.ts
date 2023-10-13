import { setHttpCallback } from '@citizenfx/http-wrapper';
import { Config, Util } from '@dgx/server';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import fastifyWebsocket from '@fastify/websocket';
import { tokenManager } from 'classes/tokenManager';
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { extractBearerToken } from 'middlewares/helpers';
import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';
import { adminRouter } from 'routes/admin';
import { businessRouter } from 'routes/business';
import { debugRouter } from 'routes/debug';
import { financialsRouter } from 'routes/financials';
import { infoRouter } from 'routes/info';
import { inventoryRouter } from 'routes/inventory';
import { tokenRouter } from 'routes/token';
import { mainLogger } from 'sv_logger';

import { banManager } from './classes/banManager';

const apiConfig = Config.getModuleConfig('api');

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

const serverGenerator = () => {
  const server = fastify({
    logger: Util.isDevEnv() ? devLogger() : undefined, //prodLogger(),
  });
  (async () => {})();

  server.addHook('preValidation', async (req: FastifyRequest, res) => {
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
  });

  return server;
};

export const server = serverGenerator();
export const debugServer = serverGenerator();

const serverHooks = async (srv: typeof server) => {
  await srv.register(cors, {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: apiConfig.allowedDomains.map((d: string) => `http://${d}`),
  });

  await srv.register(sensible);
  await srv.register(fastifyWebsocket);
};

setImmediate(async () => {
  await serverHooks(server);
  await serverHooks(debugServer);
  // Unauthenticaed routes
  debugServer.register(async fastify => {
    fastify.register(debugRouter, { prefix: '/debug' });
  });

  debugServer.listen({ port: 30121 });

  // Authenticated routes via DB tokens
  server.register(async fastify => {
    fastify.addHook('preValidation', async (req: FastifyRequest, res) => {
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
    });

    fastify.register(infoRouter, { prefix: '/info' });
    fastify.register(tokenRouter, { prefix: '/tokens' });
    fastify.register(adminRouter, { prefix: '/admin' });
    fastify.register(businessRouter, { prefix: '/business' });
    fastify.register(financialsRouter, { prefix: '/financials' });
    fastify.register(inventoryRouter, { prefix: '/inventory' });
  });

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

const authorizationMiddleware = (req: FastifyRequest, res: FastifyReply): boolean => {
  const token = extractBearerToken(req, res);
  if (!token) return false;
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
