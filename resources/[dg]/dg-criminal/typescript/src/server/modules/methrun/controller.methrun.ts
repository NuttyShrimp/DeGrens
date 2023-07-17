import { Core, Events, Inventory, Phone, Vehicles } from '@dgx/server';
import {
  confirmMethRunDropOff,
  finishMethRun,
  handleAnonCall,
  handleEnterMethRunVehicleZone,
  handleItemAddedToDropOffStash,
  handleLeaveMethRunVehicleZone,
  handleLockpickMethRunVehicle,
  payForMethRun,
} from './service.methrun';

Events.onNet('criminal:methrun:pay', payForMethRun);
Events.onNet('criminal:methrun:enterVehicleZone', handleEnterMethRunVehicleZone);
Events.onNet('criminal:methrun:leaveVehicleZone', handleLeaveMethRunVehicleZone);
Events.onNet('criminal:methrun:confirmDropOff', confirmMethRunDropOff);
Events.onNet('criminal:methrun:finish', finishMethRun);

Phone.onPlayerCalledNumber((plyId, phoneNumber, type) => {
  if (type !== 'anon') return;
  handleAnonCall(plyId, phoneNumber);
});

Inventory.onInventoryUpdate(
  'stash',
  (identifier, _, itemState) => {
    if (identifier !== 'methrun_dropoff') return;
    setTimeout(() => {
      handleItemAddedToDropOffStash(itemState.id, itemState.inventory);
    }, 2000);
  },
  'meth_brick',
  'add'
);

Vehicles.onLockpick((plyId, vehicle, type) => {
  if (type !== 'door') return;
  handleLockpickMethRunVehicle(plyId, vehicle);
});

Core.onPlayerUnloaded(plyId => {
  handleLeaveMethRunVehicleZone(plyId);
});
