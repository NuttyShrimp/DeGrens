import { RPC, Events, Chat, Vehicles, Util, Inventory } from '@dgx/server';
import { awaitPoliceConfigLoad, getPoliceConfig } from 'services/config';

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

  Chat.sendMessage(src, {
    prefix: 'Dispatch: ',
    type: 'normal',
    message: `<br>Plaat: ${plate}<br>Eigenaar: ${ownerName}<br>Merk: ${vehicleInfo?.brand ?? 'Unknown'}<br>Model: ${
      vehicleInfo?.name ?? 'Unknown'
    }<br>Klasse: ${vehicleInfo?.class ?? 'Unknown'}`,
  });
});

Inventory.registerUseable(['binoculars', 'pd_camera'], (plyId, itemState) => {
  Events.emitNet('police:binoculars:use', plyId, itemState.name);
});

Chat.registerCommand(
  'callsign',
  'Pas je callsign aan',
  [{ name: 'callsign', description: 'Je callsign' }],
  'user',
  (src, _, args) => {
    const callsign = args.join(' ');
    const player = DGCore.Functions.GetPlayer(src);
    player.Functions.SetMetaData('callsign', callsign);
  }
);
