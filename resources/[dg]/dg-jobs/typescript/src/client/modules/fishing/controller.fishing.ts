import { Events, Inventory, Keys, Notifications, Peek, PolyZone } from '@dgx/client';
import {
  setCurrentJobType,
  setFishingVehicle,
  setFishingLocation,
  cleanupFishingJob,
  setInReturnZone,
  finishJob,
  useRod,
} from './service.fishing';

Peek.addFlagEntry('isFishingGuy', {
  options: [
    {
      label: 'Aanmelden - Wagen',
      icon: 'fas fa-pen',
      action: () => {
        Events.emitNet('jobs:fishing:signIn', 'car');
      },
    },
    {
      label: 'Aanmelden - Boot',
      icon: 'fas fa-pen',
      action: () => {
        Events.emitNet('jobs:fishing:signIn', 'boat');
      },
    },
    {
      label: 'Winkel',
      icon: 'fas fa-basket-shopping',
      action: (_, entity) => {
        if (!entity) return;
        Inventory.openShop('fishing_shop');
      },
    },
  ],
  distance: 3.0,
});

Events.onNet('jobs:fishing:start', (vehicleNetId: number, location: Vec3, jobType: Fishing.JobType) => {
  setCurrentJobType(jobType);
  setFishingVehicle(vehicleNetId);
  setFishingLocation(location);
  Notifications.add('Neem het voertuig en rij naar de visplek. Je hebt het voertuig nodig om vis in te gooien.');
});

Events.onNet('jobs:fishing:cleanup', () => {
  cleanupFishingJob();
});

PolyZone.onEnter<{ id: Fishing.JobType }>('fishing_return', (_, { id }) => {
  setInReturnZone(true, id);
});
PolyZone.onLeave<{ id: Fishing.JobType }>('fishing_return', (_, { id }) => {
  setInReturnZone(false, id);
});

Keys.onPressDown('GeneralUse', () => {
  finishJob();
});

Events.onNet('jobs:fishing:useRod', () => {
  useRod();
});
