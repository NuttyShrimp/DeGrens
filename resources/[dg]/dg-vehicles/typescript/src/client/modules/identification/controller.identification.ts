import { Notifications, Peek, UI, Vehicles } from '@dgx/client';
import { getVehicleVin, getVehicleVinWithoutValidation } from './service.identification';
import { isVehicleVinScratched } from 'services/vinscratch';

global.asyncExports('getVehicleVin', getVehicleVin);
global.exports('getVehicleVinWithoutValidation', getVehicleVinWithoutValidation);

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Lees VIN',
      icon: 'fas fa-barcode',
      action: async (_, entity) => {
        if (!entity) return;
        if (isVehicleVinScratched(entity)) {
          Notifications.add('VIN: ☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐', 'error');
          return;
        }

        const vin = await getVehicleVin(entity);
        if (!vin) return;
        Notifications.add(`VIN: '${vin}'`);
        UI.addToClipboard(vin);
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return Vehicles.isNearVehiclePlace(ent, 'bonnet', 2, true);
      },
    },
  ],
  // higher distance because dist to boot gets checked in canInteract
  // this prevents entry not being enabled because we use raycast hit coord on entity for distancecheck
  // which can scuff when moving around vehicle while keeping raycast center on vehicle
  distance: 10,
});
