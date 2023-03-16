import { Events, Peek, UI, Weapons } from '@dgx/client';

import { canRefuel, doRefuel, isHoldingJerryCan } from '../service.fuel';

UI.RegisterUICallback('vehicles:fuel:startRefuel', (data: { netId: number }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  doRefuel(data.netId);
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Tank',
      icon: 'fas fa-gas-pump',
      action: async (_, entity) => {
        if (!entity) return;

        const netId = NetworkGetNetworkIdFromEntity(entity);
        if (isHoldingJerryCan()) {
          doRefuel(netId, true);
          Weapons.removeWeapon(undefined, true);
        } else {
          Events.emitNet('vehicles:fuel:openRefuelMenu', netId);
        }
      },
      canInteract: entity => {
        if (!entity || !NetworkGetEntityIsNetworked(entity)) return false;
        return canRefuel(entity);
      },
    },
  ],
  // higher distance because dist to boot gets checked in canInteract
  // this prevents entry not being enabled because we use raycast hit coord on entity for distancecheck
  // which can scuff when moving around vehicle while keeping raycast center on vehicle
  distance: 10,
});
