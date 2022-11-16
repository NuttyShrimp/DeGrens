import { Events, Inventory, Jobs, Notifications, Peek, Taskbar, Util } from '@dgx/client';

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Plaat Natrekken',
      icon: 'fas fa-input-numeric',
      job: 'police',
      action: async (_, vehicle) => {
        if (!vehicle) return;
        if (!NetworkGetEntityIsNetworked(vehicle)) return;
        Events.emitNet('police:showVehicleInfo', NetworkGetNetworkIdFromEntity(vehicle));
      },
      canInteract: vehicle => {
        if (!vehicle) return false;
        const plyCoords = Util.getPlyCoords();
        const [min, max] = GetModelDimensions(GetEntityModel(vehicle));
        const carLength = max[1] - min[1];
        const target = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(vehicle, 0, -carLength / 2, 0));
        return plyCoords.distance(target) < 1.5;
      },
    },
  ],
});

on('police:emergencyButton', () => {
  Notifications.add('Een automatisch signaal wordt binnen 15 seconden uitgezonden');
  setTimeout(() => {
    Events.emitNet('police:alerts:emergency');
  }, 15000);
});

on('police:carStorage', async () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  const veh = GetVehiclePedIsIn(PlayerPedId(), false);
  if (veh === 0) return;
  const vin = Entity(veh).state.vin;
  if (!vin) return;

  // TODO: Check if police vehicle

  const [canceled] = await Taskbar.create('treasure-chest', 'Openen', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      carMovement: true,
      movement: true,
      combat: true,
    },
  });
  if (canceled) return;

  const stashId = `police_vehicle_${vin}`;
  Inventory.openStash(stashId, 8);
});
