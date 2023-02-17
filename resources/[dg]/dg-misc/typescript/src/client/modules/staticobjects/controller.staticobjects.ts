import {
  addLocalStaticObject,
  cleanupStaticObjects,
  getEntityForObjectId,
  handleStateUpdate,
  logAllToConsole,
  removeLocalStaticObject,
} from './service.staticobjects';

AddStateBagChangeHandler(
  'staticObjects',
  'global',
  (bagName: string, key: string, state: Record<string, StaticObjects.State>) => {
    if (bagName !== 'global' || key !== 'staticObjects') return;
    handleStateUpdate(state);
  }
);

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  cleanupStaticObjects();
});

global.exports('getEntityForObjectId', getEntityForObjectId);

// Local only
global.exports('addStaticObject', addLocalStaticObject);
global.exports('removeStaticObject', removeLocalStaticObject);

RegisterCommand(
  'debug:staticobjects',
  () => {
    logAllToConsole();
  },
  false
);
