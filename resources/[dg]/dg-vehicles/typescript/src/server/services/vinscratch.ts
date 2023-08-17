import { SQL, Util } from '@dgx/server';
import { getPlayerOwnedVehicles } from 'db/repository';
import { getConfigByModel } from 'modules/info/service.info';
import { mainLogger } from 'sv_logger';

export const setVehicleAsVinScratched = (vehicle: number) => {
  Entity(vehicle).state.set('vinscratched', true, true);
};

export const isVehicleVinScratched = (vehicle: number) => {
  return Entity(vehicle).state?.vinscratched ?? false;
};

global.exports('isVehicleVinScratched', isVehicleVinScratched);

const removeAllNonParkedVinscratchedVehicles = async () => {
  const deletedVins = await SQL.query<{ vin: string }[]>(
    `DELETE FROM player_vehicles WHERE vinscratched = 1 AND state != 'parked' RETURNING vin`
  );

  const logMsg = `Removed ${deletedVins.length} vinscratched vehicles that were not parked`;
  mainLogger.info(logMsg);
  if (deletedVins.length > 0) {
    Util.Log(
      'vehicles:removedNonparkedVinscratches',
      {
        vin: deletedVins,
      },
      logMsg
    );
  }
};

on('txAdmin:events:serverShuttingDown', (evtData: { delay: number }) => {
  if (evtData.delay < 5000) return; // 5000 is delay when restarting because of scheduled restart
  removeAllNonParkedVinscratchedVehicles();
});

export const doesPlayerHaveVinscratchedVehicleOfClass = async (cid: number, vehicleClass: Vehicles.Class) => {
  const vehicles = await getPlayerOwnedVehicles(cid);

  for (const veh of vehicles) {
    if (!veh.vinscratched) continue;
    const modelConfig = getConfigByModel(veh.model);
    if (modelConfig?.class === vehicleClass) return true;
  }

  return false;
};

global.exports('doesPlayerHaveVinscratchedVehicleOfClass', doesPlayerHaveVinscratchedVehicleOfClass);
