// This script will register all resources that use the DGX middleware for events and register it into a set
// This set will be used to generate the maps
import { mainLogger } from '../sv_logger';
import { getPlyToken } from './tokens';
import { handleResourceStart, handleResourceStop, hasAPlayerJoined } from './events';

let resourceLoaded = false;
const registeredResources: Set<string> = new Set();
// This is used to check if a resource should get a new list after starting
const unRegisteredResources: Set<string> = new Set();

const isResourceKnown = (resName: string) => {
  for (let i = 0; i < GetNumResources(); i++) {
    if (resName === GetResourceByFindIndex(i)) {
      return true;
    }
  }
  return false;
};

setImmediate(async () => {
  const resName = GetCurrentResourceName();
  while (GetResourceState(resName) !== 'started') {
    await new Promise(res => setTimeout(res, 100));
  }
  resourceLoaded = true;
});

// registeringPly is so we can await the assignement of the token for this specific player
export const registerResource = async (resName: string, registeringPly: number) => {
  if (registeredResources.has(resName)) return;
  if (!isResourceKnown(resName)) {
    mainLogger.debug(`${resName} is not known to the server`);
    // TODO: add ban for fuckface
    return;
  }
  mainLogger.debug(`${resName} is now registered`);
  registeredResources.add(resName);
  console.log(`hasPlayerJoined: ${hasAPlayerJoined()}`);
  // Generate maps specifically for this
  if (!hasAPlayerJoined()) return;
  if (!getPlyToken(registeringPly)) {
    await new Promise<void>(res => {
      on('dg-auth:server:authenticated', (src: number) => {
        if (src === registeringPly) {
          res();
        }
      });
    });
  }
  handleResourceStart(resName);
  // If the resource was restarted, we resend the token to the specific resource
  if (!resourceLoaded || !unRegisteredResources.has(resName)) return;
  unRegisteredResources.delete(resName);
  // Resend token to clients
  for (let i = 0; i < GetNumPlayerIndices(); i++) {
    const ply = GetPlayerFromIndex(i);
    const plyToken = getPlyToken(Number(ply));
    if (!plyToken) DropPlayer(ply, `[DGX] Token not found for ${ply}`);
    emitNet('__dg_auth_authenticated', ply, resName, plyToken);
  }
};

export const getRegisteredResources = () => {
  return [...registeredResources];
};

on('onResourceStop', (resName: string) => {
  if (!resourceLoaded || !registeredResources.has(resName)) return;
  registeredResources.delete(resName);
  unRegisteredResources.add(resName);
  handleResourceStop(resName);
});
