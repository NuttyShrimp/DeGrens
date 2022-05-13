import { mainLogger } from 'sv_logger';
import { doRequestResponse } from 'sv_router';
import { Util } from '@dgx/server';

// Map resources on routes
const routeMap: Map<string, API.Route[]> = new Map();

const getRoute = (path: string): API.Route | undefined => {
  for (const routes of routeMap.values()) {
    for (const route of routes) {
      if (route.path === path) {
        return route;
      }
    }
  }
  return undefined;
};

const getRouteResponser =
  (res: any) =>
  (
    code: number,
    data: any,
    headers = {
      ['Content-Type']: 'application/json',
    }
  ) => {
    res.writeHead(code, headers), res.send(JSON.stringify(data));
  };

export const registerRoute = (method: API.Method, path: string, handler: (request: any) => any) => {
  const resource = GetInvokingResource();
  if (getRoute(path)) {
    mainLogger.error(`${resource} tried registering an API path (${path}) that already was defined`);
  }
  if (!routeMap.has(resource)) {
    routeMap.set(resource, []);
  }
  routeMap.get(resource).push({
    method,
    path,
    handler,
  });
};
global.exports('registerRoute', registerRoute);

export const handleRoute = (path: string, req: any, res: any) => {
  const route = getRoute(path);
  if (!route) {
    doRequestResponse(res, { error: 'Path was not found' }, 404);
    Util.Log(
      'api:request:failed',
      {
        req,
      },
      `${req.ip} tried to make a request on ${path}, but the endpoint was not found`,
      undefined,
      true
    );
    return;
  }
  try {
    route.handler(req, getRouteResponser(res));
  } catch (e) {
    doRequestResponse(res, { error: 'An error occurred while handling your request' }, 500);
  }
};

on('onResourceStop', (res: string) => {
  routeMap.delete(res);
});
