import {
  addLocalStaticObject,
  cleanupStaticObjects,
  getEntityForObjectId,
  handleGlobalRemoveAction,
  handleGlobalAddAction,
  logAllToConsole,
  removeLocalStaticObject,
  getStaticObjectState,
} from './service.staticobjects';

onNet('misc:staticObjects:add', (objects: StaticObjects.State[]) => {
  handleGlobalAddAction(objects);
});

onNet('misc:staticObjects:remove', (objId: string | string[]) => {
  handleGlobalRemoveAction(objId);
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  cleanupStaticObjects();
});

global.exports('getEntityForObjectId', getEntityForObjectId);
global.exports('getStaticObjectState', getStaticObjectState);

// Local only
global.exports('addStaticObject', addLocalStaticObject);
global.exports('removeStaticObject', removeLocalStaticObject);

RegisterCommand(
  'debug:client:staticObjects',
  () => {
    logAllToConsole();
  },
  false
);
