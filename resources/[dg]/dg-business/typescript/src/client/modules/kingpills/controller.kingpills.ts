import { Events, PolyZone, Core, BaseEvents, Peek } from '@dgx/client';
import { addPeekEntryForBusinessZone } from 'helpers';
import { isEmployee } from 'service/permscache';
import { destroyKingPillsJobZone, buildKingPillsJobZone } from './service.kingpills';

addPeekEntryForBusinessZone('kingpills', 'crafting', false, {
  options: [
    {
      label: 'Start Job',
      icon: 'fas fa-prescription-bottle-pill',
      action: () => {
        Events.emitNet('business:kingpills:startJob');
      },
      canInteract: (_, __, option) => isEmployee(option.data.id),
    },
  ],
});

Peek.addGlobalEntry('ped', {
  options: [
    {
      label: 'Doorzoeken',
      icon: 'fas fa-magnifying-glass',
      action: (_, ent) => {
        if (!ent) return;
        Events.emitNet('business:kingpills:loot', NetworkGetNetworkIdFromEntity(ent));
      },
      canInteract: entity =>
        !!entity && DoesEntityExist(entity) && IsEntityDead(entity) && Entity(entity).state.isKingPillsEnemy,
    },
  ],
});

Events.onNet('business:kingpills:build', buildKingPillsJobZone);
Events.onNet('business:kingpills:destroy', destroyKingPillsJobZone);

PolyZone.onEnter('kingpills_job_zone', () => {
  Events.emitNet('business:kingpills:handlePickupEnter');
});

Core.onPlayerUnloaded(() => {
  destroyKingPillsJobZone();
});

BaseEvents.onResourceStop(() => {
  destroyKingPillsJobZone();
});
