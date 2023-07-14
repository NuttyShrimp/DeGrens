import { BlipManager, Core, Events, Inventory, Peek, PolyZone } from '@dgx/client';
import { buildMethRunVehicleZone, destroyMethRunVehicleZone } from './service.methrun';

Peek.addFlagEntry('isMethrunStart', {
  options: [
    {
      label: 'Betalen',
      icon: 'fas fa-comments-dollar',
      action: () => {
        Events.emitNet('criminal:methrun:pay');
      },
    },
  ],
});

Events.onNet('criminal:methrun:buildVehicleZone', buildMethRunVehicleZone);
Events.onNet('criminal:methrun:destroyVehicleZone', destroyMethRunVehicleZone);

PolyZone.onEnter('methrun_vehicle', () => {
  Events.emitNet('criminal:methrun:enterVehicleZone');
});

PolyZone.onLeave('methrun_vehicle', () => {
  Events.emitNet('criminal:methrun:leaveVehicleZone');
});

Peek.addFlagEntry('isMethRunDropOff', {
  options: [
    {
      label: 'Geef Materialen',
      icon: 'fas fa-handshake',
      action: () => {
        Inventory.openStash('methrun_dropoff');
      },
    },
    {
      label: 'Confirmeren',
      icon: 'fas fa-check',
      action: () => {
        Events.emitNet('criminal:methrun:confirmDropOff');
      },
    },
  ],
});

Peek.addFlagEntry('isMethRunFinish', {
  options: [
    {
      label: 'Voertuig Tonen',
      icon: 'fas fa-car',
      action: () => {
        Events.emitNet('criminal:methrun:finish');
      },
    },
  ],
});

Core.onPlayerUnloaded(() => {
  BlipManager.removeCategory('methrun');
});
