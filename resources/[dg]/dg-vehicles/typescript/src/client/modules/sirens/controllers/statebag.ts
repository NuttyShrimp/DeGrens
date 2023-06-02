import { shuffleSirenSound, toggleHornSound } from '../helpers/sounds';
import { stateBagWrapper } from '../helpers/util';

stateBagWrapper('horn', toggleHornSound);

stateBagWrapper('lights', (veh, toggle: boolean) => {
  SetVehicleHasMutedSirens(veh, true);
  SetVehicleSiren(veh, toggle);
});

stateBagWrapper('sirenMode', shuffleSirenSound);
