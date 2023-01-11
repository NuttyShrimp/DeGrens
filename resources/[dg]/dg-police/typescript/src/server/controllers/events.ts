import { RPC, Events, Chat, Vehicles, Util, Inventory, Notifications, Status, Jobs } from '@dgx/server';
import { awaitPoliceConfigLoad, getPoliceConfig } from 'services/config';
import { isPlateFlagged } from 'services/plateflags';
import { mainLogger } from 'sv_logger';

RPC.register('police:getConfig', async src => {
  await awaitPoliceConfigLoad();
  const config = getPoliceConfig();
  return config;
});

Events.onNet('police:showVehicleInfo', async (src: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  const plate = GetVehicleNumberPlateText(vehicle);
  const vin = Vehicles.getVinForNetId(netId);
  if (!vin) return;

  let ownerName = Util.generateName();
  if (Vehicles.isVinFromPlayerVeh(vin)) {
    const legalPlate = await Vehicles.getPlateForVin(vin);
    if (legalPlate === plate) {
      const ownerCid = await Vehicles.getCidFromVin(vin);
      if (ownerCid !== undefined) {
        ownerName = await Util.getCharName(ownerCid);
      }
    }
  }

  const vehicleInfo = Vehicles.getConfigByEntity(vehicle);
  if (!vehicleInfo) {
    const modelName = await RPC.execute<string>('vehicle:getArchType', src, NetworkGetNetworkIdFromEntity(vehicle));
    Util.Log(
      'vehicles:missingConfig',
      {
        model: modelName,
      },
      `Found a missing model`,
      undefined,
      true
    );
  }

  const plateFlagged = isPlateFlagged(plate);

  Chat.sendMessage(src, {
    prefix: 'Dispatch: ',
    type: plateFlagged ? 'warning' : 'normal',
    message: `<br>Plaat: ${plate}<br>Eigenaar: ${ownerName}<br>Merk: ${vehicleInfo?.brand ?? 'Unknown'}<br>Model: ${
      vehicleInfo?.name ?? 'Unknown'
    }<br>Klasse: ${vehicleInfo?.class ?? 'Unknown'}${plateFlagged ? '<br>Plaat is geflagged!' : ''}`,
  });
});

Inventory.registerUseable(['binoculars', 'pd_camera'], (plyId, itemState) => {
  Events.emitNet('police:binoculars:use', plyId, itemState.name);
});

Events.onNet('police:checkGSR', (src: number) => {
  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (target === undefined) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const hasGsr = Status.doesPlayerHaveStatus(target, 'gsr');
  Chat.sendMessage(src, {
    prefix: '',
    message: `Persoon is GSR ${hasGsr ? 'positief' : 'negatief'}.`,
    type: 'normal',
  });
});

Events.onNet('police:checkStatus', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    Notifications.add(src, 'Je bent geen politie agent', 'error');
    mainLogger.warn(`${Util.getName(src)} tried to check a players status but was not a police`);
    return;
  }

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (target === undefined) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const checkable = getPoliceConfig().config.checkableStatuses;
  Status.showStatusesToPlayer(src, target, checkable);
});
