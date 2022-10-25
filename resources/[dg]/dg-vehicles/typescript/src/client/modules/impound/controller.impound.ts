import { Events, Peek, PolyZone, RayCast, UI, Util } from '@dgx/client';

Events.on('vehicles:depot:client:openSelectionMenu', () => {
  const [targetVeh] = RayCast.getEntityPlayerLookingAt();
  if (!targetVeh || !IsEntityAVehicle(targetVeh) || !NetworkGetEntityIsNetworked(targetVeh)) return;
  Events.emitNet('vehicles:depot:server:openSelectionMenu', NetworkGetNetworkIdFromEntity(targetVeh));
});

Events.onNet('vehicles:depot:loadZones', (locations: Depot.Locations | null) => {
  if (!locations) throw new Error('Failed to load depot locations');
  PolyZone.addBoxZone(
    'vehicles_depot_impound',
    locations.impound.coords,
    locations.impound.width,
    locations.impound.length,
    {
      data: {
        id: 1,
      },
      heading: locations.impound.coords.w,
      minZ: locations.impound.coords.z - 1.0,
      maxZ: locations.impound.coords.z + 3.0,
    }
  );
});

UI.RegisterUICallback('vehicles:depot:action', (data, cb) => {
  const veh = NetworkGetEntityFromNetworkId(data.netId);
  const vehCoords = Util.getEntityCoords(veh);
  const inDepotSpot = PolyZone.isPointInside(vehCoords, 'vehicles_depot_impound');

  Events.emitNet('vehicles:depot:server:requestImpound', data.title, data.netId, inDepotSpot);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('vehicles/impound/getVehicle', (data, cb) => {
  Events.emitNet('vehicles:impound:server:unBail', data.vin);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

Peek.addFlagEntry(
  'isImpoundHandler',
  {
    distance: 2,
    options: [
      {
        icon: 'clipboard-list',
        label: 'Open impound list',
        action: () => {
          Events.emitNet('vehicles:impound:server:getList');
        },
      },
    ],
  },
  true
);
