import { Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { doRequestResponse } from 'sv_router';
import { URLSearchParams } from 'url';

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

const splitParams = (path: string): [API.Route | undefined, Record<string, string> | undefined] => {
  const sPath = path.split('/');
  for (const routes of routeMap.values()) {
    for (const route of routes) {
      const pathPtrn = route.path.replace(/\/:.*/, '/.*');
      const pathRegExp = new RegExp("^"+pathPtrn+"$", 'g');
      if (pathRegExp.test('/' + path.replace(/\?.*/, ""))) {
        // seed params
        const params: Record<string, string> = {};
        Object.keys(route.params).forEach(p => {
          params[p] = sPath[route.params[p]];
        })
        if (path.split('?').length > 1) {
          const paramsString = path.split('?')[1]
          const queries = new URLSearchParams(paramsString);
          for(let pair of queries.entries()){
            params[pair[0]] = pair[1];
          }
        }
        return [route, params];
      }
    }
  }
  return [undefined, undefined]
}

const getRouteResponser =
  (res: any) =>
  (
    code: number,
    data: any,
    headers: Record<string, string> = {
      ['Content-Type']: 'application/json',
    }
  ) => {
    res.writeHead(code, headers);
    res.send(JSON.stringify(data));
  };

export const registerRoute = (method: API.Method, path: string, handler: API.Handler) => {
  const resource = GetInvokingResource();
  if (getRoute(path)) {
    mainLogger.error(`${resource} tried registering an API path (${path}) that already was defined`);
  }
  if (!routeMap.get(resource)) {
    routeMap.set(resource, []);
  }
  // Check if path includes params
  const params: Record<string, number> = path.split('/').filter(p=>p !== '').map((p, i) => ({ path: p, index: i })).filter(i => i.path.includes(':')).reduce((obj: Record<string, number>, i) => {
    obj[i.path.replace(':', '')] = i.index;
    return obj
  }, {}) ?? {};
  routeMap.get(resource)!.push({
    method,
    path,
    params,
    handler,
  });
};
global.exports('registerRoute', registerRoute);

export const handleRoute = (path: string, req: any, res: any) => {
  const [route, params] = splitParams(path);
  req.params = {...(req.params ?? {}), ...params};
  if (!route) {
    doRequestResponse(res, { message: 'Path was not found' }, 404);
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
    doRequestResponse(res, { message: 'An error occurred while handling your request' }, 500);
    mainLogger.error(`An error occurred in the handler of ${path}`)
    console.error(e)
  }
};

on('onResourceStop', (res: string) => {
  routeMap.delete(res);
});
