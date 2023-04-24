import { Events, Inventory, Peek, PolyZone, RayCast, Sync, Weapons } from '@dgx/client';
import {
  buildHuntingZones,
  cleanupHuntingJob,
  enteredHuntingZone,
  leftHuntingZone,
  placeBait,
  startHuntingJob,
} from './service.hunting';
import { ALL_ANIMAL_MODELS } from './constants.hunting';

Peek.addFlagEntry('isHuntingSignIn', {
  options: [
    {
      label: 'Registreer',
      icon: 'fas fa-pen-nib',
      action: () => {
        Events.emitNet('jobs:hunting:signIn');
      },
    },
    {
      label: 'Winkel',
      icon: 'fas fa-basket-shopping',
      action: () => {
        Inventory.openShop('hunting_shop');
      },
    },
    {
      label: 'Verkoop Huid',
      icon: 'fas fa-paw',
      action: () => {
        Inventory.openStash('hunting_sell');
      },
    },
  ],
  distance: 1.5,
});

Events.onNet('jobs:hunting:start', (huntingZones: Hunting.Config['huntingZones']) => {
  startHuntingJob();
  buildHuntingZones(huntingZones);
});

Events.onNet('jobs:hunting:placeBait', (itemId: string, animalModel: string) => {
  placeBait(itemId, animalModel);
});

Events.onNet('jobs:hunting:cleanup', () => {
  cleanupHuntingJob();
});

// Simulate gunshots from sniperrifle but only apply damage on animals
Weapons.onShotFired(weaponItem => {
  if (weaponItem.name !== 'weapon_sniperrifle') return;

  const entity = RayCast.doRaycast(999).entity;
  if (!entity || !DoesEntityExist(entity) || GetEntityType(entity) !== 1) return;

  const model = GetEntityModel(entity);
  if (!ALL_ANIMAL_MODELS.has(model)) return;

  Sync.executeAction('SetEntityHealth', entity, 0);
});

PolyZone.onEnter('jobs_huntingzone', enteredHuntingZone);
PolyZone.onLeave('jobs_huntingzone', leftHuntingZone);
