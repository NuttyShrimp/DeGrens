import { Notifications } from '@dgx/client';

import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';
import upgradesManager from './classes/manager.upgrades';
import { KEYS_BY_TYPE } from './constants.upgrades';

export const checkIllegalTunes = (vehicle: number) => {
  // Validation not required because if it does not have a vin already neither would it have any upgrades
  const vin = getVehicleVinWithoutValidation(vehicle);
  if (!vin) {
    Notifications.add('Kon voertuig niet checken', 'error');
    return;
  }
  const maxUpgrades = upgradesManager.getAmountByKey(vehicle, KEYS_BY_TYPE.performance);
  const upgrades = upgradesManager.get('performance', vehicle);
  if (!upgrades || !maxUpgrades) {
    Notifications.add('Kon upgrades niet vinden', 'error');
    return;
  }
  let isLegal = true;
  for (const key of Object.keys(upgrades) as Vehicles.Upgrades.Performance.Key[]) {
    const maxValue = typeof maxUpgrades[key] === 'boolean' ? 1 : (maxUpgrades[key] as number) - 1;
    // we check max value, for example a motorcycle max susp is 0 so max legal is would be -1 which would cause it to always be marked as illegal
    if (maxValue < 0) continue;

    const curValue =
      typeof upgrades[key] === 'boolean' ? ((upgrades[key] as boolean) === true ? 1 : 0) : (upgrades[key] as number);
    if (curValue >= maxValue) {
      isLegal = false;
      break;
    }
  }
  Notifications.add(`Dit voertuig is ${isLegal ? 'NIET' : ''} illegaal getuned`, isLegal ? 'success' : 'error');
};
