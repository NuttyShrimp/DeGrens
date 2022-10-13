import { forceRemoveWeapon, showReticle } from 'helpers/util';
import { getCurrentWeaponData } from 'services/equipped';

global.exports('getCurrentWeaponData', getCurrentWeaponData);
global.exports('showReticle', showReticle);
global.exports('removeWeapon', forceRemoveWeapon);
