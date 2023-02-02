import { Events } from '@dgx/client';
import locationManager from 'classes/LocationManager';
import { setRegisterZones } from 'modules/registers/service.registers';
import { setSafeZones } from 'modules/safes/service.safe';

Events.onNet('storerobbery:client:init', (storeConfig: Storerobbery.Config['stores']) => {
  locationManager.buildStoreZones(storeConfig);
  setRegisterZones(storeConfig);
  setSafeZones(storeConfig);
});
