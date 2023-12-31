import {
  BaseEvents,
  BlipManager,
  Events,
  Inventory,
  Jobs,
  Notifications,
  Peek,
  Taskbar,
  Util,
  Vehicles,
} from '@dgx/client';
import { buildLabPeekZone } from 'modules/evidence/service.evidence';
import { cleanupJail, loadPrisonConfig } from 'modules/prison/service.prison';
import { buildSpeedZones } from 'modules/speedzones/service.speedzones';
import { loadLockers } from 'services/lockers';
import { setRequirements } from 'services/requirements';
import { buildSafeZones } from 'services/safe';
import { isPoliceVehicle, setPoliceVehicles } from '@shared/services/vehicles';

Events.onNet('police:client:init', (config: Police.Config) => {
  buildSpeedZones(config.speedzones);
  loadLockers(config.config.lockers);
  buildLabPeekZone(config.config.labLocation);
  buildSafeZones(config.config.safes);
  loadPrisonConfig(config.prison);
  setRequirements(config.requirements);
  setPoliceVehicles(config.vehicles);

  BlipManager.addBlip({
    id: 'police-mrpd',
    category: 'police',
    coords: { x: 441.2155, y: -982.0308, z: 30.6896 },
    text: 'MRPD',
    sprite: 60,
    color: 0,
    scale: 0.8,
    isShortRange: true,
  });
  BlipManager.addBlip({
    id: 'police-prison',
    category: 'police',
    coords: { x: 1840.5927, y: 2585.1631, z: 46.007 },
    text: 'Bolingbroke',
    sprite: 58,
    color: 0,
    scale: 0.7,
    isShortRange: true,
  });
});

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
        return Vehicles.isNearVehiclePlace(vehicle, 'back', 1.5);
      },
    },
  ],
});

let pressedEmergencyButton = false;
on('police:emergencyButton', () => {
  if (pressedEmergencyButton) {
    Notifications.add('Je hebt hier net op gedrukt', 'error');
    return;
  }

  Notifications.add('Een automatisch signaal wordt binnen 15 seconden uitgezonden', 'success');
  pressedEmergencyButton = true;
  setTimeout(() => {
    Events.emitNet('police:alerts:emergency');
    pressedEmergencyButton = false;
  }, 15000);
});

on('police:carStorage', async () => {
  if (Jobs.getCurrentJob().name !== 'police') return;
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh === 0) return;
  const vin = Entity(veh).state.vin;
  if (!vin) return;

  if (!isPoliceVehicle(veh)) return;

  const [canceled] = await Taskbar.create('treasure-chest', 'Openen', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: GetPedInVehicleSeat(veh, -1) === ped,
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

BaseEvents.onResourceStop(() => {
  BlipManager.removeCategory('police');
  cleanupJail();
});
