import { Auth } from '@dgx/server';
import itemDataManager from 'classes/itemdatamanager';
import objectsUtility from 'classes/objectsutility';
import locationManager from 'modules/locations/manager.locations';

Auth.onAuth(plyId => {
  locationManager.dispatchDropsToPlayer(plyId);
  itemDataManager.seedItemDataForPlayer(plyId);
  objectsUtility.dispatchConfigToPlayer(plyId);
});
