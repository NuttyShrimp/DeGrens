import { Config, Util } from '@dgx/server';
import { tokenManager } from 'classes/tokenManager';
import { mainLogger } from 'sv_logger';
import { handleRoute } from 'sv_routes';

import { banManager } from './classes/banManager';

const apiConfig = Config.getModuleConfig('api');

setImmediate(() => {
  SetHttpHandler((req: any, res: any) => {
    req.path = req.path.slice(1);
    // Preflight check
    if (req.method === 'OPTIONS')
      return doRequestResponse(res, '', 200, {
        'Access-Control-Allow-Origin': apiConfig.allowedDomains,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
    // TODO: Check if rate limiting is needed
    try {
      if (req.method !== 'GET') {
        req.setDataHandler((body: string) => {
          req.body = JSON.parse(body);
          handleRequest(req, res);
        });
      } else {
        handleRequest(req, res);
      }
    } catch (e: any) {
      mainLogger.error(`An error occurred while trying to process an incoming API request:`);
      console.error(e);
      doRequestResponse(res, { message: 'An error occurred while processing the request' }, 500);
    }
  });
});

const handleRequest = (req: any, res: any) => {
  if (!checkDomain(req, res)) {
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${req.path}, but came from an invalid domain`,
      undefined,
      true
    );
    return;
  }
  if (!checkBan(req, res)) {
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${req.path}, but the IP is banned`,
      undefined,
      true
    );
    return;
  }
  if (!authorizationMiddleware(req, res)) {
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${req.path}, but used an invalid token`,
      undefined,
      true
    );
    return;
  }
  return handleRoute(req.path, req, res);
};

const authorizationMiddleware = (req: any, res: any): boolean => {
  if (!req?.headers?.Authorization) {
    doRequestResponse(res, { message: 'No authentication token' }, 401);
    banManager.ban(req.ip);
    return false;
  }
  const bearerToken = req.headers.Authorization;
  if (!bearerToken.match(/^Bearer .*$/)) {
    doRequestResponse(res, { message: 'Invalid authentication token' }, 401);
    banManager.ban(req.ip);
    return false;
  }
  const token = bearerToken.replace(/Bearer /, '');
  if (!tokenManager.isTokenValid(token)) {
    doRequestResponse(res, { message: 'Invalid authentication token' }, 401);
    banManager.ban(req.ip);
    return false;
  }
  req._api_token = token;
  return true;
};

const checkBan = (req: any, res: any): boolean => {
  if (banManager.isBanned(req.ip)) {
    doRequestResponse(res, { message: 'Your access to this API has been revoked due to infringement' }, 403);
    return false;
  }
  return true;
};

const checkDomain = (req: any, res: any): boolean => {
  if (!req.headers?.Host) {
    doRequestResponse(res, { message: 'Host header is not defined' }, 403);
    return false;
  }
  // Remove port from domain
  const domain = req.headers.Host.replace(/:\d+$/, '');
  if (!apiConfig.allowedDomains.includes(domain)) {
    doRequestResponse(res, { message: 'Your domain is not allowed to access this API' }, 403);
    return false;
  }
  return true;
};

export const doRequestResponse = (response: any, resBody: any, code = 200, header = {}) => {
  if (typeof resBody === 'string') {
    response.writeHead(code, header);
    response.send(resBody);
    return;
  }
  response.writeHead(code, { 'Content-Type': 'application/json', ...header });
  response.send(JSON.stringify(resBody));
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
